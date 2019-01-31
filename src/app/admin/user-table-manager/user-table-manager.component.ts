import {Component, EventEmitter, OnInit, Output, Renderer, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {DxDataGridComponent} from 'devextreme-angular';
import {AppState} from '../../app.state';
import {UserTableManagerService} from './user-table-manager.service';
import 'devextreme/integration/jquery';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {UserTableErrorModalComponent} from './user-table-error-modal.component';
import {TranslateService} from '@ngx-translate/core';

declare const $: any;

@Component({
  selector : 'user-table-manager'
  , templateUrl : './user-table-manager.component.html'
  , providers : [UserTableManagerService]
})

export class UserTableManagerComponent implements OnInit {

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @Output() select = new EventEmitter();

  loading: boolean = false;
  curUrl: string;
  allMode: boolean = false;
  lockEntityVisible: boolean = false;

  dataSource: any[] = [];

  currentPage: number  = 1;
  onLast: boolean = false;

  scrollTop: number = 0;

  private onLazy = new Subject<any>();
  onLazy$ = this.onLazy.asObservable();
  selectedRowCount = 0;
  constructor(
    private _translate: TranslateService,
   private _service: UserTableManagerService,
    private _app: AppState,
   private _modalService: NgbModal
  ) {
  }
  ngOnInit(): void {
    this.loadData();
    this.onLazy$.subscribe(res => {
      this.scrollTop = res;
      const currentScroll = this.scrollTop / $('.dx-scrollable-content').height() * 100;
      if (!this.loading && currentScroll > 90) {
        this.currentPage = this.currentPage + 1;
        this.loadData();
      }
    });
  }
  onContentReady(e) {
    e.component.option('loadPanel.enabled', false);
    this.onScroll(e, this.onLazy);
  }
  onScroll(e, onLazy) {
    if (e.component.getScrollable()) {
      e.component.getScrollable().on('scroll', function(options) {
        onLazy.next(options.scrollOffset.top);
      });
    }
  }
  onSelectionChanged(e) {
    this.selectedRowCount = this.dataGrid.selectedRowKeys.length;
  }
  onCellPrepared(e) {
    // 비활성화 태이블 선택제한
    if (e.rowType === 'data' && e.column.command === 'select' && e.data.tableActiveYn === 'Y' ) {
      e.cellElement.find('.dx-select-checkbox').dxCheckBox('instance').option('disabled', true);
      e.cellElement.off();
    }
  }
  selectAll() {
    const disabledRows = this.dataSource.filter(t => t.tableActiveYn !== 'Y');
    this.dataGrid.instance.selectRows(disabledRows, true);
  }
  loadData() {
    this.loading = true;
    this._service.getUserTableList(this.currentPage).subscribe(res => {
      setTimeout(() => {
        this.loading = false;
        this.dataGrid.noDataText = this._app.tableText.noData;
      }, 800);

      if (this.dataSource.length > 0) {
        this.dataSource = this.dataSource.concat(res.resultData);
      } else {
        this.dataSource = res.resultData;
      }
      this.loading = false;
    });
  }
  reset() {
    this.dataSource = [];
    this.loadData();
  }

  drop() {
    this.loading = true;
    this._service.dropUserTable(this.dataGrid.selectedRowKeys).subscribe(res => {
      if (res.lockEntitys && res.lockEntitys.length > 0) {
        this.lockEntityVisible = true;
        const modalRef = this._modalService.open(UserTableErrorModalComponent);
        modalRef.componentInstance.data = res;
      }
      this.reset();
    });
  }

};
