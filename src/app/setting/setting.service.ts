import { Injectable } from "@angular/core";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { AppState } from '../app.state';
import { HandleError } from '../modal/handle-error.component';
import { StoreService } from '../basicmode/store/store.service';

@Injectable()
export class SettingComponentService {

	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
    });

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _store: StoreService
	) {
		this.appurl = this._app.ajaxUrl;
	}

	// GET Job Status
	getLogOut(): Observable<any> {
		const url = 'logout.do';
		return this._http.get(`${this.appurl}${url}`)
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