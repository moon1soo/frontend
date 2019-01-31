import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {DxDataGridComponent} from 'devextreme-angular';
import {ErrorLogService} from './error-log.service';
import {AppState} from '../../app.state';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorLogDetailModalComponent} from './error-log-detail-modal.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector : 'error-log'
  , templateUrl : './error-log.component.html'
  , providers : [ErrorLogService]
})

export class ErrorLogComponent implements OnInit {

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @Output() select = new EventEmitter();

  loading: boolean = false;
  dataSource: any[] = [];

  currentPage: number  = 1;
  onLast: boolean = false;

  scrollTop: number = 0;

  private onLazy = new Subject<any>();
  onLazy$ = this.onLazy.asObservable();

  constructor(
    private _translate: TranslateService,
    private _service: ErrorLogService,
    private _modalService: NgbModal,
    private _app: AppState
  ) {
  }
  ngOnInit(): void {
    this.loadData();
    this.onLazy$.subscribe(res => {
        this.scrollTop = res;
        if (!this.loading && this.scrollTop > this.currentPage * 1750) {
          this.currentPage = this.currentPage + 1;
          this.loadData();
        }
    });
  }
  onContentReady(e) {
    e.component.option('loadPanel.enabled', false);
    this.onScroll(e, this.onLazy);
  }
  onRxRowClick(g){
    const modalRef = this._modalService.open(ErrorLogDetailModalComponent, {
      size: 'lg',
      windowClass: 'large-modal'
    });
    modalRef.componentInstance.data = g.data;
    // (<ErrorLogDetailModalComponent>modalRef.componentInstance).loadData();
  }
  onScroll(e, onLazy) {
    if (e.component.getScrollable()) {
      e.component.getScrollable().on('scroll', function(options) {
        onLazy.next(options.scrollOffset.top);
      });
    }
  }
  // ErrorLog 목록 조회
  loadData() {
    this.loading = true;
    this._service.getErrorLogList(this.currentPage).subscribe(res => {
      setTimeout(() => {
        this.loading = false;
        this.dataGrid.noDataText = this._app.tableText.noData;
      }, 800);

      this.onLast = res.last;

      if (this.dataSource.length > 0) {
        this.dataSource = this.dataSource.concat(res.resultData);
      } else {
        this.dataSource = res.resultData;
      }
      this.loading = false;
    });
  }
};
