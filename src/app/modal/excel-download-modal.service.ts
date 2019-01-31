import { Injectable } from "@angular/core";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { AppState } from '../app.state';
import { HandleError } from './handle-error.component';
import { StoreService } from '../basicmode/store/store.service';
import { PowermodeStoreService } from '../powermode/store/store.service';

@Injectable()
export class ExcelDownloadModalService {

	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
    });

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _store: StoreService,
		private _powerStore: PowermodeStoreService
	) {
		this.appurl = this._app.ajaxUrl;
	}
	
	// 엑셀 생성
	executeExcel(data: { seq: string, mode: string; workIndex?: number; type: string; }): Observable<any> {
		let url = `work/execute/excel/${data.seq}.json?workIndex=` + sessionStorage.getItem('workIndex');
		let store;
		switch(data.mode) {
			case 'basicmode': 
				store = this._store.store;
				break;
			case 'powermode': 
				store = this._powerStore.store;
				break;
			case 'transpose':
				url = `work/execute/transpose.json?workIndex=${sessionStorage.getItem('workIndex')}&type=${data.type}`;
				store = this._store.store;
				break;
		}

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { headers: this.headers })
			.map(res => {
				const response = res.json();
        		return response.workExecutionResultVO;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	getSqlViewLogInsert(seq: any, sql: any, mode: any): Observable<any> {
		const url = 'getSqlViewLogInsert.json';
		let body = {
			'stfNo': sessionStorage.getItem('stfNo'),
			'stfNm': sessionStorage.getItem('stfNm'),
			'ctgNm': seq,
			'exctSql': sql,
			'irbYn': 'Y',
			'excelYn': 'Y',
			'mod': 'guide'
		};

		if (mode === 'powermode') {
			body.mod = 'power';
		}

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(body), { headers: this.headers })
		.map(res => {
			const response = res;
			return response;
		})
		.catch((err, caught) => this.handleError(err, caught));
	}

	// ajax 에러시 예외 처리
	private handleError(error: Response | any, caught: any) {
		
		const headers = error.headers;
		let errorLogId = 'UNKNOWN';

		headers.forEach((value, key) => {
			if (key.toUpperCase() === 'ERRORLOGID') {
				errorLogId = value;
			}
		});
		
		if (errorLogId[0] === '000') {
			console.log('세션이 만료되었습니다.');
			window.location.replace('index.do');
		} else {
			const modalRef = this._modal.open(HandleError);
			modalRef.componentInstance.data = errorLogId;
		}

		console.error('An error occurred', error);
		return Observable.throw(error.message || error);
	}
}