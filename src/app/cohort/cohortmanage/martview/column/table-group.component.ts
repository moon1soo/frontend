import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { CohortManageService } from '../../cohort-manage.service';
import {DeleteModal} from "../../../modal/delete-modal.component";
import {TableGroupDialogComponent} from "./table-group-dialog.component";
import {TranslateService} from "@ngx-translate/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AppService} from "../../../../app.service";

declare const $: any;

@Component({
 	selector: 'table-group',
	templateUrl: './table-group.component.html'
})

export class TableGroupComponent implements OnInit {
	dataSource: any;
	TBL_ID: string;

  trans: any = {
    inputSuffix: null,
    inputPsoCnte: null,
    inputPrcCnte: null,
    saved: null,
    save: null,
    suffixDuplication: null,
    failed: null,
    delete: null,
  };
  txt: any = {
    inputSuffix: 'cohort.mart.table.input.suffix',
    inputPsoCnte: 'cohort.mart.table.input.pso_cnte',
    inputPrcCnte: 'cohort.mart.table.input.prc_cnte',
    saved: 'cohort.saved',
    save: 'cohort.save',
    suffixDuplication: 'cohort.mart.suffix-duplication',
    failed: 'cohort.failed',
    delete: 'cohort.mart.table.group.delete'
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
      this.loadData();
    });
    this._cohortManageService.selectedMartId$.subscribe(res => {
      this.dataSource = null;
    });
  }

  ngOnInit() {
	}

	resizeArea() {
  }

  loadData() {
    this.resizeArea();
    this._cohortManageService.loadMartTableGroups().subscribe(res => {
      this.dataSource = res.data;
    });
  }


  addGroup() {
    const modalRef = this._modalService.open(TableGroupDialogComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      TBL_ID: this.TBL_ID,
      MODE: 'add'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        this.loadData();
      }
    }, (reason) => {
      console.log(`Dismissed ${reason}`);
    });
  }

  editGroup(idx) {
    const modalRef = this._modalService.open(TableGroupDialogComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      GRP_ID: this.dataSource[idx].GRP_ID,
      TBL_ID: this.dataSource[idx].TBL_ID,
      GRP_NM: this.dataSource[idx].GRP_NM,
      GRP_SORT: this.dataSource[idx].GRP_SORT,
      GRP_CNTE: this.dataSource[idx].GRP_CNTE,
      MODE: 'edit'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        this.loadData();
      }
    }, (reason) => {
      console.log(`Dismissed ${reason}`);
    });
  }

  deleteGroup(idx) {
    const modalRef = this._modalService.open(DeleteModal);
    modalRef.componentInstance.data = this.dataSource[idx].GRP_NM + this.trans['delete'];
    modalRef.result.then((result) => {
      if (result === 'Confirm') {
        this._cohortManageService.deleteMartTableGroup(this.dataSource[idx]).subscribe(res => {
          if(res) {
//            notify({message: this.trans['inputSuffix'], position: {my: 'Top', at: 'Top'}}, 'Warning', 2000);
            this.loadData();
          }
        });
      }
    }, (reason) => {
      console.log(`Dismissed ${reason}`);
    });
  }


}
