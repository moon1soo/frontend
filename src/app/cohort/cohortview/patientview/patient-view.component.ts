import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Headers, Http } from '@angular/http';
import notify from 'devextreme/ui/notify';

import { PatientViewService } from './patient-view.service';
import { CohortService } from '../../cohort.service';
import { CohortViewService } from '../cohort-view.service';
import { ActivatedRoute, Router} from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { DatePipe } from '@angular/common';

import { PatientDownloadModel } from '../../modal/patient-download-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from 'app/app.state';
import CustomStore from 'devextreme/data/custom_store';

import 'rxjs/add/operator/toPromise';

import * as _ from 'lodash';
import {AppService} from "../../../app.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'patient-view',
  templateUrl: './patient-view.component.html',
  styleUrls: [ './patient-view.component.css' ],
  providers: [PatientViewService]
})
export class PatientViewComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

  cohortIdx: string;
  tblIdx: string;
  tblSfx: string;
  tblNm: string;
  tblCnte: string;

  totalStr: string = '0';
  total: number = 0;
  sizePerSizeStr: string = '0';

  dataSource: any = {};
  tempSource = [];

  dynamicColumns: any[] = [];

  buttonText = "Commit";

  loading: boolean = true;
  loadComplete: boolean = false;

  excelUrl: any;
  exFileName: string;
  exFilePath: string;
  closeResult: string;
  workIndex: any;

  trans: any = {
    input_comment: null,
    saved: null,
    save: null,
    failed: null,
    deleteMessage: null
  };
  txt: any = {
    delete_comment: 'cohort.delete_comment',
    saved: 'cohort.saved',
    save: 'cohort.save',
    failed: 'cohort.failed'
  };

  constructor(
    public _service: PatientViewService,
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
    this._cohortViewService.cohortTableSfx$.subscribe(res => {
      this.tblSfx = res;
      this.tblCnte = 'Patient';
      this.tblNm = 'FT_COH_PLC_' + res;
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
    this.dataSource = {};
    this.dataSource.store = new CustomStore({
      key: "PT_NO",
      load: (loadOptions: any) => {
        return new Promise((resolve, reject) => {
          this._service.cohortPatientData( this.tblNm, loadOptions.skip, loadOptions.take, this.getAnonymousRights(), loadOptions.sort ).subscribe((res) => {
            this.sizePerSizeStr =  this.addComma(( loadOptions.skip + res.data.length ).toString());
            resolve( res.data );
          }, (error) => {
            reject(error);
          });
        })
      },remove: (key: any) => {
        return new Promise((resolve, reject) => {
          this._service.deleteCohortPatient(this._cohortService.getCohortIdx(),this.tblNm, key).subscribe((res) => {
            this.loadData();
            resolve(key);
          }, (error) => {
            reject(error);
          });
        })
      }
    });
  }

  countPatient() {
    this._service.cohortPatientDataCnt(this.tblNm).subscribe(res => {
      this.totalStr = this.addComma(res.result[0].CNT);
      this.total = parseInt(res.result[0].CNT);
      this.initValue();
    });
  }

  loadData(){
    this.sizePerSizeStr  = '0';
    this.countPatient();
  }

  onContentReady(e) {
    e.component.option("loadPanel.enabled", false);
  }

  onCellPrepared(e) {
    if (e.rowType == 'detail' && e.column.command === "detail") {

    }
  }
  addComma(nm) {
    return nm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  onToolbarPreparing(e) {
    e.toolbarOptions.height = 36;
    e.toolbarOptions.items.unshift({
      location: 'before',
        template: 'totalCount'
    });
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
  }

  excelDownload(): void {
    const url = 'cohortPatientExcel.json';
    const elem = document.getElementById('btn-submit-cohort-excel');
    setTimeout(() => {
      let event = document.createEvent('Event');
      event.initEvent('click', true, true);
      elem.dispatchEvent(event);
    }, 10);
  }

  excelDownModal() {
    const modalRef = this._modalService.open(PatientDownloadModel, {
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {seq: 'cohortTable', mode: 'cohort', stfNo: sessionStorage.getItem('stfNo')
      , tblNm: this.tblNm, idx: this.tblIdx, anonymous: this.getAnonymousRights()
      , url:'cohortPatientExcelDownload.json' };
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

  deleteItem(e) {
//    console.log(e);
  }

}
