import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


import {CohortManageService} from "../../cohort-manage.service";
import {DxDataGridComponent} from "devextreme-angular";
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import {TranslateService} from "@ngx-translate/core";
import {AppService} from "../../../../app.service";
import {OwnerDialogComponent} from "./owner-dialog.component";
import {DeleteModal} from "../../../modal/delete-modal.component";


declare const $: any;

@Component({
 	selector: 'mart-owner',
	templateUrl: './owner.component.html'
})

export class OwnerComponent implements OnInit {
  dataSource: any[] = [];
  CHT_ID: string;

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
    delete: 'cohort.mart.table.delete'
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

    this._cohortManageService.selectedMartId$.subscribe(res => {
      this.CHT_ID = res;
      this.loadData();
    });
  }

  ngOnInit() {
  }

  addOwner() {
    const modalRef = this._modalService.open(OwnerDialogComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
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

  ownerDelete(idx) {
    const modalRef = this._modalService.open(DeleteModal);
    modalRef.componentInstance.data = this.dataSource[idx].OWNER_STF_NM + ' Owner ';
    modalRef.result.then((result) => {
      if (result === 'Confirm') {
        this._cohortManageService.deleteMartOwner(this.dataSource[idx]).subscribe(res => {
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

  loadData() {
    this._cohortManageService.loadMartOwner().subscribe(res => {
      this.dataSource = res.data;
    });
  }

  /*
    addTable() {
      const modalRef = this._modalService.open(TableDialogComponent);
      modalRef.componentInstance.data = {
        title: '',
        content: '',
        CHT_ID: this.CHT_ID,
        MODE: 'add'
      };
      modalRef.result.then((result) => {
        if (result !== 'no') {
          this._cohortManageService.emittabRefresh();
          this.loadData();
        }
      }, (reason) => {
        console.log(`Dismissed ${reason}`);
      });
    }

    tableDelete(idx) {
      const modalRef = this._modalService.open(DeleteModal);
      modalRef.componentInstance.data = this.dataSource[idx].TBL_SFX + this.trans['delete'];
      modalRef.result.then((result) => {
        if (result === 'Confirm') {
          this._cohortManageService.deleteMartTable(this.dataSource[idx]).subscribe(res => {
            if(res) {
  //            notify({message: this.trans['inputSuffix'], position: {my: 'Top', at: 'Top'}}, 'Warning', 2000);
              this._cohortManageService.emittabRefresh();
              this.loadData();
            }
          });
        }
      }, (reason) => {
        console.log(`Dismissed ${reason}`);
      });
    }

    tableEdit(idx) {
      const modalRef = this._modalService.open(TableDialogComponent);

      modalRef.componentInstance.data = {
        title: '',
        content: '',
        CHT_ID: this.CHT_ID,
        TBL_ID: this.dataSource[idx].TBL_ID,
        TBL_SFX: this.dataSource[idx].TBL_SFX,
        PSO_CNTE: this.dataSource[idx].PSO_CNTE,
        PRC_CNTE: this.dataSource[idx].PRC_CNTE,
  //      TBL_SHARE: this.dataSource[idx].TBL_SHARE,
        TBL_SORT: this.dataSource[idx].TBL_SORT,
        MODE: 'edit'
    };
      modalRef.result.then((result) => {
        if (result !== 'no') {
          this._cohortManageService.emittabRefresh();
          this.loadData();
        }
      }, (reason) => {
        console.log(`Dismissed ${reason}`);
      });
    }
  */

}
