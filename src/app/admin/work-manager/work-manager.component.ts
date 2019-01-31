import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {WorkManagerService} from './work-manager.service';
import {AppState} from '../../app.state';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {WorkManagerModalComponent} from './work-manager-modal.component';
import {StompConfig, StompService, StompState} from "@stomp/ng2-stompjs";
import {Subject} from "rxjs/Subject";

@Component({
  selector : 'work-manager',
  providers : [WorkManagerService],
  templateUrl : './work-manager.component.html'
})

export class WorkManagerComponent implements OnInit, OnDestroy {

  @Output() select = new EventEmitter();

  loading: boolean = false;
  onSubscribe: boolean = false;

  serverData: any[] = [];
  serverHandler: any = {};
  private serverDataSubject = new Subject<any>()
  serverDataSubject$ = this.serverDataSubject.asObservable();

  constructor(
    private _service: WorkManagerService,
    private _app: AppState,
    private _modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.postConstructor();
  }

  ngOnDestroy(): void {
    this.preDestroy();
  }

  onContentReady(e) {
    e.component.option('loadPanel.enabled', false);
  }

  /* Component 시작 */
  postConstructor() {
    /************************************************************************
     // 향후 서버 WebSocket에 대한 웹서버 Proxy 구성이 정상적으로 된다면
     // properties 에 정의된 서버 host 를 참조할 수 있도록 아래 주석을 제거해준다.
    this.loading = true;
    this._service.getServerList().subscribe(data => {
      this.setServer(data);
      this.loading = false;
    });
     ************************************************************************/
    this.setServer(['supreme.snuh.org']);
  }

  setServer(data){
    for(const item of data) {
      // const _lazy = new Subject<any>();
      const _stomp = this.connectStomp(item);
      // if(!_stomp.connected()) continue;
      this.serverHandler[item] = {
        stomp: _stomp
        // , dataLazy: _lazy
        // , lazy$ : _lazy.asObservable()
      };
      this.serverData.push({
        name : item, data: []
      });
    }
  }

  /* Component 종료처리 */
  preDestroy() {
    for(const serverItem of this.serverData) {
      if(this.serverHandler[serverItem.name] && this.serverHandler[serverItem.name].stomp.connected()) {
        let sessionId: string = sessionStorage.getItem('sessionId');
        const param = {'sessionId' : sessionId};
        this.serverHandler[serverItem.name].stomp.publish('/app/work/manager/removeMessageListener', JSON.stringify(param));
        this.serverHandler[serverItem.name].stomp.disconnect();
      }
    }
  }

  /* 상세화면(Modal) 띄우기 */
  showServerModal(serverName: string) {
    valid : {
      const targetServer = this.serverData.filter(item => item['name'] === serverName)[0];
      if(!this.serverHandler[targetServer.name] || !this.serverHandler[targetServer.name].stomp.connected()) break valid;
      const modalRef = this._modalService.open(WorkManagerModalComponent, {
        size: 'lg',
        windowClass: 'large-modal'
      });

      modalRef.componentInstance.serverName = serverName;
      // modalRef.componentInstance.serverLazy$ = this.serverHandler[targetServer.name]['lazy$'];
      modalRef.componentInstance.serverLazy$ = this.serverDataSubject$;//this.serverHandler[targetServer.name]['lazy$'];
      modalRef.componentInstance.stomp = this.serverHandler[targetServer.name]['stomp'];
    }
  }

  /* 서버 데이터 갱신('stomp' 연결여부 롹인) */
  serverRefresh() {
    for(const item of this.serverData){
      if(!this.serverHandler[item.name]) continue;
      let sessionId: string = sessionStorage.getItem('sessionId');
      const param = {'sessionId' : sessionId};
      this.serverHandler[item.name].stomp.publish('/app/work/manager/updateMessage', JSON.stringify(param));
    }
  }

  /* 서버 웹소켓 연결 */
  connectStomp(name: string) {
    let sessionId: string = sessionStorage.getItem('sessionId');
    let _url : string = this._app.socketUrl;
    if(name !== 'supreme.snuh.org') {
      _url = _url.replace('/wsep/', `/wsep-${name}/`);
    }

    let srvConfig : StompConfig = {
        url : _url
      , headers : {login: sessionId, passcode: sessionId, serverName: name}
      , heartbeat_in: 3000
      , heartbeat_out: 3000
      , reconnect_delay: 0
      , debug : false
    };

    let  stompService = null;
    try {
      stompService = new StompService(srvConfig);
      stompService.connectObservable.subscribe(stateCode=>{
        switch(stateCode){
          case StompState.CONNECTED :
            stompService.subscribe(`/user/${sessionId}/work/manager/message`).map((message)=>{return message.body;}).subscribe( (res)=> {
              var resultData = JSON.parse(res);
              for(const serverItem of this.serverData) {
                // if(serverItem.name === name) {
                if(serverItem.name === name) {
                  serverItem.data = resultData;
                  // this.serverHandler[name].dataLazy.next(resultData);
                }
                this.serverDataSubject.next(this.serverData);
              }
            });

            const body = {'sessionId' : sessionId};
            stompService.publish('/app/work/manager/addMessageLIstener', JSON.stringify(body));
            break;
          }
      });
    } catch (e) {
      console.log("[ERROR]")
      console.error(e);
    }
    return stompService;
  }
}
