import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import {NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../../app.state';
import { HandleError } from '../../../modal/handle-error.component';
import { StoreService } from '../../store/store.service';
import { DashboardService } from '../../dashboard.service';
import { DashboardState } from '../../dashboard.state';

import * as Model from '../../model/dashboard.model';
import * as StoreModel from '../../store/store.model';

@Injectable()
export class NursDeptService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});
	secCode: string = 'nursDept';
	serverData: Model.NursDept[] = [];
	serverClone: Model.NursDept[] = [];

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _store: StoreService,
		private _state: DashboardState,
		private _service: DashboardService
	) {
        this.appurl = this._app.ajaxUrl;
	}
	list(): Observable<any> {
		const store = this._store.store;
		const storage = store[this._state.code[this.secCode].storage];
        let hospital;
		if(store.hospitalStore) {
			hospital = store.hospitalStore.select1.replace(/'/g,'');
		} else {
			hospital = null;
		}

		const body = JSON.stringify({ "basicStore" : { "hspTpCd": hospital, "lclTpCd": "L1"  }});
		
		return this._http.post(`${this.appurl}${this._state.code[this.secCode].url}`,body, { headers: this.headers })
			.map(res => {
				const response = res.json();
				this.serverData = response.allList;
				this.serverClone = response.allList.slice(0);

				const sendData = {
					server: this.serverClone,
					client: [[]],
					condition: [],
					filter: [],
					name: []
				};
				this._service.setNursDeptStore(sendData);
				if(storage) {
					this._service.getStorage(this.secCode, this._state.code[this.secCode].idx, storage);
				}
				return this.serverData.length;
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