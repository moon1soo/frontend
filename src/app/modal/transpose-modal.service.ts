import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../app.state';
import { HandleError } from './handle-error.component';
import { AppService } from '../app.service';
import { StoreService } from '../basicmode/store/store.service';
import { PowermodeStoreService } from '../powermode/store/store.service';

@Injectable()
export class TransposeService {
    appurl: string;
    
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _store: StoreService,
		private _powerstore: PowermodeStoreService,
		private _appService: AppService
	) {
		this.appurl = this._app.ajaxUrl;
	}
	// Transpose 실행
	getTranspose(param: any, seq: string): Observable<any> {
		let url = 'getFinalResultTranspose.json';

		let params = new URLSearchParams();
		params.set('workIndex', sessionStorage.getItem('workIndex'));
		params.set('item', param);
		let store;
		switch(seq) {
			case 'basicmode': store = this._store.store; break;
			case 'powermode': store = this._powerstore.store; break;
		}

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { search: params, headers: this.headers })
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