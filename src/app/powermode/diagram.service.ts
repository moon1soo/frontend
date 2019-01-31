import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { AppState } from '../app.state';
import { ItemListState } from '../item-list.state';
import { PowermodeStoreService } from './store/store.service';
import { DiagramState } from './diagram.state';
import { AppService } from '../app.service';

import * as Model from './model/diagram.model';
import notify from "devextreme/ui/notify";

import { HandleError } from '../modal/handle-error.component';

interface LTList {
	server: {CODE: string; TEXT: string}[];
	client: string[];
	condition?: string;
}
@Injectable()
export class DiagramService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
    });
	// secCodeUrl: string = 'getLookUpDataList.json';
	// itemListUrl: string = 'getFinalAddItemList.json';	
	// runQueryUrl: string = 'getAllGroupInfoResultSQL.json';
	seqIdx: string;

	dataset: any = {
		server: [],
		client:[],
		condition: 'and'
	};
	
	private concernPatientStore = new Subject<any>();
	private LTStore = new Subject<LTList>();
	private dateStore = new Subject<any>();
	private selectionData  = new Subject<any>();
	private curUrl = new Subject<string>();
	private loadStore = new Subject<any>();
	private isUserEditing = new Subject<boolean>();
	private stateWork = new Subject<{mode:string}>();
	private itemList = new Subject<any>();
	private paperClear = new Subject<boolean>();
	private onMasking = new Subject<any>();
	private isReset = new Subject<boolean>();
	private runQuery = new Subject<boolean>();
	private runFinalResult = new Subject<boolean>();

	concernPatientStore$ = this.concernPatientStore.asObservable();
	LTStore$ = this.LTStore.asObservable();
	dateStore$ = this.dateStore.asObservable();
	selectionData$ = this.selectionData.asObservable();
	curUrl$ = this.curUrl.asObservable();
	loadStore$ = this.loadStore.asObservable();
	isUserEditing$ = this.isUserEditing.asObservable();
	stateWork$ = this.stateWork.asObservable();
	itemList$ = this.itemList.asObservable();
	paperClear$ = this.paperClear.asObservable();
	onMasking$ = this.onMasking.asObservable();
	isReset$ = this.isReset.asObservable();
	runQuery$ = this.runQuery.asObservable();
	runFinalResult$ = this.runFinalResult.asObservable();

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
		private _state: ItemListState,
		private _store: PowermodeStoreService,
		private _diagramState: DiagramState,
		private _appService: AppService,
		private _translate: TranslateService
	) {
		this.appurl = this._app.ajaxUrl;
	}

	// 현재위치 저장
	getCurUrl(data: string) {
		this.curUrl.next(data);	
	}
	// 편집여부
	setIsEditing(edit: boolean): void {
		this.isUserEditing.next(edit);
	}	
	// 작업단계 공유
	setStateWork(mode: { mode: string }): void {
		// mode: run, upload, edit, output, finalRun, final
		this.stateWork.next(mode);
	}
	// 페이퍼 클리어
	setPaperClear(clear: boolean): void {
		this.paperClear.next(true);
	}
	// Masking 여부 전달
	setOnMasking(data): void {
		this.onMasking.next(data);
	}
	// Reset 버튼 클릭여부 전달
	setIsReset(data: boolean): void {
		this.isReset.next(true);
	}
	// Run Query 버튼 클릭여부 전달
	setRunQuery(data: boolean): void {
		this.runQuery.next(true);
	}
	// Final Result 실행 여부 전달
	setIsFinalResult(dat: boolean): void {
		this.runFinalResult.next(true);
	}

	// Add Item 리스트 가져오기
	addItemList(seq: string): Observable<any> {
		let locale = this._appService.langInfo;
				
		let params = new URLSearchParams();
		params.set('useType', seq);
		params.set('locale', locale);
		return this._http.get(`${this.appurl}${this._diagramState.ajaxUrl.itemList}`, { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				return response.allList;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// 아이템 리스트 공유
	setShareItemList(data: any) {
		this.itemList.next(data);
	}
	// 선택한 스토어 불러오기
	setLoadStore(store: any) {
		sessionStorage.setItem('powermodeStore', JSON.stringify(store));  
		this._store.setStore = store;		
        this.loadStore.next(store);
    }
	// 룩업테이블 리스트 가져오기
	list(param: {ctgCd: string; itemCd: string; filter: string; groupId: string}): Observable<any> {
  		const store = this._store.store;
		let params = new URLSearchParams();
		params.set('ctgCd', param.ctgCd);
		params.set('itemCd', param.itemCd);
		param.groupId ? params.set('groupId', param.groupId) : params.set('groupId', 'ALL');
		return this._http.post(`${this.appurl}${this._diagramState.ajaxUrl.ltList}`, JSON.stringify(store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				if(param.filter === 'LT') {
					const server = response.allList.slice(0);
					const sendData = {
						server: server,
						client: [],
						condition: 'and'
					};
					this.setLTStore(sendData);
				}
				
				return response.allList;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}	
	// 환자명단 리스트 가져오기
	listPtInfo(): Observable<any> {
		const store = this._store.store;
		return this._http.post(`${this.appurl}${this._diagramState.ajaxUrl.ptInfoList}`, { headers: this.headers })
			.map(res => {
			const response = res.json();
			const server = response.allList.slice(0);
			const sendData = {
				server: server,
				client: []
			};
			this.setLTStore(sendData);
						
			return response.allList;
		})
		.catch((err, caught) => this.handleError(err, caught));
	}
	// 선택한 필터 리스트 가져오기
	selectFilterList({ctgCd, itemCd}: {ctgCd: string, itemCd: string}): Observable<any> {
		const store = this._store.store;
		let params = new URLSearchParams();
		params.set('ctgCd', ctgCd);
		params.set('itemCd', itemCd);
		return this._http.post(`${this.appurl}${this._diagramState.ajaxUrl.selectFilter}`, JSON.stringify(store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				
				return response.allList;
			})
			.catch((err, caught) => this.handleError(err, caught));

	}
	// 기준일 정보 가져오기
	getGubun(groupId: string): Observable<any> {
		const store = this._store.store;

		let params = new URLSearchParams();
		params.set('groupId', groupId);

		return this._http.post(`${this.appurl}${this._diagramState.ajaxUrl.getRefData}`, JSON.stringify(store), { search: params, headers: this.headers })
			.map(res => {
				const response = res.json();
				return response.allList;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}
	// 항목 선택정보 공유
	setselectionData(select: any) {
		const data = {
			isEditable: true,
			selectionDataCell: select 
		}
		this.selectionData.next(data);
	}
	// 룩업테이블/환자정보 선택내역 저장
	setLTStore(data: LTList): void {
		this.LTStore.next(data);
		this.dataset = data;
	}
	// 날짜 선택내역 저장
	setDateStore(data: any): void {
		this.dateStore.next(data);
	}

	// 테이블 데이터 추가
	addData(cell: Model.SelectData, rows: any) {
		const dataset = Object.assign({}, this.dataset);

		const cLen = dataset.client ? dataset.client.length : 0;
		const sLen = rows.length;

		if (cLen + sLen > 1000) {
			notify(this._translate.instant('renewal2017.p.over-thousand'), 'error', 3000);
		} else {
			for(let row of rows) {
				// .indexOf 기능은 필터에서 JSON 위치를 반환시키지 못해서 .findIndex로 대체함
				// dataset.server.splice(dataset.server.indexOf(row), 1); 
				const index = dataset.server.findIndex((part) => {
					return part.CODE === row.CODE && part.TEXT === row.TEXT;
				});
				dataset.server.splice(index, 1); 
				dataset.client.push(row);
			}
			return this.submitData([cell, dataset]);
		}
	}
	// 환자정보 데이터 추가
	addpatientData({cell, rows}: {cell: Model.SelectData; rows: any;}) {	
		const dataset = Object.assign({}, this.dataset);
		const codeList = [];

		if(rows && dataset) {
			for(let list of dataset.server) {
				codeList.push(list.cncnPtNdSeq);
			}
			for(let row of rows) {
				dataset.server.splice(codeList.indexOf(row.cncnPtNdSeq), 1);
				codeList.splice(codeList.indexOf(row.cncnPtNdSeq), 1);
				dataset.client.push(row);
			}
			console.log(dataset);
		}
		return this.submitData([cell, dataset]);
	}
	// 테이블 데이터 삭제
	removeData(cell: Model.SelectData, rows: any[]) {
		let codeList = [];
		const dataset = Object.assign({}, this.dataset);

		for(let list of dataset.client) {
			codeList.push(list);
		}
		dataset.client.splice(codeList.indexOf(rows), 1);
		codeList.splice(codeList.indexOf(rows), 1);
		dataset.server.push(rows);

		this.dataset.server.sort((a, b) => {
			if(a < b) {
				return -1;
			}
			if(a > b) {
				return 1;
			}
		});
		this.submitData([cell, dataset]);
		
	}
	// 테이블 데이터 전체 삭제
	removeClientGroup(cell: Model.SelectData) {
		const dataset = Object.assign({}, this.dataset);

		const serverClone = dataset.server.concat(dataset.client);
		dataset.client = [];
		dataset.server = serverClone;

		this.dataset = dataset;

		this.submitData([cell, dataset]);
	}
	// '포함/제외' 조건 설정
	setCondition(cell: Model.SelectData, data: string) {
		const dataset = Object.assign({}, this.dataset);
		dataset.condition = data;
		this.submitData([cell, dataset]);
	}
	// 컴포넌트로 데이터 주입
	submitData(param: [Model.SelectData, any]) {
		console.log('submitData', param);
		let [cell, dataset] = param;
		this.LTStore.next(dataset);

		return this.saveStore([cell, dataset]);
	}
	// 스토어 저장 준비
	saveStore(param: [Model.SelectData, any]): void {
		let [cell, dataset] = param;
		let store;
		console.log('스토어 저장준비',cell, dataset);
		switch(cell.filterType) {
			case 'PTLIST': 
				let select = [];
				if(dataset.client && dataset.client.length) {
					for(let data of dataset.client) {
						select.push(data.ptNo);
					}
					store = {
						selectCd: select.join('|||'),
						condition: ''
					};
				} else {
					store = {};
				};
				break;
			case 'LT': 
				if(!cell.isFilter) {
					let select = [];
					if(dataset.client && dataset.client.length) {
						for(let data of dataset.client) {
							select.push(data.CODE);
						}
						store = {
							selectCd: select.join('|||'),
							condition: dataset.condition
						};
					} else {
						store = {};
					}										
				} else {
					// 필터일 경우
					let select = [];
					for(let data of dataset.client) {
						select.push(data.CODE);
					}
					store = {
						filter: `${cell.ctgCd}|${cell.itemCd}|${select.join(',')}`
					}
				}
				break;
			case 'CHECK': 
				if(dataset.length) {
					store = {
						selectCd: dataset.join('|||')
					}
				} else {
					store = {};
				}
				
				break;
			case 'RADIO': 
				store = {
					selectCd: dataset
				}
				break;
			case 'YN': 
				store = {
					selectCd: dataset
				}
				break;
			case 'AGE': 
				if(dataset.fromDt || dataset.toDt) {
					store = {
						gubun: dataset.gubun,
						fromDt: dataset.fromDt !== null ? String(dataset.fromDt) : null,
						toDt: dataset.toDt ? String(dataset.toDt) : null
					}
				} else {
					store = {};
				}				
				break;
			case 'RANGE': 
				if(dataset.fromDt || dataset.toDt) {
					store = {
						fromDt: dataset.fromDt !== null ? String(dataset.fromDt) : null,
						toDt: dataset.toDt ? String(dataset.toDt) : null
					}
				} else {
					store = {};
				}				
				break;
			case 'DATE': 
				if(dataset.fromDt || dataset.toDt) {
					if(dataset.gubun === 'range') {
						store = {
							gubun: dataset.gubun,
							fromDt: dataset.fromDt,
							toDt: dataset.toDt
						}
					} else if(dataset.gubun === 'ref') {
						store = {
							gubun: dataset.gubun,
							fromDt: dataset.fromDt,
							toDt: dataset.toDt,
							refItemCd: dataset.refItemCd,
							refCtgCd: dataset.refCtgCd,
							refGroupId: dataset.refGroupId
						}
					}
				} else {
					store = {};
				}
				break;
			case 'FREETEXT': 
				if(dataset.freeText.length && dataset.freeText[0].length) {
					store = dataset;
				} else {
					store = {};
				}				
				break;
			case 'PN': 					
				store = dataset;
				break;
		}
		return this.saveStoreAction([cell, store]);
	}
	// 스토어 저장
	saveStoreAction(param: [Model.SelectData, any]) {
		let [cell, store] = param;

		if(Object.getOwnPropertyNames(store).length) {
			store.groupId = cell.id;
			store.category = cell.ctgCd;
			store.item = cell.itemCd;
		}		
		this._store.shareLTStore([cell, store]);
	}

	// IRB Approval List
	getIRBApprovalList(): Observable<any> {
		let stfNo = sessionStorage.getItem('stfNo');
		const body = JSON.stringify({ 'stfNo': stfNo });
		
		return this._http.post(`${this.appurl}${this._diagramState.ajaxUrl.irbUrl}`, body, { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// IRB Log Insert
	setIRBLog(irbForm): Observable<any> {
		const body = irbForm;

		return this._http.post(`${this.appurl}${this._diagramState.ajaxUrl.irbLog}`, body, { headers: this.headers })
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