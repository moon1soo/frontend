import { Component, OnInit, Input, Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { Message } from '@stomp/stompjs';

import { AppService } from 'app/app.service';
import { AppState } from 'app/app.state';
import { HandleError } from './handle-error.component';
import { StoreService } from '../basicmode/store/store.service';
import { PowermodeStoreService } from '../powermode/store/store.service';
import { TransposeService } from './transpose-modal.service';
import { DashboardState } from 'app/basicmode/dashboard.state';
import { ExcelDownloadModal } from './excel-download-modal.component';

@Component({
	selector: 'transpose-modal',
    templateUrl: './transpose-modal.component.html',
    providers: [ TransposeService, AppService, StoreService, DashboardState, PowermodeStoreService ]
})
export class TransposeModal implements OnInit {
	@Input() data: {data: any; itemList: any; seq: string};
	@Input() item: any;
	@Input() sql: any;

	closeResult: string;

	exceptColumn: string[] = ['hspTpCd', 'rowID']; // 화면에 표시하지 않음
	dynamicColumns: {dataField: string; caption: string; cssClass: string; width: string;}[] = [];

	dataSource: any[] = [];

	tempData: any;
	tempResult: any;
	tempTitle: any;

	loading: boolean = true;

	excelUrl: string;
	exFileName: string;
	exFilePath: string;

	constructor(
		private _modalService: NgbModal,
		private _app: AppState,
        public _activeModal: NgbActiveModal,
        private _service: TransposeService,
		private _state: DashboardState,
		private _detective: ChangeDetectorRef,
		private _translate: TranslateService
	) {
		this.excelUrl = `${this._app.ajaxUrl}excelDownLoad.do`;
	}
	ngOnInit(): void {

		const type = this.item;

		this._service.getTranspose(type, this.data.seq).subscribe(res => {
			console.log('getTranspose => res', res);
			this.tempData = res.json().result;
			this.tempResult = this.tempData.result;
			this.tempTitle = this.tempData.title;

			this.dxDatatable(this.tempResult);

			setTimeout(() => {
				this.loading = false;
			}, 800);
		});
	}

	onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
	}	

	// 데이터 테이블 구성
	dxDatatable(res: any): void {
		this.dataSource = res;
		this.dynamicColumns = [];

		if (res.length > 0) {
			for(let column of Object.getOwnPropertyNames(res[0])) {
				if(!~this.exceptColumn.indexOf(column)) {
					let caption;
					let style;

					const col = column.split('_');

					if(col[1] !== 'basic' && col.length > 1) {
						for(let data of this.data.itemList) {
							if(data.ctgCd === col[1] && data.itemCd === col[2]) {
								caption = data.itemNm;
								style = 'dynamicAdd';
							}
						}
					} else if (col.length === 1) {
						for (let title of this.tempTitle) {
							const key = Object.keys(title)[0];
							if (col[0] === key) {
								caption = title[key];
								style = 'dynamicAdd';
							}
						}
					} else {
						style = 'normal';
						switch (col[2]) {
							case 'ptNo': caption = this._translate.instant('research.patient.no'); break;
							case 'pactId': caption = this._translate.instant('research.admin.receive.id'); break;
							case 'ptNm': caption = this._translate.instant('research.patient.name'); break;
							case 'sexTpCd': caption = this._translate.instant('research.gender'); break;
							case 'ptBrdyDt': caption = this._translate.instant('research.date.of.birth'); break;
							default: caption = col[2];
						}
					}

					this.dynamicColumns.push({
						dataField: column, caption: caption, cssClass: style, width: '120'
					});
				}
			}
		}
	}

	// excel 다운로드
	excelDownload(): void {
		const elem = document.getElementById('btn-submit-excel-trans');
		setTimeout(() => {
			let event = document.createEvent('Event');
			event.initEvent('click', true, true);
			elem.dispatchEvent(event);
		}, 10);
	}	

	// 엑셀 다운로드 Modal 열기
	excelDownModal() {
		const modalRef = this._modalService.open(ExcelDownloadModal, {
			size: 'lg',
			backdrop: 'static'
		});
		modalRef.componentInstance.data = {seq: 'finalResult', mode: 'transpose', sql: this.sql, type: this.item};
		modalRef.result.then((result) => {
			console.log('Result', result);
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

