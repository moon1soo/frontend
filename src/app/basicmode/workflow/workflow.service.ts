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
import { ResultService } from '../interimresult/interim-result.service';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';

@Injectable()
export class WorkflowService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});
	saveurl: string = 'getQueryFlowSave.json';

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _state: DashboardState,
		private _store: StoreService,
		private _service: DashboardService,
		private _resultService: ResultService
	) {
        this.appurl = this._app.ajaxUrl;
	}
	list([storeVo, url]): Observable<any> {
		const store = JSON.stringify(storeVo);
		return this._http.post(`${this.appurl}${url}`, store, { headers: this.headers })
			.map(res => {
				const response = res.json();				
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	cancelJob(): Observable<any> {
		const url = 'work/cancel.json';
		let params = new URLSearchParams();
		params.set('workIndex', this._resultService.getWorkIndex);
		const store = this._store.store;

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { headers: this.headers })
     		.map(res => {
				const response = res;
        		return response;
      		})
      		.catch((err, caught) => this.handleError(err, caught));
	}

	// Job Task 실행(EXECUTE)
	getExecute(): Observable<any> {
		let url = this._state.createJob.interim;
    	// let url = 'work/execute/result.json';
		let store = this._store.store;

		let select = store.basicStore.select;

		if (store.basicStore.select.indexOf('exam') > -1
			&& store.basicStore.select.indexOf('examResult') < 0
			&& store.examResultStore) {
				select = select.replace(/exam/g, 'examResult');
				store.basicStore.select = select;
			}

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { headers: this.headers })
     		.map(res => {
				const response = res;

				if (store.examResultStore
					&& store.basicStore.select.indexOf('examResult') > -1) {
						select = select.replace(/examResult/g, 'exam');
						store.basicStore.select = select;
					}

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