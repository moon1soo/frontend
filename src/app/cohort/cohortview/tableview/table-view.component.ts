import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Headers, Http } from '@angular/http';
import notify from 'devextreme/ui/notify';

import { TableViewService } from './table-view.service';
import { CohortService } from '../../cohort.service';
import { CohortViewService } from '../cohort-view.service';
import { ActivatedRoute, Router} from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { DatePipe } from '@angular/common';

import { ExcelDownloadModal } from '../../modal/excel-download-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from 'app/app.state';
import CustomStore from 'devextreme/data/custom_store';

import 'rxjs/add/operator/toPromise';

import * as _ from 'lodash';
import {AppService} from "../../../app.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'table-view',
  templateUrl: './table-view.component.html',
  styleUrls: [ './table-view.component.css' ],
  providers: [TableViewService]
})
export class TableViewComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

  currDate = new Date();
  yesterday = new Date(this.currDate.valueOf() - (24*60*60*1000))
  startDate = this.yesterday.toISOString().split('T')[0];
  endDate = this.yesterday.toISOString().split('T')[0];

  cohortIdx: string;
  tblIdx: string;
  tblNm: string;
  tblCnte: string;

  totalStr: string = '0';
  total: number = 0;
  sizePerSize: number = 1000;
  sizePerSizeStr: string = '0';

  dataSource: any = {};
  tempSource = [];

//  dynamicColumns: {dataField: string; caption: string; cssClass: string; allowEditing: boolean; visible: boolean; trueText: string; falseText: string;}[] = [];
  dynamicColumns: any[] = [];

  currentPage: number = 1;
  scrollTop: number = 0;

  loadIndicatorVisible = false;
  buttonText = "Commit";

  loading: boolean = true;
  loadComplete: boolean = false;

  exceptColumn: string[] = [ 'hspTpCd' ]; // 화면에 표시하지 않음
  staticColumn: string[] = []; // 화면에 표시하지 않음
  editColumn: string[] = [ 'RNUM', 'COL_ID', 'PT_NO', 'HSP_TP_CD', 'PACT_ID', 'EXRS_ID', 'LOAD_DTM', 'PT_NM', 'PT_BRDY_DT' ];
  cohortTableDataUrl: string = 'cohortTableData.json';

  excelUrl: any;
  exFileName: string;
  exFilePath: string;
  closeResult: string;
  workIndex: any;

  group: number = 0;
  edit: number = 1;
  visible: number = 2;
  type: number = 3;
  cnte: number = 4;
  name: number = 5;

  trans: any = {
    input_comment: null,
    saved: null,
    save: null,
    failed: null,
  };
  txt: any = {
    input_comment: 'cohort.mart.input_comment',
    saved: 'cohort.saved',
    save: 'cohort.save',
    failed: 'cohort.failed'
  };

  includeConfirm: boolean = false;
  onlyModified: boolean = false;
  constructor(
    public _service: TableViewService,
    private _router: Router,
    private router: ActivatedRoute,
    private _app: AppState,
    private datePipe: DatePipe,
    private ngZone: NgZone,
    private http: Http,
    private _cohortService: CohortService,
    private _cohortViewService: CohortViewService,
    private _modalService: NgbModal,
    private _translate: TranslateService,
    private _appService: AppService
  ) {
    this.cohortTableDataUrl = `${this._app.ajaxUrl}cohortTableData.json`;
    this.excelUrl = `${this._app.ajaxUrl}excelDownLoad.do`;
    this.tblIdx = this._cohortService.getCohortViewTableidx();
    this._translate.use(this._appService.langInfo);
    for(let key of Object.keys(this.txt)) {
      if(this.txt[key]) {
        this._translate.get(this.txt[key]).subscribe(res => {
          this.trans[key] = res;
        });
      }
    }

//    this.loadData();
  }

  ngOnInit() {
//      this.tblIdx = this._cohortService.getCohortViewTableidx();
    this._cohortViewService.cohortTableIdx$.subscribe(res => {
      this.tblIdx = res;
      this.loadData();
    });
  }

  getAnonymousRights() {
    return this._cohortService.getAnonymousRights();
  }

  getEditRights() {
    return this._cohortService.getEditRights();
  }

  getDownloadRights() {
    return this._cohortService.getDownloadRights();
  }

  initValue() {
    this.dataSource.store = new CustomStore({
      load:  (loadOptions: any) => {
        var params = '?';
        params += 'skip=' + loadOptions.skip || 0;
        params += '&take=' + loadOptions.take || 12;
        if(loadOptions.sort) {
          params += '&orderby=' + loadOptions.sort[0].selector;
          if(loadOptions.sort[0].desc) {
            params += ' desc';
          }
        }
        const body = {
          'TBL_ID': this.tblIdx
          , 'start': loadOptions.skip
          , 'size': loadOptions.take
          , 'startDate': this.startDate
          , 'endDate': this.endDate
          , 'anonymous': this.getAnonymousRights()
          , 'confirm': this.includeConfirm
          , 'modified': this.onlyModified
          , 'sort': loadOptions.sort
        };
        const headers = new Headers({
          "Accept": "text/plain;charset=UTF-8"
        });

        return this.http.post(this.cohortTableDataUrl, JSON.stringify(body), { headers: headers })
          .toPromise()
          .then(response => {
            var json = response.json();
            this.sizePerSizeStr =  this.addComma(( loadOptions.skip + json.items.length ).toString());
            if( json && json.items ) {
              for (var j=0;j<json.items.length;j++) {
              var detail = json.items[j].DETAIL;
              detail = detail.substring(0,detail.length-3) + '}]';
              detail = detail.replace(/\\/g,'\\\\')
                .replace(/\'/g,"\\'")
                .replace(/\"/g,'\\"')
                .replace(/\r\n/g,'\\n')
                .replace(/\n/g,'\\n')
                .replace(/\r/g,'\\r')
                .replace(/\f/g,'\\f')
                .replace(/\t/g,'\\t')
              ;
              detail = detail.replace(/:\|/g,'\'');
              try {
                json.items[j].DETAIL = eval(detail);
              }catch(e){
                console.log(e);
              }
            }
            }
            return {
              data: json.items
            }
          })
          .catch(error => { throw 'Data Loading Error' });
      }
      ,
      update: (key, values) => {
        var sql = '';
        var cnt = 0;
/*
        console.log('-------------');
        console.log(key);
        console.log(values);
        console.log('-------------');
*/
        for(var j in values ) {

          if( cnt++ > 0 )
            sql += ',';
          sql += j;
          if( typeof(values[j]) == 'number' ) {
            sql += '=' + values[j];
          } else if( typeof(values[j]) == 'boolean' ) {
            if(values[j] == true) {
              sql += '=' + '1';
            } else {
              sql += '=' + '0';
            }
          } else {
            sql += '=\'';
            sql += values[j];
            sql += '\'';
          }
        }
        return new Promise((resolve, reject) => {
//          resolve('');
          this._service.updateColumns(this.tblNm, sql, key.COL_ID).subscribe((data) => {
            resolve(data);
          }, (error) => {
            reject(error);
          });
        })
      }
    });
  }

  onRowValidating(e) {
    var _dataSize = Object.keys(e.newData).length;
    if( _dataSize!=null && _dataSize==1 && e.newData.CONFIRM!=null) {
//      console.log('confirm only');
    } else {
      if( _dataSize==null || e.newData.COMMENTS==null || e.newData.COMMENTS.length <=0) {
        e.isValid = false;
        notify({message:this.trans['input_comment'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
//        console.log('no comment ');
      }
    }
  }
/*
  initValue() {
    this.dataSource.store = new CustomStore({
      load: function (options) {
        var d = $.Deferred();
        return d.progress();
      }
    });
  }
*/

  loadData(){
    this.currentPage = 1;
    this.sizePerSizeStr  = '0';
    this.tempSource = [];
    this.getTblDataCnt();
  }

  onContentReady(e) {
    e.component.option("loadPanel.enabled", false);
  }

  addComma(nm) {
    return nm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getTblDataCnt() {
    this._service.getTblDataCnt( this.tblIdx, this.startDate, this.endDate, this.getAnonymousRights(), this.includeConfirm, this.onlyModified ).subscribe(res => {
      this.totalStr = this.addComma(res.result[0].CNT);
      this.total = parseInt(res.result[0].CNT);
      this.tblNm = res.result[0].PRC_NM;
      this.tblCnte = res.result[0].PRC_CNTE;
      this.setColumn(res.result[0].PRC_COL_GRPS,res.result[0].PRC_COLS);
      this.initValue();
    });
  }

  onToolbarPreparing(e) {
    e.toolbarOptions.height = 36;
    if( this.getDownloadRights() ) {
      e.toolbarOptions.items.unshift({
        location: 'after',
        widget: 'dxButton',
        options: {
          hint: 'Excel Download',
          text: "Excel Download",
          onClick: this.excelDownModal.bind(this)
        }
      });
    }

    e.toolbarOptions.items.unshift({
      location: 'before',
      widget: 'dxDateBox',
      options: {
        displayFormat: "yyyy-MM-dd",
        value: this.yesterday,
        width: 110,
        height: 24,
        onValueChanged: this.getStartDate.bind(this)
      }
    }, {
      location: 'before',
      template: 'txt'
    }, {
      location: 'before',
      widget: 'dxDateBox',
      options: {
        width: 110,
        displayFormat: "yyyy-MM-dd",
        value: this.yesterday,
        height: 24,
        onValueChanged: this.getEndDate.bind(this)
      }
    }, {
      location: 'before',
      widget: 'dxButton',
      options: {
        hint: 'Apply',
        text: "Apply",
        onClick: this.loadData.bind(this)
      }
    }, {
      location: 'before',
      template: 'totalCount'
    }, {
      location: 'after',
      widget: 'dxCheckBox',
      options: {
        hint: '수정건만',
        text: "수정건만",
        onValueChanged: this.onlyModifiedChanged.bind(this)
      }
    }, {
      location: 'after',
      widget: 'dxCheckBox',
      options: {
        hint: '컨펌포함',
        text: "컨펌포함",
        onValueChanged: this.includeConfirmChanged.bind(this)
      }
    });
  }

  includeConfirmChanged(e) {
    this.includeConfirm = e.value;
  }

  onlyModifiedChanged(e) {
    this.onlyModified = e.value;
  }

  setCol(v):any {
    var d = {  dataField: v[this.name], caption: v[this.cnte], title: v[this.name], cssClass: 'normal', allowEditing: false, visible: false, allowFiltering:true, allowHeaderFiltering:true };
    if( v[this.edit] == 'Y' && this.getEditRights() ) {
      d.allowEditing = true;
    }
    if( v[this.visible] == 'Y' ) {
      d.visible = true;
    }
    if( v[this.type] == 'BOOL' ) {
      d["dataType"] = "boolean";
    }
    return d;
  }

  setColumn(grps,cols) {
    this.dataGrid.height = "calc(100% - 100px)";
    let colsArr = eval(cols);
    this.dynamicColumns =[];
    this.dataSource = {};
    this.dataGrid.applyOptions();
    var data = [];
    colsArr.forEach(( v, i ) => {
      this.dynamicColumns.push(
          this.setCol(v)
        )
    });
//    this.dynamicColumns.push( data );

/*
    let colsArr = eval(cols);
    let grpsArr = eval(grps);
    this.dynamicColumns =[];
    this.dataSource = {};
    this.dataGrid.applyOptions();

    if( grpsArr && grpsArr.length ) {
      grpsArr.forEach(( val, idx ) => {
        var grp = grpsArr[idx][0];
        var data = { caption: grpsArr[idx][1], columns: [] };
        colsArr.forEach(( v, i ) => {
//        var col = v;
          if( v[this.group] == grp ) {
            data.columns.push(
              this.setCol(v)
            )
          }
        });
        this.dynamicColumns.push( data );
      });
    } else {
      colsArr.forEach(( v, i ) => {
        this.dynamicColumns.push( this.setCol(v) );
      });
    }
*/
/*
    var visible = true;
    var allowEditing = false;


    if (colsArr && colsArr.length > 0) {
      var data = {};
      this.dynamicColumns.push({
        dataField: 'RNUM', caption: 'RNUM', cssClass: 'normal', allowEditing: false, visible: true
      });
      data['RNUM'] = '';
      for( var i=0; i<colsArr.length; i++ ) {
        if(!~this.exceptColumn.indexOf(colsArr[i])) {
          if (!~this.staticColumn.indexOf(colsArr[i])) {
            visible = true;
          } else {
            visible = false;
          }
          if (this.getEditRights()==true && !~this.editColumn.indexOf(colsArr[i])) {
            allowEditing = true;
          } else {
            allowEditing = false;
          }
          var column = { dataField: colsArr[i], caption: colsArr[i], cssClass: 'normal', allowEditing: allowEditing, visible: visible, allowFiltering:false, allowHeaderFiltering:true }
          if( colsArr[i] == 'COL_ID' ) {
//            column["fixed"] = true;
//            column["fixedPosition"] = "left";
          }
          if( colsArr[i] == 'CONFIRM' ) {
            column["dataType"] = "boolean";
          }
          this.dynamicColumns.push( column )
          data[colsArr[i]] = '';
        }
      }
    }
*/
  }


/*
} else if( colsArr[i] == 'COMMENT') {
  this.dynamicColumns.push({
    dataField: colsArr[i], caption: colsArr[i], cssClass: 'normal', allowEditing: allowEditing, visible: visible, dataType: "boolean",
  });
*/

/*
  getTblData() {
    if( !this.loadComplete ) {
      this._service.getTblData(this.tblIdx, this.currentPage, this.sizePerSize, this.startDate, this.endDate).subscribe(res => {
        setTimeout(() => {
          this.loading = false;
          this.dataGrid.noDataText = this._app.tableText.noData;
        }, 800);

        this.currentPage = this.currentPage + 1;

        if (this.tempSource.length > 999) {
          this.tempSource = this.tempSource.concat(res.result);
        } else {
          this.tempSource = res.result;
        }

        this.sizePerSizeStr = this.addComma(this.tempSource.length );

        if (this.tempSource.length === res.total) {
          this.loadComplete = true;
        } else {
          this.loadComplete = false;
        }
        this.dxDatatable(this.tempSource);

      });
    } else {

    }
  }
*/

  onEditorPreparing (e) {
/*
    if (e.dataField == "COMMENTS") {
      e.editorName = "dxTextArea";
    }
*/
  }

  onCellHoverChanged(e) {
    if (e.rowType == "header" && e.eventType == 'mouseover') {
      e.cellElement.title = e.column.title;
    }
  }
  onCellPrepared(e) {
    if (e.rowType === "header") {
      if( e.column.allowEditing === true ) {
        var btn = e.cellElement.querySelector(".dx-datagrid-text-content");
        btn.innerHTML =  '<i class=\"fal fa-edit text-center mb-1\"></i>&nbsp;' + e.column.caption;
      }

      /*
//      console.log(e);
      e.cellElement.mousemove(function() {
        var headerTitle = e.cellElement.children();
        headerTitle.attr('title', ' asdfasdfasdf');
        if (headerTitle.get(0).scrollWidth > headerTitle.get(0).clientWidth) {
          //Display your tooltip here
        }
      })
      */

//      var btn = e.cellElement[0].querySelector(".dx-datagrid-text-content");
//      btn.innerHTML =  '<i class=\"fal fa-edit text-center mb-1\"></i>&nbsp;' + e.column.caption;
    }
    /*
    if (e.rowType === "data" && e.column.command === "edit") {
      var cellElement = e.cellElement;
      let deleteLink = cellElement.querySelector(".dx-link-delete");
      deleteLink.classList.add("dx-icon-trash");
      deleteLink.textContent = "";
    }
*/
  }

  //confirm commit
  commitMessage() {
    notify("success", "success");
  }
  errorMessage() {
    notify("error", "error");
  }

  getStartDate(e) {
    this.startDate = this.datePipe.transform(e.value,'yyyy-MM-dd');
  }

  getEndDate(e) {
    this.endDate = this.datePipe.transform(e.value,'yyyy-MM-dd');
  }

  excelDownload(): void {
    const url = 'cohortTableExcel.json';
    const elem = document.getElementById('btn-submit-cohort-excel');
    setTimeout(() => {
      let event = document.createEvent('Event');
      event.initEvent('click', true, true);
      elem.dispatchEvent(event);
    }, 10);
  }

  excelDownModal() {
    const modalRef = this._modalService.open(ExcelDownloadModal, {
      size: 'lg',
      backdrop: 'static'
    });
/*
  , 'anonymous': this.getAnonymousRights()
      , 'confirm': this.includeConfirm
      , 'modified': this.onlyModified
*/
    modalRef.componentInstance.data = {seq: 'cohortTable', mode: 'cohort', stfNo: sessionStorage.getItem('stfNo')
      , tblNm: this.tblNm, idx: this.tblIdx, startDate: this.startDate, endDate: this.endDate, anonymous: this.getAnonymousRights()
      , confirm: this.includeConfirm, modified: this.onlyModified, url:'cohortTableExcelDownload.json' };
    modalRef.result.then((result) => {
      if (result.path && result.name) {
        this.exFilePath = result.path;
        this.exFileName = result.name;
        this.excelDownload();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${reason}`;
    });
  }


}
