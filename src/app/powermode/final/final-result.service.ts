import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { StompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';
import { PowermodeStoreService } from '../store/store.service';
import { DiagramState } from '../diagram.state';


@Injectable()
export class FinalResultService {	
	appurl: string;
	workIndex: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});
	secCodeUrl: string = 'getFinalAddItemList.json';
	
    storeVo: any = this._store.store;
	exceptData: any;
	
	// appUrl: {ajaxUrl: string; socketUrl: string};

	private sql = new Subject<any>();
	private totalCount = new Subject<any>();
	private socketData = new Subject<any>();
	private startQuery = new Subject<boolean>();

	sql$ = this.sql.asObservable();
	totalCount$ = this.totalCount.asObservable();
	socketData$ = this.socketData.asObservable();
	startQuery$ = this.startQuery.asObservable();

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _store: PowermodeStoreService,
		private _state: DiagramState,
		private _stomp: StompService
	) {
		// console.log(this._app);'
		// setTimeout(() => {
		// 	this.appurl = this._app.ajaxUrl;
		// 	console.log(this._app.ajaxUrl);
		// }, 10);
		
	}

	// wokrIndex 세팅
	set setWorkIndex(idx: any) {
		this.workIndex = idx;
	}
	get getWorkIndex() {
		return this.workIndex;
	}

	// 최종 결과 실행
	finalExcute(store: any, index: any, url: string): Observable<any> {		
		let params = new URLSearchParams();
		params.set('workIndex', index);
		console.log('파이널 excute 스타트');	
		return this._http.post(`${url}${this._state.sqlReader.finalCreate}`, JSON.stringify(store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				if(response.workExecutionResultVO.workExecutionResultType === 'ACTION_SUCCESS') {		
					console.log('파이널 excute');			
					this.getWorkProgress();
					return response;
				} else {
					this.handleError(response.workExecutionResultVO.message, '');
				}
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// 소켓데이터 받아오기
	getWorkProgress() {		
		let stfNo = sessionStorage.getItem('stfNo');
		let sessionId = sessionStorage.getItem('sessionId');

		let job = this._stomp.subscribe(`/user/${sessionId}/work/message`)
			.map((message: Message) => {
				return message.body;
			}).subscribe((msg_body) => {
				let msg = JSON.parse(msg_body);
				console.log(msg);
				console.log('파이널 소켓 실행');
				
				if(msg) {
					this.socketData.next(msg);
					if(msg.SERVER_MESSAGE === 'ALIVE') {
						job.unsubscribe();
					}
				}
			});
	}
	// 실행 취소
	cancelJob(): Observable<any> {
		let params = new URLSearchParams();
		params.set('workIndex', this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex'));
		return this._http.post(`${this.appurl}${this._state.sqlReader.cancelJob}`, { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));		
	}
	// 최종결과 조회
	getQueryFinalResult(url: string): Observable<any> {
		setTimeout(() => {
			this.startQuery.next(true);
		}, 10);
		const store = this._store.store;
		return this._http.post(`${url}`, JSON.stringify(store), { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// 최종 환자 건수 불러오기
	getCountFinalResult(url: string): Observable<any> {
		return this._http.post(`${url}`, { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response.result_root;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// sql 불러오기
	getSQLFinalResult(store: any, url: string): Observable<any> {
		return this._http.post(`${url}${this._state.ajaxUrl.finalSql}`, JSON.stringify(store), { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// IRB Log Insert
	// setIRBLog(irbForm): Observable<any> {
	// 	const body = irbForm;
	// 	const url = 'getIRBLogInsert.json';

	// 	return this._http.post(`${this.appurl}${url}`, body, { headers: this.headers })
	// 	.map(res => {
	// 		const response = res.json();
	// 		return response;
	// 	})
	// 	.catch((err, caught) => this.handleError(err, caught));
	// }

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