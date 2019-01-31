import {Component, Input, OnInit} from '@angular/core';
import {AppState} from '../../app.state';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs/Observable';
import {StompService} from '@stomp/ng2-stompjs';

@Component({
  selector : 'work-manager-modal',
  templateUrl : './work-manager-modal.component.html'
})

export class WorkManagerModalComponent implements OnInit {

  @Input() serverName: string;
  @Input() serverLazy$: Observable<any>;
  @Input() stomp: StompService;

  dataSource: any = {workGroup: [], work: [], errorLog: []};
  private sessionId: string = sessionStorage.getItem('sessionId');
  rate: any = {
    executorActive : 0, usedMemory : 0
    , maxMemory : 0, totalMemory : 0, freeMemory : 0
    , coreExecutor : 0, maxExecutor : 0, activeExecutor : 0
  };

  constructor(
    public _activeModal: NgbActiveModal,
    private _app: AppState
  ) {}

  ngOnInit(): void {
    this.serverLazy$.subscribe(data => {
      for (const item of data) {
        if (this.serverName === item.name) {
          const res = item.data;
          this.rate.usedMemory = (( res['totalMemorySize'] - res['freeMemorySize'] ) / res['maxMemorySize'] )  * 100;
          this.rate.executorActive = (res['poolActiveSize'] / res['poolMaxSize']) * 100;
          this.rate.maxExecutor = res['poolMaxSize'] || 0;
          this.rate.maxMemory = res['maxMemorySize'] || 0;
          this.rate.activeExecutor = res['poolActiveSize'] || 0;
          this.rate.coreExecutor = res['poolCoreSize'] || 0;
          this.rate.freeMemory = res['freeMemorySize'] || 0;
          this.rate.totalMemory = res['totalMemorySize'] || 0;

          const workGroupList: any[] = [], workList: any[] = [], errorList: any[] = [];

          for (const tmp of res['workGroupMessage']) {
            workGroupList.push({'name' : tmp['name'], 'status' : tmp['status']});
            for (const workTmp of tmp['workList']){
              workList.push({'workIndex' : workTmp['workIndex']
                , 'workName' : workTmp['workName']
                , 'status' : workTmp['workAvailabilityStatusDesc']
                , 'createDate' : workTmp['startDate']
                , 'rate' : workTmp['rate']
              });
            }

            if (tmp['errorList']) {
              for (const workHistoryTmp of tmp['errorList']) {
                errorList.push({
                  'errLogId' : workHistoryTmp['errLogId']
                  , 'ocurTm' : workHistoryTmp['ocurTm']
                  , 'errTp' : workHistoryTmp['errTp']
                });
              }
            }
          }

          this.dataSource.workGroup = workGroupList;
          this.dataSource.work = workList;
          this.dataSource.errorLog = errorList;
        }
      }
    });
    this.serverRefresh();
  }

  onContentReady(e) {
    e.component.option('loadPanel.enabled', false);
  }

  serverRefresh() {
    const param = {'sessionId' : this.sessionId};
    this.stomp.publish('/app/work/manager/updateMessage', JSON.stringify(param));
  }

  destroyWorkGroup(component: any) {
    const param = {'name' : component.data['name']};
    this.stomp.publish('/app/work/manager/destroy', JSON.stringify(param));
  }

  cancelWork(component: any) {
    const param = {'workName' : component.data['workName'], 'workIndex': component.data['workIndex'] };
    this.stomp.publish('/app/work/manager/cancel', JSON.stringify(param));
  }

}
