import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { CohortManageService } from '../../cohort-manage.service';
import {DeleteModal} from "../../../modal/delete-modal.component";
import {TableColumnDialogComponent} from "./table-column-dialog.component";
import {TranslateService} from "@ngx-translate/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AppService} from "../../../../app.service";
import {TableColumnRegexpDialogComponent} from "./table-column-regexp-dialog.component";

declare const $: any;

@Component({
 	selector: 'table-column',
	templateUrl: './table-column.component.html'
})

export class TableColumnComponent implements OnInit {
	dataSource: any;

	TBL_ID: string;
  TBL_SFX: string;

  trans: any = {
    saved: null,
    save: null,
    suffixDuplication: null,
    failed: null,
    delete: null,
  };
  txt: any = {
    saved: 'cohort.saved',
    save: 'cohort.save',
    suffixDuplication: 'cohort.mart.suffix-duplication',
    failed: 'cohort.failed',
    delete: 'cohort.mart.table.column.delete'
  };

  constructor(
    private _cohortManageService: CohortManageService,
    private _translate: TranslateService,
    private _appService: AppService,
    private _modalService: NgbModal,
  ) {
    this._translate.use(this._appService.langInfo);
    for(let key of Object.keys(this.txt)) {
      if(this.txt[key]) {
        this._translate.get(this.txt[key]).subscribe(res => {
          this.trans[key] = res;
        });
      }
    }
    this._cohortManageService.selectedTableId$.subscribe(res => {
      this.TBL_ID = res;
      this.TBL_SFX = this._cohortManageService.getTableSfx();
      this.loadData();
    });
    this._cohortManageService.selectedMartId$.subscribe(res => {
      this.dataSource = null;
    });
    this._cohortManageService.tabRefresh$.subscribe(res => {
      this.dataSource = [];
    });
	}

  ngOnInit() {
	}

	resizeArea() {
  }

  loadData() {
    this.resizeArea();
    this._cohortManageService.loadMartTableColumn().subscribe(res => {
      this.dataSource = res.data;
    });
  }


  addColumn() {
    const modalRef = this._modalService.open(TableColumnDialogComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      TBL_ID: this.TBL_ID,
      TBL_SFX: this.TBL_SFX,
      CHT_ID: this._cohortManageService.getSelectedCohort().CHT_ID,
      MODE: 'add'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        this.loadData();
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }

  manageColumn(idx) {
    const modalRef = this._modalService.open(TableColumnRegexpDialogComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      COL_ID: this.dataSource[idx].COL_ID,
      COL_NM: this.dataSource[idx].COL_NM,
      MODE: 'manage'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        this.loadData();
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }


  deleteColumn(idx) {
    const modalRef = this._modalService.open(DeleteModal);
    modalRef.componentInstance.data = this.dataSource[idx].COL_NM + this.trans['delete'];
    modalRef.result.then((result) => {
      if (result === 'Confirm') {
        this._cohortManageService.deleteMartTableColumn(this.dataSource[idx]).subscribe(res => {
          if(res) {
//            notify({message: this.trans['inputSuffix'], position: {my: 'Top', at: 'Top'}}, 'Warning', 2000);
            this.loadData();
          }
        });
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }

  editColumn(idx) {
    const modalRef = this._modalService.open(TableColumnDialogComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      COL_ID: this.dataSource[idx].COL_ID,
      TBL_ID: this.dataSource[idx].TBL_ID,
      TBL_SFX: this.TBL_SFX,
      CHT_ID: this._cohortManageService.getSelectedCohort().CHT_ID,
      COL_NM: this.dataSource[idx].COL_NM,
      COL_GRP: this.dataSource[idx].COL_GRP,
      COL_TP: this.dataSource[idx].COL_TP,
      COL_SIZE: this.dataSource[idx].COL_SIZE,
      COL_SRC: this.dataSource[idx].COL_SRC?this.dataSource[idx].COL_SRC:'',
//      COL_SHARE: this.dataSource[idx].COL_SHARE,
      COL_VISIBLE: this.dataSource[idx].COL_VISIBLE=='Y'?true:false,
      COL_SORT: this.dataSource[idx].COL_SORT,
      COL_ANONYMOUS: this.dataSource[idx].COL_ANONYMOUS=='Y'?true:false,
      COL_EDIT: this.dataSource[idx].COL_EDIT=='Y'?true:false,
      COL_ISPK: this.dataSource[idx].COL_ISPK=='Y'?true:false,
      COL_CNTE: this.dataSource[idx].COL_CNTE,
      MODE: 'edit'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        this.loadData();
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }

}
