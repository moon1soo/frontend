import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { StompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { ItemListState } from '../../item-list.state';
import { PowermodeStoreService } from './../store/store.service';
import { DiagramState } from '../diagram.state';
import * as Model from '../model/diagram.model';

import { HandleError } from '../../modal/handle-error.component';

interface LTList {
	server: {list: string}[];
	client: string[];
	condition: string;
}
interface ColumnModel {
    dataField: string; 
    caption: string; 
    category: string; 
    [props: string]: any;
}

@Injectable()
export class ResultService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});	
	// isCreate: boolean = false;
	ageStore: any = {};
	jobCategory: any[] = [];
	workIndex: string;

	stfNo: any;
	sessionId: any;

	job: any;

	private patientResult = new Subject<any>();
	private ptInfoResult = new Subject<any>();
	private startQuery = new Subject<boolean>();
	private ageStoreVo = new Subject<any>();
	private totalCount = new Subject<any>();
	private patientSocketData = new Subject<number>();
	private finishJob = new Subject<boolean>();
	private onMasking = new Subject<any>();
	private columnInfo = new Subject<any[]>();
	private removeColInfo = new Subject<ColumnModel>();

	patientResult$ = this.patientResult.asObservable();
	ptInfoResult$ = this.ptInfoResult.asObservable();
	startQuery$ = this.startQuery.asObservable();
	ageStoreVo$ = this.ageStoreVo.asObservable();
	totalCount$ = this.totalCount.asObservable();
	patientSocketData$ = this.patientSocketData.asObservable();
	finishJob$ = this.finishJob.asObservable();
	onMasking$ = this.onMasking.asObservable();
	columnInfo$ = this.columnInfo.asObservable();
	removeColInfo$ = this.removeColInfo.asObservable();

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _state: DiagramState,
		private _store: PowermodeStoreService,
		private _stomp: StompService,
		private _appService: AppService
	) {
		this.appurl = this._app.ajaxUrl;
		this.stfNo = sessionStorage.getItem('stfNo');
	}
	// wokrIndex 세팅
	set setWorkIndex(idx: any) {
		this.workIndex = idx;
	}
	get getWorkIndex() {
		return this.workIndex;
	}
	// 나이대/성별 데이터 공유
	setCountByAge(data: any) {
		this.ageStore = data;
		this.ageStoreVo.next(data);
	}
	// 건수 공유
	setTotalCount(data: any) {		
		let count = Number(data).toLocaleString();
		this.totalCount.next(count);
	}

	// 환자명단 칼럼정보 공유
	setColumnList(data: any[]) {
		this.columnInfo.next(data);
	}
	// 삭제 칼럼정보 공유
	setRemoveColumn(data: ColumnModel) {
		this.removeColInfo.next(data);
	}
	
	// SQL 불러오기
	getSQLResult(): Observable<any> {
		const store = this._store.store;		
		return this._http.post(`${this.appurl}${this._state.ajaxUrl.sql}`, JSON.stringify(store), { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response.PT_SQLVIEW;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// Patient List excute
	excutePatient(): Observable<any> {
		const store = this._store.store;
		return this._http.post(`${this.appurl}${this._state.sqlReader.create}?type=p`, JSON.stringify(store), { headers: this.headers })
			.map(res => {
				const response = res.json();
				if(response.workExecutionResultVO.workExecutionResultType === 'ACTION_SUCCESS') {
					// this.isCreate = true;
					this.getPatientWorkProgress();
					return response;
				} else {
					this.handleError(response.workExecutionResultVO.message, '');
				}			
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// 실행 취소
	cancelJob(): Observable<any> {		
		return this._http.post(`${this.appurl}${this._state.sqlReader.cancelJob}`, { headers: this.headers })
			.map(res => {
				const response = res.json();
				if(response.workExecutionResultVO.workExecutionResultType === 'ACTION_SUCCESS') {
					// console.log('실행취소');
					this.job.unsubscribe();
				}
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));		
	}
	// 소켓데이터 받아오기
	getPatientWorkProgress() {
		console.log('소켓 실행');
		this.sessionId = sessionStorage.getItem('sessionId');
		setTimeout(() => {
			this.startQuery.next(true);
		}, 10);
		this.job = this._stomp.subscribe(`/user/${this.sessionId}/work/message`)
			.map((message: Message) => {
				return message.body;
			}).subscribe((msg_body) => {
				let msg = JSON.parse(msg_body);
				console.log(msg);
				if(msg) {
					this.patientSocketData.next(msg);
					if(msg.SERVER_MESSAGE === 'ALIVE' || (msg.WORKINDEX_HISTORY && msg.WORKINDEX_HISTORY.length)) {
						this.job.unsubscribe();						
					}
				}
			});		
	}
	// 환자명단 조회
	getQueryResult(index: string): Observable<any> {	
		const store = this._store.store;
		
		let paramIndex;
		if(index) {
			paramIndex = index;
			this.workIndex = index;
		} else {
			paramIndex = this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex');
		}

		let params = new URLSearchParams();
		params.set('workIndex', paramIndex);
		params.set('page', '1');
		params.set('rows', '1000');

		return this._http.post(`${this.appurl}${this._state.sqlReader.query}`, JSON.stringify(store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				this.patientResult.next(response);
				this.finishJob.next(true);
				// this.setCountByAge(response.PATIENT_AGE_COUNT);
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// 카운트 불러오기
	getCountResult(): Observable<any> {
		const store = Object.assign({}, this._store.store);
		let params = new URLSearchParams();
		params.set('workIndex', this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex'));

		let url = this._state.sqlReader.count;
		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				const root = response.result_root;
				if(root.errorCode === 'success') {		
					this.setTotalCount(root.interimResultCount.patientsCount);
					this.setCountByAge(root.patientsResultCountByAge);
					return root;
				} else {
					this.handleError(root.errorCode, '');
				}
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// IRB Approval List
	// getIRBApprovalList(): Observable<any> {
	// 	let stfNo = sessionStorage.getItem('stfNo');
	// 	const body = JSON.stringify({ 'stfNo': stfNo });
		
	// 	return this._http.post(`${this.appurl}${this._state.ajaxUrl.irbUrl}`, body, { headers: this.headers })
	// 		.map(res => {
	// 			const response = res.json();
	// 			return response;
	// 		})
	// 		.catch((err, caught) => this.handleError(err, caught));
	// }

	// IRB Log Insert
	// setIRBLog(irbForm): Observable<any> {
	// 	const body = irbForm;

	// 	return this._http.post(`${this.appurl}${this._state.ajaxUrl.irbLog}`, body, { headers: this.headers })
	// 	.map(res => {
	// 		const response = res.json();
	// 		return response;
	// 	})
	// 	.catch((err, caught) => this.handleError(err, caught));
	// }


	// ajax 에러시 예외 처리
	private handleError(error: Response | any, caught: any) {
		const modalRef = this._modal.open(HandleError);
		
		const reg = /(\d+)(?=\<\/[pP]\>\<[pP]\>\<[bB]\>Description)/g;
		const message = reg.exec(error._body)[0];
		modalRef.componentInstance.data = message;

		console.error('An error occurred', error);
		return Observable.throw(error.message || error);
	}
}