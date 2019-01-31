import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';
import { StoreService } from '../store/store.service';
import { DashboardState } from '../dashboard.state';
import { AppService } from '../../app.service';
// import { ResultService } from '../interimResult/interim-result.service';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';

@Injectable()
export class FinalResultService {	
	appurl: string;
	workIndex: string;

	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});
	secCodeUrl: string = 'getFinalAddItemList.json';

	seqCode: string = 'final';

	exceptData: any;

	private sql = new Subject<any>();
	private totalCount = new Subject<any>();
	private onMasking = new Subject<any>();

	sql$ = this.sql.asObservable();
	totalCount$ = this.totalCount.asObservable();
	onMasking$ = this.onMasking.asObservable();

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _store: StoreService,
		private _state: DashboardState,
		private _appService: AppService
	) {
		this.appurl = this._app.ajaxUrl;
	}
	// wokrIndex 세팅
	set setWorkIndex(idx: any) {
		this.workIndex = idx;
	}
	get getWorkIndex() {
		return this.workIndex;
	}

	// Masking 여부 전달
	setOnMasking(data) {
		this.onMasking.next(data);
	}

	// 스토어 값 가져오기
	getStore() {
		const store = Object.assign({}, this._store.store);
		let select;
		let condition;
		if(store.basicStore.select) {
			select = store.basicStore.select.split(',');
			condition = store.basicStore.condition.split(',');
		}
		
		if(this.exceptData) {
			select = this.exceptData.select;
			condition = this.exceptData.condition;
		} else {
			select = store.basicStore.select.split(',');
			condition = store.basicStore.condition.split(',');
		}			
		store.basicStore.select = select.join(',');
		store.basicStore.condition = condition.join(',');

		return store;
	}	

	// Add Item 리스트 가져오기
	list(): Observable<any> {
		let locale = this._appService.langInfo;

		let params = new URLSearchParams();
		params.set('useType', 'A');
		params.set('locale', locale);
		return this._http.get(`${this.appurl}${this.secCodeUrl}`, { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				return response.allList;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}		
	// 최종 환자 명단 불러오기
	getQueryFinalResult(url): Observable<any> {
		let params = new URLSearchParams();
		params.set('workIndex', this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex'));

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(this._store.store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// 최종 환자 건수 불러오기
	getCountFinalResult(): Observable<any> {
		let params = new URLSearchParams();
		params.set('workIndex', this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex'));

		return this._http.post(`${this.appurl}${this._state.resultCount[this.seqCode]}`, JSON.stringify(this._store.store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// sql 불러오기
	getSQLFinalResult(): Observable<any> {
		let params = new URLSearchParams();
		params.set('workIndex', this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex'));

		return this._http.post(`${this.appurl}${this._state.sqlViewer[this.seqCode]}`, JSON.stringify(this._store.store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// SQL 불러오기
	getSQLResult(url: string): Observable<any> {
		let store = this.getStore();
		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// 엑셀 생성 요청
	createExcel(url: string) {		
		return this._http.post(`${this.appurl}${url}`, JSON.stringify(this._store.store), { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// Job Task 실행(EXECUTE FINAL)
	getExecuteFinal(): Observable<any> {
		let url = this._state.createJob.final;
		let params = new URLSearchParams();
		params.set('workIndex', sessionStorage.getItem('workIndex'));

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(this._store.store), {search: params, headers: this.headers })
     		.map(res => {
				const response = res;
        		return response;
      		})
      		.catch((err, caught) => this.handleError(err, caught));
	}

	getJobStatus(url: string): Observable<any> {
		return this._http.get(`${this.appurl}${url}`).map(res => {
			return res.json();
		})
		.catch((err, caught) => this.handleError(err, caught));
	}

	cancelJob(): Observable<any> {
		const url = 'work/cancel.json';
		const store = this._store.store;
		let params = new URLSearchParams();
		params.set('workIndex', this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex'));

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { search: params, headers: this.headers })
     		.map(res => {
				const response = res;
        		return response;
      		})
      		.catch((err, caught) => this.handleError(err, caught));
	}

	// IRB Log Insert
	setIRBLog(irbForm): Observable<any> {
		const body = irbForm;
		const url = 'getIRBLogInsert.json';

		return this._http.post(`${this.appurl}${url}`, body, { headers: this.headers })
		.map(res => {
			const response = res.json();
			return response;
		})
		.catch((err, caught) => this.handleError(err, caught));
	}

	// 카운트 불러오기
	getCountResult(url: string): Observable<any> {
		let store = this.getStore();
		let params = new URLSearchParams();
		params.set('workIndex', this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex'));

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { search: params, headers: this.headers })
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