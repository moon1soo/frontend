import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent, DxLoadPanelModule } from 'devextreme-angular';

import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { AppService } from "../../app.service";
import { AppState } from '../../app.state';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';


import { CohortShareService, Approval } from './cohort-share.service';
import CustomStore from "devextreme/data/custom_store";
// import { DeleteModal } from '../../modal/delete-modal.component';

@Component({
    selector: 'cohort-share',
    templateUrl: './cohort-share.component.html',
    providers: [ CohortShareService ]
})
export class CohortShareComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @Output() select = new EventEmitter();

  loading: boolean = true;
  dataSource: any;
  totalStr: string = '0';
  sizePerSizeStr: string = '0';

  approval: Approval[];

  selectApvTxt : string;
  constructor(
      private _modalService: NgbModal,
      private _service: CohortShareService,
      private _translate: TranslateService,
      private _router: Router,
      private _appService: AppService,
      private _app: AppState
  ) {}
  ngOnInit() {
    this.approval = this._service.getApproval();
    this._translate.use(this._appService.langInfo);
    this._appService.language$.subscribe(res => {
      this._translate.use(res);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
    this.loadData();

    this._translate.get('cohort.requestShare.apv-select').subscribe(res => {
      this.selectApvTxt = res;
    });
  }
  onContentReady(e) {
    e.component.option("loadPanel.enabled", false);
  }
  onCellPrepared(e) {
    if (e.rowType == 'detail' && e.column.command === "detail") {
/*
//      var $btn = $(e.cellElement.querySelector(".dx-datagrid-form-buttons-container").querySelector(".dx-button-content"));
      var vv = 0;
    $.each(e.cellElement.find(".dx-button-content"), function(k, v) {
      var t = v.toString();
      if( t.indexOf('<span class="dx-button-text">Save</span>')) {
        vv = parseInt(k);
      }

    });
      var $btn = $(e.cellElement.find(".dx-button-content")[vv]);


//      var $btn = $(e.cellElement.find(".dx-button-content")).first();
      console.log($btn);
      $btn.on('click',() => {
        console.log('clicked');
        var row = e.row.data;
        if( row.APV == null ) {
          alert(this.selectApvTxt);
          return false;
        } else {
          this._service.updateRequestShareCohort(row).subscribe(res => {
            this.dataSource = [];
            this.currentPage = 1;
            this.loadData();
          });
        }
      });
*/
/*
      var form = e.element;
      var btn = form.parent().find("[aria-label='Save']");
      btn.dxButton("instance").option("onClick",() => {
        var row = e.row.data;
        if( row.APV == null ) {
          alert(this.selectApvTxt);
          return false;
        } else {
          console.log(row);
          this._service.updateRequestShareCohort(row).subscribe(res => {
            this.dataSource = [];
            this.currentPage = 1;
            this.loadData();
          });
        }

      });
*/
      var form = $(e.cellElement);
      var btn = form.find("[aria-label='Save']");
      btn.on('click',() => {
        var row = e.row.data;
        if( row.APV == null ) {
          alert(this.selectApvTxt);
          return false;
        } else {

          this._service.updateRequestShareCohort(row).subscribe(res => {
            this.loadData();
          });
        }
      });
    }
  }

  onToolbarPreparing (e) {
    var toolbarItems = e.toolbarOptions.items;
    $.each(toolbarItems, function(_, item) {
      if(item.name === "saveButton") {
        item.options.onClick = function (e) {
//          alert('Custom Save');
//          e.component.saveEditData();
        }
      }
    });
  }
  onRowUpdated(e) {
  }
  onRowUpdating(e) {
  }

  initValue() {
    this.dataSource = {};
    this.dataSource.store = new CustomStore({
      load: (loadOptions: any) => {
        console.log(loadOptions);
        return new Promise((resolve, reject) => {
          this._service.requestShareCohortList( loadOptions.skip, loadOptions.take, loadOptions.sort ).subscribe((res) => {
            this.sizePerSizeStr =  this.addComma(( loadOptions.skip + res.data.length ).toString());
            resolve( res.data );
            setTimeout(() => {
              this.loading = false;
              this.dataGrid.noDataText = this._app.tableText.noData;
            }, 800);
          }, (error) => {
            reject(error);
          });
        })
      }
    });
  }

  loadData() {
    this.totalStr = '0';
    this.sizePerSizeStr = '0';
    this.dataGrid.noDataText = this._app.tableText.load;
    this.loading = true;
    this._service.countRequestShareCohort().subscribe(res => {
      this.totalStr = this.addComma(res.total);
      this.initValue();
    });
  }

  addComma(nm) {
    return nm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

}
