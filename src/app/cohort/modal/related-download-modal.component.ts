import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Http } from '@angular/http';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RelatedDownloadModalService } from './related-download-modal.service';
import { AppState } from '../../app.state';
import { DatePipe } from '@angular/common';
import notify from "devextreme/ui/notify";

import 'codemirror/mode/go/go';
import {AppService} from "../../app.service";
import {TranslateService} from "@ngx-translate/core";

declare const $: any;

@Component({
	selector: 'related-download-modal',
    templateUrl: './related-download-modal.component.html',
    providers: [
      RelatedDownloadModalService,
    ]
})

export class RelatedDownloadModal implements OnInit {
	@Input() data: {seq: string, mode: string; url: string; stfNo: string; anonymous: boolean; tbls: any; };
	excelUrl: string;
	exFileName: string;
	exFilePath: string;
  status: string;

  isAgreed: boolean = true;
  isRun: boolean = true;
  tbls: any[] = [];

  currDate = new Date();
  yesterday = new Date(this.currDate.valueOf() - (24*60*60*1000))
  startDate = this.yesterday.toISOString().split('T')[0];
  endDate = this.yesterday.toISOString().split('T')[0];

  includeConfirm: boolean = false;
  onlyModified: boolean = false;

  trans: any = {
    failed: null,
    data_none: null,
    select_table: null
  };
  txt: any = {
    failed: 'cohort.failed',
    data_none: 'cohort.data_none',
    select_table: 'cohort.select_table'
  };

  constructor(
    private http: Http,
    private _app: AppState,
    private modalService: NgbModal,
    private _service: RelatedDownloadModalService,
    public activeModal: NgbActiveModal,
    private datePipe: DatePipe,
    private _translate: TranslateService,
    private _appService: AppService,
  ) {
    this.excelUrl = this._app.ajaxUrl + 'excelDownload.do';
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
    for (let tbl of this.data.tbls) {
      this.tbls.push({
        TBL_ID: tbl.TBL_ID
        ,PRC_NM: tbl.PRC_NM
        ,PRC_CNTE: tbl.PRC_CNTE
        ,TBL_SFX: tbl.TBL_SFX
        ,selected: false
      });
    }
//    this.tbls = this.data.tbls;
	}

	// excel 다운로드
	excelDownload(): void {
		const result = {path : this.exFilePath, name: this.exFileName};
		this.activeModal.close(result);
	}

	setAgreement(): void {
    var tblLst = [];
    var tblNm = '';
    var i=0;
    for (let tbl of this.tbls) {
      if( tbl.selected == true ) {
        if( i++!=0 ) {
          tblNm += '_';
        }
        tblNm += tbl.TBL_SFX;
        tblLst.push(tbl.TBL_ID);
      }
    }
    if( tblNm == '' ) {
      notify({message: this.trans['select_table'], position: {my: 'Top', at: 'Top'}}, 'Error', 2000);
      return;
    }
    this.status = "start";
		this._service.executeExcel( this.data.url, this.data.stfNo, tblLst, tblNm, this.startDate, this.endDate, this.data.anonymous ).subscribe(res => {
		  if( res.result == 'none') {
        this.status = "";
        notify({message: this.trans['data_none'], position: {my: 'Top', at: 'Top'}}, 'Error', 2000);
      } else if ( res.result == 'failed') {
        this.status = "";
        notify({message: this.trans['failed'], position: {my: 'Top', at: 'Top'}}, 'Error', 2000);
      } else {
        this.exFilePath = res.filePath;
        this.exFileName = res.fileName;
        this.excelDownload();
      }
		});
	}

  getStartDate(e) {
    this.startDate = this.datePipe.transform(e.value,'yyyy-MM-dd');
  }

  getEndDate(e) {
    this.endDate = this.datePipe.transform(e.value,'yyyy-MM-dd');
  }

  includeConfirmChanged(e) {
    this.includeConfirm = e.value;
  }

  onlyModifiedChanged(e) {
    this.onlyModified = e.value;
  }


}

