import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Http } from '@angular/http';

import { Router } from '@angular/router';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientDownloadModalService } from './patient-download-modal.service';
import { StompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { AppState } from '../../app.state';

import 'codemirror/mode/go/go';

declare const $: any;

@Component({
	selector: 'patient-download-modal',
    templateUrl: './patient-download-modal.component.html',
    providers: [
      PatientDownloadModalService,
    ]
})

export class PatientDownloadModel implements OnInit {
	@Input() data: {seq: string, mode: string; stfNo: string; tblNm: string; idx: string; confirm: string; anonymous: boolean; url: string; };
  excelUrl: string;
	exFileName: string;
	exFilePath: string;
  status: string;

  isAgreed: boolean = true;
  isRun: boolean = true;

  constructor(
    private http: Http,
    private _app: AppState,
    private modalService: NgbModal,
    private _service: PatientDownloadModalService,
    public activeModal: NgbActiveModal
  ) {
    this.excelUrl = this._app.ajaxUrl + 'excelDownload.do';
  }

  ngOnInit() {
	}

	// excel 다운로드
	excelDownload(): void {
		const result = {path : this.exFilePath, name: this.exFileName};
		this.activeModal.close(result);
	}

	setAgreement(): void {
    this.status = "start";
		this._service.executeExcel(this.data).subscribe(res => {
      this.exFilePath = res.filePath;
      this.exFileName = res.fileName;
      this.excelDownload();
		});
	}
}

