import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../app.state';
import { DashboardState } from '../dashboard.state';

import { HandleError } from '../../modal/handle-error.component';
import { StoreService } from '../store/store.service';
import { DashboardService } from '../dashboard.service';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';

@Injectable()
export class ConvertStoreService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});

    convertUrl: string = 'getConvertGroupInfoStore.json';

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _state: DashboardState,
		private _store: StoreService,
		private _service: DashboardService
	) {
        this.appurl = this._app.ajaxUrl;
	}

	// 파워모드 스토어 가져오기
	convertPowermode(): Observable<any> {
		return this._http.post(`${this.appurl}${this.convertUrl}`, JSON.stringify(this._store.store), { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response.result;
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