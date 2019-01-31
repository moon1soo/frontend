import { Injectable } from "@angular/core";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';
import { StoreService } from '../store/store.service';
import { DashboardState } from '../dashboard.state';
import { StompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';

@Injectable()
export class ResultService {

	workIndex: string;

	interimResult: any;
	isCreate: boolean = false;
	ageStore: any = {};

	stfNo = sessionStorage.getItem('stfNo');
	jobCategory: any[] = [];

	setData: any = {
        patient: false,
        visit: false,
        diagnosis: false,
        exam: false,
		examResult: false,
		pathology: false,
        medicine: false,
        order: false,
        fee: false,
        surgical: false,
        cc: false,
        form: false,
        nursDiag: false,
		nursState: false,
		nursEav: false,
		nursAssm: false,
		concernPatient: false,
		rediation: false,
        final: false
	};

	private sql = new Subject<any>();
	private totalCount = new Subject<any>();
	private except = new Subject<any>();
	private patientList = new Subject<any>();
	private ageStoreVo = new Subject<any>();
	private seqCode = new Subject<string>();
	private irbExists = new Subject<boolean>();
	private onLine = new Subject<any>();
	private onMasking = new Subject<any>();
	private jobCompleted = new Subject<any>();
	private socketData = new Subject<number>();
	private currentSeq = new Subject<any>();

	sql$ = this.sql.asObservable();
	totalCount$ = this.totalCount.asObservable();
	except$ = this.except.asObservable();
	patientList$ = this.patientList.asObservable();
	ageStoreVo$ = this.ageStoreVo.asObservable();
	seqCode$ = this.seqCode.asObservable();
	irbExists$ = this.irbExists.asObservable();
	onLine$ = this.onLine.asObservable();
	onMasking$ = this.onMasking.asObservable();
	jobCompleted$ =  this.jobCompleted.asObservable();
	socketData$ = this.socketData.asObservable();
	currentSeq$ = this.currentSeq.asObservable();

	count: any = {};
	exceptData: any;

	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});

	patientCreateUrl = 'getInterimResultPatientListCreate.json';
	getExcelUrl = 'excelDownLoad.do ';
	irbUrl = 'getIRBApprovalList.json';

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _store: StoreService,
		private _state: DashboardState,
		private _stomp: StompService
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

	// 현재 실행중인 주제영역 전달
	setCurrentSeq(data) {
		this.currentSeq.next(data);
	}

	// Masking 여부 전달
	setOnMasking(data) {
		this.onMasking.next(data);
	}

	// 전체 Job 완료 여부 전달
	setJobCompleted(data) {
		this.jobCompleted.next(data);
	}

	// 항목별 Progress Data 완료 여부 전달 
	setOnLine(data) {
		this.onLine.next(data);
	}
	// 제외조건 변경여부 저장
	setExcept(data: any) {
		this.exceptData = data;
		this.except.next(data);
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
	
	// 중간결과 불러오기
	getQueryResult(url: string): Observable<any> {
		let store = this.getStore();
		let params = new URLSearchParams();
		params.set('workIndex', this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex'));

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				this.interimResult = response.PATIENT_InterimResult_List;
				this.patientList.next(response.PATIENT_InterimResult_List);
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	
	// Job Task 실행(EXECUTE)
	getExecute(): Observable<any> {
		let url = this._state.createJob.interim;
    	// let url = 'work/execute/result.json';
		let store = this.getStore();

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

	// IRB Approval List
	getIRBApprovalList(): Observable<any> {
		const body = JSON.stringify({ 'stfNo': this.stfNo });
		
		return this._http.post(`${this.appurl}${this.irbUrl}`, body, { headers: this.headers })
			.map(res => {
				const response = res.json();
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

	// Patient List Create
	patientListCreate(): Observable<any> {
		let store = this.getStore();
		return this._http.post(`${this.appurl}${this.patientCreateUrl}`
			, JSON.stringify(store), { headers: this.headers })
			.map(res => {
				const response = res.json();
				if(res) {
					this.isCreate = true;
				}				
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
	// 나이대/성별 데이터 불러오기
	getPopulationResult(url: string): Observable<any> {
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
		let store = this.getStore();

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	
	// sql 데이터 공유
	setSql(data: string) {
		this.sql.next(data);
	}
	// 현재 탭 위치 공유
	setSeq(data: string) {
		if (data === 'examResult') {
			data = 'exam';
		}
		this.seqCode.next(data);
	}
	// 건수 공유
	setTotalCount(data: any, seq: string) {
		const store = this._store.store;
		let selectGroup = [];
		if(store.basicStore.select) {
			selectGroup = store.basicStore.select.split(',');
		}
		let count = {};
		// if(seq === 'patient') {
		// 	count[seq] = {title: seq, ptCount: Number(data).toLocaleString(), index: 0};
		// } else {
		// 	count[seq] = {
		// 		title: seq, 
		// 		ptCount: Number(data.ptCount).toLocaleString(),
		// 		resultCount: Number(data.resultCount).toLocaleString(),
		// 		index: selectGroup.indexOf(seq)
		// 	};
		// }
		count[seq] = {
			title: seq, 
			ptCount: Number(data.patientsCount).toLocaleString(),
			// ptCount: Number(data.patientsCount).toLocaleString(),
			resultCount: Number(data.resultCount).toLocaleString(),
			index: selectGroup.indexOf(seq)
		};

		this.totalCount.next(count);
	}
	// 나이대/성별 데이터 공유
	setCountByAge(data: any) {
		this.ageStore = data;
		this.ageStoreVo.next(this.ageStore);
	}

	// Job Status
	getJobStatus(url: string): Observable<any> {
		return this._http.get(`${this.appurl}${url}`).map(res => {
			return res.json();
		})
		.catch((err, caught) => this.handleError(err, caught));
	}
	
	cancelJob(): Observable<any> {
		const url = 'work/cancel.json';
		let params = new URLSearchParams();
		params.set('workIndex', this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex'));

		const store = this._store.store;

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(store), { search: params,  headers: this.headers })
     		.map(res => {
				const response = res;
        		return response;
      		})
      		.catch((err, caught) => this.handleError(err, caught));
	}

	getWorkProgress() {
		const sessionId  = sessionStorage.getItem('sessionId');

		let job =
			this._stomp.subscribe(`/user/${sessionId}/work/message`)
				.map((message: Message) => {
					return message.body;
				}).subscribe((msg_body) => {
					let msg = JSON.parse(msg_body);
					
					if (msg) {
						this.socketData.next(msg);

						if (msg.SERVER_MESSAGE === 'DISCONNECT' || (msg.WORKINDEX_HISTORY && msg.WORKINDEX_HISTORY.length)) {
							job.unsubscribe();
						}
					}
				});
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