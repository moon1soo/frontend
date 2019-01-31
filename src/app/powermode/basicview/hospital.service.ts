import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import {NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';
import { DashboardState } from '../../basicmode/dashboard.state';

@Injectable()
export class HospitalService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});
	secCode: string =  'hospital';
	
	serverData: any[] = [];
	serverClone: any[] = [];

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _state: DashboardState
	) {		
		this.appurl = this._app.ajaxUrl;
	}
	list(): Observable<any> {
		const formData = JSON.stringify({ "basicStore" : { "hspTpCd" : "1" , "lclTpCd": "L1"  }});
		return this._http.post(`${this.appurl}${this._state.code[this.secCode].url}`, formData, { headers: this.headers })
			.map(res => {
				const response = res.json();
				this.serverData = response.allList;
				this.serverClone = response.allList.slice(0);

				return this.serverData;
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