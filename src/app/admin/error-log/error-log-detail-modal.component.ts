import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ErrorLogService} from './error-log.service';
import {DxDataGridComponent} from 'devextreme-angular';
import {AppState} from '../../app.state';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector : 'error-log-detail-modal'
  , templateUrl : './error-log-detail-modal.component.html'
  , providers : [ErrorLogService]
})

export class ErrorLogDetailModalComponent implements OnInit {

  loading: boolean = false;
  dataSource: any[] = [];
  data: any;

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @Output() select = new EventEmitter();

  constructor(
    private _service: ErrorLogService,
    private _app: AppState,
    public _activeModal: NgbActiveModal,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  onContentReady(e) {
    e.component.option('loadPanel.enabled', false);
  }
  // set 지표
  public setData(arg: any): void {
    this.data = arg.data;
    this.loadData();
  }

  // ErrorLog 조회
  public loadData(): any {
    const errLogId: string = this.data.errLogId;
    this._service.getErrorLogDetail(errLogId).subscribe(res => {
      // binding.
      this.data.errMsg = res.errMsg;
      this.data.prmr = res.prmr;
      this.data.exclSql = res.exclSql;
      this.dataSource = res.reschErrLogDetailList;
    });
  }
  onRxRowClick(event): void {

  }
}
