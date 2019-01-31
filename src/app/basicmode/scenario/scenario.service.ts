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
export class ScenarioService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});
	myurl: string = 'getQueryFlowAllList.json';
	sharedurl: string = 'getQueryFlowSharedList.json';
	editurl: string = 'getQueryFlowUpdate.json';
	saveurl: string = 'getQueryFlowSave.json';
	deleteurl: string = 'getQueryFlowDelete.json';
	openurl: string = 'getQueryFlowDetailList.json';
	uploadurl: string = 'getPatientListExcelUpload.json';

  	myServerData: Model.myQueries[] = [];
	myServerClone: Model.myQueries[] = [];
	
	sharedServerData: Model.sharedQueries[] = [];
	sharedServerClone: Model.sharedQueries[] = [];

	stfNo = sessionStorage.getItem('stfNo');

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

	// My Queries 
	myQueries(): Observable<any> {
    	const stfData = JSON.stringify({ 'stfNo': this.stfNo });
    	return this._http.post(`${this.appurl}${this.myurl}`, stfData, { headers: this.headers })
      		.map(res => {
				const response = res.json();
				this.myServerData = response.result;
				this.myServerClone = response.result.slice(0);
        return this.myServerData;
		})
		.catch((err, caught) => this.handleError(err, caught));
	}

	// Shared Queries 
	sharedQueries(): Observable<any> {
		const stfData = JSON.stringify({ 'stfNo': this.stfNo });
		
    	return this._http.post(`${this.appurl}${this.sharedurl}`, stfData, { headers: this.headers })
      		.map(res => {
				const response = res.json();
				this.sharedServerData = response.result;
				this.sharedServerClone = response.result.slice(0);
        return this.sharedServerData;
		})
		.catch((err, caught) => this.handleError(err, caught));
	}

	// 시나리오 불러오기 액션
	openQuery(id): Observable<any> {
		const body = JSON.stringify({ "queryFlowId": id });
		return this._http.post(`${this.appurl}${this.openurl}`, body, { headers: this.headers })
			.map(res => {
				const response = res.json();
				this._store.restoreStore(response['result']);		
				
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// 시나리오 저장 액션
	saveQuery(storeVo: any): Observable<any> {
    	const store = JSON.stringify(storeVo);
		return this._http.post(`${this.appurl}${this.saveurl}`, store, { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// 시나리오 삭제 액션
	deleteQuery(scId: string): Observable<any> {
		const body = JSON.stringify({ "queryFlowId": scId });
		return this._http.post(`${this.appurl}${this.deleteurl}`, body, { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// 시나리오 제목 수정 액션
	editQuery(scId: string, scNm: string): Observable<any> {
		const body = JSON.stringify({ "queryFlowId": scId, "queryFlowNm": scNm });
		return this._http.post(`${this.appurl}${this.editurl}`, body, { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// 환자명단 업로드 액션
	uploadPatients(): Observable<any> {
		const store = this._store.store;
		return this._http.post(`${this.appurl}${this.uploadurl}`, store, { headers: this.headers })
			.map(res => {
				const response = res.json();
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