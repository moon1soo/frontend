import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


import {CohortManageService} from "../../cohort-manage.service";
import {DxDataGridComponent} from "devextreme-angular";
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import {TranslateService} from "@ngx-translate/core";
import {AppService} from "../../../../app.service";
import {TableDialogComponent} from "./table-dialog.component";
import {DeleteModal} from "../../../modal/delete-modal.component";


declare const $: any;

@Component({
 	selector: 'mart-table',
	templateUrl: './table.component.html'
})

export class TableComponent implements OnInit {
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

  onRowClick(tbl_id,tbl_sfx) {
    this._cohortManageService.emitSelectedTableId( tbl_id, tbl_sfx );
  }

/*
  onRowClick(event: any) {
    this._cohortManageService.emitSelectedTableId( event.data.TBL_ID );
  }
*/
  loadData() {
    this._cohortManageService.loadMartTables().subscribe(res => {
      this.dataSource = res.data;
    });
  }

  onCellPrepared(e) {
/*
    if (e.rowType == 'detail' && e.column.command === "detail") {
    }
*/
  }

  onRowUpdated(e) {
    var cnt = 0;
    var sql = '';
    for(var j in e.data ) {
      if( cnt++ > 0 )
        sql += ',';
      sql += j;
      if( typeof(e.data[j]) == 'number' ) {
        sql += '=' + e.data[j];
      } else if( typeof(e.data[j]) == 'boolean' ) {
        if(e.data[j] == true) {
          sql += '=' + '1';
        } else {
          sql += '=' + '0';
        }
      } else {
        sql += '=\'';
        sql += e.data[j];
        sql += '\'';
      }
    }
  }

  onEditorPrepared(e) {
    if( e.dataField == 'TBL_SFX' ) {
      if( e.value ) {
        e.editorElement.find("input").prop('readonly', true);
        e.editorElement.find("input").css('color','darkgray');
        e.editorElement.find("input").css('border','1px solid rgba(251, 245, 245, 0.85)');
      } else {
        e.editorElement.find("input").prop('readonly', false);
        e.editorElement.find("input").css('color','#292e32');
        e.editorElement.find("input").css('border','1px solid rgba(191, 191, 191, 0.85)');
      }
    }
    if( e.dataField == 'LOAD_DTM' ) {
      e.editorElement.find("[aria-readonly=\"true\"]").css('color','darkgray');
      e.editorElement.find("[aria-readonly=\"true\"]").css('border','1px solid rgba(251, 245, 245, 0.85)');
    }
/*
    console.log(e);
    var form = e.element;
    var inputs = form.parent().find(".dx-texteditor-input");
    console.log(inputs);
    inputs[0].prop('readonly', true);
    inputs = form.parent().find("[aria-readonly=\"true\"]");
    inputs.each(function(index){
      $(this).css('color','darkgray');
      $(this).css('border','1px solid rgba(251, 245, 245, 0.85)');
    })
*/
  }

  onInitNewRow(e) {
  }

  onRowValidating(e){
    if( !e.newData.TBL_SFX ) {
      e.isValid = false;
      notify({message: this.trans['inputSuffix'], position: {my: 'Top', at: 'Top'}}, 'Warning', 2000);
    } else if( !e.newData.PSO_CNTE ) {
      e.isValid = false;
      notify({message:this.trans['inputPsoCnte'],position:{my:'Top',at:'Top'}}, 'Warning', 2000);
    } else if( !e.newData.PRC_CNTE ) {
      e.isValid = false;
      notify({message:this.trans['inputPrcCnte'],position:{my:'Top',at:'Top'}}, 'Warning', 2000);
    }
    e.isValid = false;
/*
    new Promise((resolve, reject) => {
      this._cohortManageService.addMartTable(e.newData).subscribe(res => {
        console.log('result received ');
        console.log(res);
        if( res.result == 'suffixDuplication' ) {
          notify({message:this.trans['suffixDuplication'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
          e.isValid = true;
        } else if( res.result == "failed") {
          notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        } else {
          notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
          e.isValid = true;
        }
      });
    });
*/

    let d = jQuery.Deferred();
    this._cohortManageService.addMartTable(e.newData).then(res =>{
      if( res.result == 'suffixDuplication' ) {
        notify({message:this.trans['suffixDuplication'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        d.resolve(false);
      } else if( res.result == "failed") {
        notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        d.resolve();
      } else {
        notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
        d.resolve(true);
      }

    })
    e.isValid = d.promise();
//e.cancel = true;
/*
    Promise.resolve(this._cohortManageService.addMartTable(e.newData))
      .then(res => {
        console.log('result received ');
        console.log(res);
          if( res.result == 'suffixDuplication' ) {
            notify({message:this.trans['suffixDuplication'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
            e.isValid = false;
          } else if( res.result == "failed") {
            notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
          } else {
            notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
            e.isValid = true;
          }
        }
      );
*/
  }

  onRowRemoving(e) {
/*
    var result = confirm("Are you sure?", "Confirm changes");
    result.done(function (dialogResult) {
      alert(dialogResult ? "Confirmed" : "Canceled");
    });
*/
  }

  onToolbarPreparing(e) {
    var toolbarItems = e.toolbarOptions.items;
    // Modifies an existing item
    toolbarItems.forEach(function(item) {
      if (item.name === "addRowButton") {
        item.options.disabled = true;
        // Change the item options here
      }
    });
  }
}
