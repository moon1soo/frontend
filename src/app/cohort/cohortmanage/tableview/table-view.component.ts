import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { Observable } from "rxjs";
import { Subscription }   from 'rxjs/Subscription';
import { Headers, Response, Http } from '@angular/http';
import notify from 'devextreme/ui/notify';

import { TableViewService } from './table-view.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';
import { DatePipe } from '@angular/common';

import { AppState } from 'app/app.state';

import * as _ from 'lodash';
import {forEach} from "@angular/router/src/utils/collection";

@Component({
  selector: 'table-view',
  templateUrl: './table-view.component.html',
  styleUrls: [ './table-view.component.css' ],
  providers: [TableViewService]
})
export class TableViewComponent implements OnInit, AfterViewInit {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

  currDate = new Date();
  yesterday = new Date(this.currDate.valueOf() - (24*60*60*1000))
//  startDate = this.yesterday.toISOString().split('T')[0];
//  endDate = this.yesterday.toISOString().split('T')[0];
  startDate: string = '';
  endDate: string = '';

  cohortIdx: string;
  tblIdx: string;
  tblNm: string;
  tblCnte: string;

  totalStr: string = '0';
  total: number = 0;
  sizePerSize: number = 1000;
  sizePerSizeStr: string = '0';

  tableSource: any;
  tempSource = [];

  dynamicColumns: {dataField: string; caption: string; cssClass: string; allowEditing: boolean; visible: boolean;}[] = [];

  cellWidth: number = 140;
//  gridWidth: number = this.dynamicColumns.length * this.cellWidth;


  currentPage: number = 1;
  scrollTop: number = 0;

  loadIndicatorVisible = false;
  buttonText = "Commit";

  loading: boolean = true;
  loadComplete: boolean = false;

  exceptColumn: string[] = ['RNUM','EXRS_ID','HSP_TP_CD','PACT_ID']; // 화면에 표시하지 않음
  staticColumn: string[] = ['RNUM','EXRS_ID']; // 화면에 표시하지 않음

  private onLazy = new Subject<any>();
  onLazy$ = this.onLazy.asObservable();

  columns: any = [];
//  regex: string = '';

  sourceText: string = '';
  sourceTextOrg: string = '';

  regexpCategory: any[] = [];
  regexps: any[] = [];

  private regex = new Subject<string>();

  regex$ = this.regex.asObservable();

  textSelected: string = '';

  constructor(
    public _service: TableViewService,
    private _router: Router,
    private router: ActivatedRoute,
    private _app: AppState,
    private datePipe: DatePipe
  ) {

  }

  ngOnInit() {
//    this.dataGrid.height = "100%";
    this.router.params.subscribe( params => {
      this.tblIdx = params.idx;
      this.loadData();
    });
    // Lazy Load
    this.onLazy$.subscribe(res => {
      this.scrollTop = res;
      if (this.scrollTop > this.currentPage * 1750) {
        this.currentPage = this.currentPage + 1;
        this.getParsingSubjectOriginalData();
      }
    });

    this.regex$.subscribe(res => {


    });

  }

  ngAfterViewInit() {
    $('.dx-texteditor').css('width', '100px !important');
  }

  initValue(){
    this.tableSource = [];
    this.tempSource = [];

    this.dynamicColumns = [];

    this.currentPage = 1;
    this.tblNm = '';
    this.tblCnte = '';
    this.totalStr = '0';
    this.total  = 0;
    this.sizePerSizeStr  = '0';

    this.loadComplete = false;
  }

  loadData(){
    this.initValue();
    this.getRegexpCategory();
    this.getParsingSubjectOriginalCnt();
  }

  onContentReady(e) {
    e.component.option("loadPanel.enabled", false);
//    this.onScroll(e, this.onLazy);
  }

  onToolbarPreparing(e) {
    e.toolbarOptions.height = 36;
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
    } );

  }

  onScroll(e, onLazy) {
    if (e.component.getScrollable()) {
      e.component.getScrollable().on('scroll', function(options) {
        onLazy.next(options.scrollOffset.top);
      });
    }
  }

  addComma(nm) {
    return nm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getRegexpCategory() {
    this._service.getRegexpCategory().subscribe(res => {
      this.regexpCategory = [];
      this.regexpCategory.push({CTG_CD:'',CTG_NM:'Select..'});
      for (let data of res.result) {
        this.regexpCategory.push({
          CTG_CD: data.CTG_CD,
          CTG_NM: data.CTG_NM,
        });
      }
    });
  }


  getParsingSubjectOriginalCnt() {
    this._service.getParsingSubjectOriginalCnt(this.tblIdx, this.startDate, this.endDate).subscribe(res => {
      this.totalStr = this.addComma(res.result[0].CNT);
      this.total = parseInt(res.result[0].CNT);
      this.tblNm = res.result[0].PSO_NM;
      this.tblCnte = res.result[0].PSO_CNTE;
      this.getParsingSubjectOriginalData();
    });
  }
  getParsingSubjectOriginalData() {
    if( !this.loadComplete ) {
      this._service.getParsingSubjectOriginalData(this.tblIdx, this.currentPage, this.sizePerSize, this.startDate, this.endDate).subscribe(res => {
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


  dxDatatable(res: any): void {
    this.tableSource = res;
    this.dynamicColumns = [];
    var visible = true;
    var allowEditing = false;
    if (res.length > 0) {
      for(let column of Object.getOwnPropertyNames(res[0])) {
        if(!~this.exceptColumn.indexOf(column)) {
          visible = true;
        } else {
          visible = false;
        }
/*
        if(!~this.staticColumn.indexOf(column)) {
          allowEditing = true;
        } else {
          allowEditing = false;
        }
*/
        this.dynamicColumns.push({
          dataField: column, caption: column, cssClass: 'normal', allowEditing: allowEditing, visible: visible
        });
      }
    }
  }

  onRowUpdated(e){
  }

  onCellPrepared(e) {
    if (e.rowType === "data" && e.column.command === "edit") {
      var cellElement = e.cellElement;
      let deleteLink = cellElement.querySelector(".dx-link-delete");
      deleteLink.classList.add("dx-icon-trash");
      deleteLink.textContent = "";
    }
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

  onCellClick(e) {
    e.component.focus(e.component.getCellElement(e.rowIndex, e.columnIndex));
    this.sourceTextOrg = e.value;
    var tempTxt = e.value;
    tempTxt = tempTxt.replace(/\r/g,'\n');
    tempTxt = tempTxt.replace(/\n\n/g,'\n');
    tempTxt = tempTxt.replace(/\n/g,'<br>');
    this.sourceText = tempTxt;
    document.querySelector('#textWorkArea').innerHTML = tempTxt;
    this.regexChanged();
  }

  regexChenge(e) {
/*
    console.log(this.regex);
    if( this.regex.length <= 0 )
      return
    console.log('this.regex');
    console.log(this.regex);
    document.querySelector('#textWorkArea').innerHTML = this.sourceTextOrg.replace(new RegExp(this.regex, "gi"), match => {
//      return '<span class="highlightText">' + match + '</span>';
      return '<span style="background:yellow;">' + match + '</span>';
    });
*/
  }

  changeRegexpCategory(val) {
    this._service.getRegexps(val).subscribe(res => {
      this.regexps = [];
      this.regexps.push({RGEP_CD:'',RGEP_DATA:'',RGEP_NM:'Select..'});
      for (let data of res.result) {
        this.regexps.push({
          RGEP_CD: data.RGEP_CD,
          RGEP_DATA: data.RGEP_DATA,
          RGEP_NM: data.RGEP_NM
        });
      }
    });
  }

  changeRegexp(val) {
    let list = _.filter(this.regexps,{'RGEP_CD':val});
    if( list.length > 0 ) {
//      this.regex = list[0].RGEP_DATA;
      document.querySelector('#regex').innerHTML = list[0].RGEP_DATA;
      this.regexChanged();
    }
  }

  regexChanged() {
//    console.log(document.querySelector('#regex').innerHTML);
//    console.log(e);
/*
    let reg = document.querySelector('#regex').innerHTML;
    let r = new RegExp(/(?:(?:fatt\w{0,4}\s*l)|(?:지방간)|(?:fat\w{1,4} liver)|(?:fat\w{1,4} chan\w{1,4} of\s*liver)|(?:fatyt l\w{1,4}))(?:(?!\n).)*?(?:((?:(?:(?:mod(?:(?!ality).)\w{0,10})|(?:mdoerate)|(?:mderate))\s*to\s*(?:(?:severe)|(?:server)|(?:svere)|(?:sever )))|(?:(?:severe)|(?:server)|(?:svere)|(?:sever ))|(?:심한))|((?:(?:(?:mild)|(?:midl)|(?:mld)|(?:milld)|(?:mil )|(?:miild)|(?:mildt))\s*to\s*(?:(?:mod(?:(?!ality).)\w{0,10})|(?:mdoerate)|(?:mderate)))|(?:(?:mod(?:(?!ality).)\w{0,10})|(?:mdoerate)|(?:mderate))|(?:중등도))|((?:(?:mild)|(?:midl)|(?:mld)|(?:milld)|(?:mil )|(?:miild)|(?:mildt))|(?:(?:minimal)|(?:mimimal))|(?:slight)|(?:경미한))|((?: normal)|(?:정상)))/,'gm');
    var txt = document.querySelector('#textWorkArea').innerHTML;
    txt = txt.replace(/<br>/g,'');
    console.log('reg = ' + reg);
    console.log('txt = ' + txt);
//    if( r.test(txt) ) {
//      let v = txt.exec(r);
      let v = r.exec(txt);
      console.log(v);

      console.log(/(?:(?:fatt\w{0,4}\s*l)|(?:지방간)|(?:fat\w{1,4} liver)|(?:fat\w{1,4} chan\w{1,4} of\s*liver)|(?:fatyt l\w{1,4}))(?:(?!\n).)*?(?:((?:(?:(?:mod(?:(?!ality).)\w{0,10})|(?:mdoerate)|(?:mderate))\s*to\s*(?:(?:severe)|(?:server)|(?:svere)|(?:sever )))|(?:(?:severe)|(?:server)|(?:svere)|(?:sever ))|(?:심한))|((?:(?:(?:mild)|(?:midl)|(?:mld)|(?:milld)|(?:mil )|(?:miild)|(?:mildt))\s*to\s*(?:(?:mod(?:(?!ality).)\w{0,10})|(?:mdoerate)|(?:mderate)))|(?:(?:mod(?:(?!ality).)\w{0,10})|(?:mdoerate)|(?:mderate))|(?:중등도))|((?:(?:mild)|(?:midl)|(?:mld)|(?:milld)|(?:mil )|(?:miild)|(?:mildt))|(?:(?:minimal)|(?:mimimal))|(?:slight)|(?:경미한))|((?: normal)|(?:정상)))/gui.exec(txt));
      console.log(/Fatty/g.exec(txt));
      let rr = new RegExp(/Fatty/,'gmi');
      let retArr = txt.match(rr);
      retArr.forEach((value, key) => {
        console.log(key + ' = ' + value );
      });
//    }
*/
    let reg = document.querySelector('#regex').innerHTML;
    var txt = this.sourceTextOrg;
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

  highlight() {
/*
    console.log(this.regex);
    if( this.regex.length <= 0 )
      return
    console.log('this.regex2222');
    console.log(this.regex);
    this.sourceText = this.sourceTextOrg.replace(new RegExp(this.regex, "gi"), match => {
      return '<span class="highlightText">' + match + '</span>';
    });
  */
  }
}
