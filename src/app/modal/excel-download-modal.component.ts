import { Component, OnInit, Input, Pipe, PipeTransform, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Router } from '@angular/router';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DxProgressBarModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

import { ExcelDownloadModalService } from './excel-download-modal.service';
import { StompService } from '@stomp/ng2-stompjs';
import { StoreService } from '../basicmode/store/store.service';
import { PowermodeStoreService } from '../powermode/store/store.service';
import { Message } from '@stomp/stompjs';
import { AppState } from '../app.state';
import { AppService } from '../app.service';
import { DashboardState } from '../basicmode/dashboard.state';
import { ItemListState } from '../item-list.state';

import { HandleError } from './handle-error.component';
import 'codemirror/mode/go/go';

declare const $: any;
import * as _ from 'lodash';

@Component({
	selector: 'excel-download-modal',
    templateUrl: './excel-download-modal.component.html',
    providers: [
        ExcelDownloadModalService,
		StoreService,
		PowermodeStoreService,
		AppService,
		DashboardState,
		ItemListState
    ]
})

export class ExcelDownloadModal implements OnInit {
	@Input() data: {seq: string, mode: string; sql: string; workIndex?: number; type: string;};
	// @ViewChild('excelDownForm') excelDownForm: any;

	appurl: string;

    config: any;

	jobData: any[] = [];
    monthGroup: any;
	countGroup: any[] = [];

	isRun: boolean = false;
	isAgreed: boolean = false;

	excelUrl: string;
	exFileName: string;
	exFilePath: string;

	status: string;

	progressRate: number = 0;
	maxValue: number = 100;

    constructor(
		private http: Http,
		private _app: AppState,
        private modalService: NgbModal,
        private _service: ExcelDownloadModalService,
		private _stomp: StompService,
		private _router: Router,
        private _detective: ChangeDetectorRef,
        public activeModal: NgbActiveModal
    ) {
	this.appurl = this._app.ajaxUrl;
		console.log(this.appurl);
		this.excelUrl = this.appurl + 'excelDownload.do';
    }

    ngOnInit() {
	}
	
	// excel 다운로드
	excelDownload(): void {
		this._service.getSqlViewLogInsert(this.data.seq, this.data.sql, this.data.mode).subscribe();
		// const result = '{ "path" : "' + this.exFilePath + '", "name": "' + this.exFileName + '" }';
		// this.activeModal.close(JSON.parse(result));
		const result = {path : this.exFilePath, name: this.exFileName};
		this.activeModal.close(result);
	}

	setAgreement(): void {
		let sessionId;
		this.isAgreed = true;
		
		this.status = 'start';
		sessionId = sessionStorage.getItem('sessionId');
		let workIndex;
		this._service.executeExcel(this.data).subscribe(res => {
			console.log(res);
			if(res.workExecutionResultType === 'ACTION_SUCCESS') {
				let job =
					this._stomp.subscribe(`/user/${sessionId}/work/message`)
					.map((message: Message) => {
						return message.body;
					}).subscribe((msg_body) => {
		
						const msg = JSON.parse(msg_body);
						const serverMessage = msg.SERVER_MESSAGE;
						console.log(msg);
						let allData = msg.WORK_LIST;
		
						if (serverMessage === 'ACTIVE') {
		
							if (allData.length > 0) { // 데이터 유무 체크
		
								this.progressRate = allData.rate;
			
								let tskLen = allData[0].taskStatusList.length; // 선택한 항목 갯수 반환
								console.log('tskLen', tskLen);
								let tskIdx = null; // 선택한 항목의 인덱스 반환받을 변수 선언
								let taskType;
								switch(this.data.seq) {
									case 'finalResult': taskType = `workTask_${this.data.seq}_excel`; break;
									case 'ptInfo': taskType = `workTask_${this.data.seq}_excel`; break;
									default: taskType = `workTask_${this.data.seq}_excel`; break;
								}
		
								for (let i = 0; i < tskLen; i++) {
									if (allData[0].taskStatusList[i].taskType === taskType) { // Task의 인덱스를 반환
										tskIdx = i;
									}
								}
			
								if (tskIdx !== null) { // Task가 존재하는 경우
									this.status = 'working';
									const result = allData[0].taskStatusList[tskIdx].resultMap;
		
									if (result.dir) {	
										this.isRun = true;
										this.status = 'complete';
			
										job.unsubscribe();
									}
								}
								if (!this._detective['destroyed']) {
									this._detective.detectChanges();
								}
							}

							if(msg.WORK_HISTORY) {
								console.log(msg);
								const history = Object.getOwnPropertyNames(msg.WORK_HISTORY);
								workIndex = history[history.length - 1];					
								// const workIndex = msg.WORKINDEX_HISTORY[msg.WORKINDEX_HISTORY.length - 1];								
							}					
		
						} else if (serverMessage === 'ALIVE') {
							if(msg.WORK_HISTORY[workIndex] && msg.WORK_HISTORY[workIndex].FILE_LIST) {
								console.log('엑셀 생성 완료');
						
								const file = msg.WORK_HISTORY[workIndex].FILE_LIST[0];

								this.isRun = true;
								this.status = 'complete';
								this.progressRate = 100;
								
								$('.modal-body').trigger('click');

								this.exFilePath = file.dir;
								this.exFileName = file.fileName;
								job.unsubscribe();
							}
						} else if (serverMessage === 'DISCONNECT') {
							if (typeof this.exFileName === 'undefined' || typeof this.exFilePath === 'undefined') {
								this.isRun = false;
								this.status = 'error';
							}
							if (!this._detective['destroyed']) {
								this._detective.detectChanges();
							}
						}
					});
			}
		});		
		

	}
}

