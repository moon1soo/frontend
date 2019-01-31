import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import * as _ from 'lodash';
import {RegularExpressionService} from "./regular-expression.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {CategoryComponent} from "./category-dialog.component";
import {RgepDialogComponent} from "./rgep-dialog.component";
import {DeleteModal} from "../../modal/delete-modal.component";
import {ConfirmModal} from "../../modal/confirm-modal.component";
import {TranslateService} from "@ngx-translate/core";
import {AppService} from "../../../app.service";
import notify from "devextreme/ui/notify";

@Component({
  selector: 'regular-expression.component-view',
  templateUrl: './regular-expression.component.html',
  providers: [RegularExpressionService]

})
export class RegularExpressionComponent implements OnInit, AfterViewInit {

  regexpCategory: string;
  regularCategoryName: string;
  regexpCategorys: any = [];
  regexp: string;
  rgepName: string;
  regexps: any = [];
  selectedIdx: number = 0;

  trans: any = {
    saved: null,
    save: null,
    failed: null,
    category_delete: null,
    rgep_delete: null,
    rgep_save: null
  };
  txt: any = {
    saved: 'cohort.saved',
    save: 'cohort.save',
    failed: 'cohort.failed',
    category_delete: 'cohort.mart.table.regularExpress.category.dlg-title',
    rgep_delete: 'cohort.mart.table.regularExpress.rgep.dlg-title',
    rgep_save: 'cohort.mart.table.regularExpress.rgep.save'
  };

  constructor(
    public _service: RegularExpressionService,
    private _modalService: NgbModal,
    private _translate: TranslateService,
    private _appService: AppService,
  ) {
    this._translate.use(this._appService.langInfo);
    for(let key of Object.keys(this.txt)) {
      if(this.txt[key]) {
        this._translate.get(this.txt[key]).subscribe(res => {
          this.trans[key] = res;
        });
      }
    }
  }

  ngOnInit() {
    this.getRegexpCategory();
  }

  ngAfterViewInit() {
  }

  initValue(){
  }

  loadData(){
    this.getRegexpCategory();
    this.regexps = [];
    this.regexpCategory = '';
    this.regularCategoryName = '';
  }

  getRegexpCategory() {
    this.regexpCategorys = [];
    this.regexpCategory = '';
    this.regexp = '';
//    this.regexpCategorys.push({CTG_CD:'',CTG_NM:'Select..'});
    this._service.getRegexpCategory().subscribe(res => {
      for (let data of res.result) {
        this.regexpCategorys.push({
          CTG_CD: data.CTG_CD,
          CTG_NM: data.CTG_NM,
          CTG_CNTE: data.CTG_CNTE,
          LOAD_DTM: data.LOAD_DTM,
        });
      }
    });
  }

  onRowClick(val,name) {
    this.regexp = '';
    this.regexps = [];
    this.regexpCategory = val;
    this.regularCategoryName = '( ' + name + ' )';
    this.getRgeps();
  }

  getRgeps() {
    this.regexp = '';
    this.regexps = [];
    this._service.getRegexps(this.regexpCategory).subscribe(res => {
      for (let data of res.result) {
        this.regexps.push({
          RGEP_CD: data.RGEP_CD,
          CTG_CD: data.CTG_CD,
          RGEP_DATA: data.RGEP_DATA,
          RGEP_NM: data.RGEP_NM,
          RGEP_CNTE: data.RGEP_CNTE,
          LOAD_DTM: data.LOAD_DTM,
        });
      }
    });
  }

  addCtg() {
    const modalRef = this._modalService.open(CategoryComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      MODE: 'add'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        notify({message: this.trans['save'], position: {my: 'Top', at: 'Top'}}, 'Success', 2000);
        this.loadData();
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }

  ctgEdit(idx) {
    const modalRef = this._modalService.open(CategoryComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      CTG_CD: this.regexpCategorys[idx].CTG_CD,
      CTG_NM: this.regexpCategorys[idx].CTG_NM,
      CTG_CNTE: this.regexpCategorys[idx].CTG_CNTE,
      MODE: 'edit'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        notify({message: this.trans['save'], position: {my: 'Top', at: 'Top'}}, 'Success', 2000);
        this.loadData();
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }

  ctgDelete(idx) {
    const modalRef = this._modalService.open(DeleteModal);
    modalRef.componentInstance.data = this.regexpCategorys[idx].CTG_NM + ' ' + this.trans['category_delete'];
    modalRef.result.then((result) => {
      if (result === 'Confirm') {
        this._service.deleteRegexpCategory(this.regexpCategorys[idx]).subscribe(res => {
          if(res.result == 'failed') {
            notify({message: this.trans['failed'], position: {my: 'Top', at: 'Top'}}, 'Error', 2000);
          } else {
            notify({message: this.trans['save'], position: {my: 'Top', at: 'Top'}}, 'Success', 2000);
            this.loadData();
          }
        });
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }

  addRgep() {
    const modalRef = this._modalService.open(RgepDialogComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      CTG_CD: this.regexpCategory,
      MODE: 'add'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        this.getRgeps();
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }

  rgepEdit(idx) {
    const modalRef = this._modalService.open(RgepDialogComponent);
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      RGEP_CD: this.regexps[idx].RGEP_CD,
      RGEP_NM: this.regexps[idx].RGEP_NM,
      RGEP_DATA: this.regexps[idx].RGEP_DATA,
      RGEP_CNTE: this.regexps[idx].RGEP_CNTE,
      MODE: 'edit'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        this.getRgeps();
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }

  rgepSave() {
    const modalRef = this._modalService.open(ConfirmModal);
    modalRef.componentInstance.data = this.regexps[this.selectedIdx].RGEP_NM + ' ' + this.trans['rgep_save'];
    modalRef.result.then((result) => {
      if (result === 'Confirm') {
        this._service.saveRegexp(this.regexps[this.selectedIdx],document.querySelector('#regexp').innerHTML).subscribe(res => {
          if(res.result == 'failed') {
            notify({message: this.trans['failed'], position: {my: 'Top', at: 'Top'}}, 'Error', 2000);
          } else {
            notify({message: this.trans['save'], position: {my: 'Top', at: 'Top'}}, 'Success', 2000);
            this.getRgeps();
          }
        });
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });
  }
  rgepDelete(idx) {
    const modalRef = this._modalService.open(DeleteModal);
    modalRef.componentInstance.data = this.regexps[idx].RGEP_NM + ' ' + this.trans['rgep_delete'];
    modalRef.result.then((result) => {
      if (result === 'Confirm') {
        this._service.deleteRegexps(this.regexps[idx]).subscribe(res => {
          if(res.result == 'failed') {
            notify({message: this.trans['failed'], position: {my: 'Top', at: 'Top'}}, 'Error', 2000);
          } else {
            notify({message: this.trans['save'], position: {my: 'Top', at: 'Top'}}, 'Success', 2000);
            this.getRgeps();
          }
        });
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });

  }

  onRgepClick(idx) {
    this.rgepName = ' - ( ' + this.regexps[idx].RGEP_NM + ' ) ';
//    this.regexp = this.regexps[idx].RGEP_DATA;
    document.querySelector('#regexp').innerHTML = this.regexps[idx].RGEP_DATA;
    this.calculateRegularExpress();
  }

  regexChanged() {
    this.calculateRegularExpress();
  }

  textAreaChanged() {
    this.calculateRegularExpress();
  }

  calculateRegularExpress() {
    let reg = document.querySelector('#regexp').innerHTML;
    var txt = document.querySelector('#textArea').innerHTML;
    let r = new RegExp( reg,'gui');
    let retArr = r.exec(txt);
    let retStr = '';
    if( retArr ) {
      retArr.forEach((value, key) => {
        if( (key.toString() !== '0') && value)
          retStr += 'Group : ' + key + '. <span style="background:yellow;">' + value + '</span><br>';
      });
    }
    document.querySelector('#resultArea').innerHTML = retStr;
  }
}

