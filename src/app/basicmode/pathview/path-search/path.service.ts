import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../../app.state';
import { HandleError } from '../../../modal/handle-error.component';
import { StoreService } from '../../store/store.service';
import { DashboardService } from '../../dashboard.service';
import { DashboardState } from '../../dashboard.state';

import * as Model from '../../model/dashboard.model';
import * as StoreModel from '../../store/store.model';

@Injectable()
export class PathService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});

	secCode: string =  'pathology';
	
	serverData: Model.PathList[] = [];
	serverClone: Model.PathList[] = [];


	// Deprecated
	static etcFreeCtrl : any = {
		freeTextCondition: [''],
		freeText: ['']
	};

	// Deprecated
	static mainFreeCtrl : any = {
		freeTextCondition: ['and','and','and'],
		freeText: ['','','']
	};

	sendData : any;
	autoComplete : any;

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

		return this._http.post(`${this.appurl}${this._state.code[this.secCode].url}`, body, { headers: this.headers })
			.map(res => {
				console.log(`${this.appurl}${this._state.code[this.secCode].url}`);
				const response = res.json();
				this.serverData = response.allList;
				this.serverClone = response.allList.slice(0);

				this.sendData = {
					server: this.serverClone,
					client: [],
					condition: [],
					filter: [],
					name: [],
					freeText: [],
					freeTextCondition: [],
					testDtSt: null,
					testDtEd: null,
					filterCd: 'plrtLdatKey'
				};

				if(storage) {
					let data = Object.assign({}, this.sendData);
					for(let key of Object.keys(data)) {
						if(~this._state.stringArrayType.indexOf(key) || ~this._state.stringType.indexOf(key)) {
							data[key] = storage[key];
						}
					}
					this._service.setPathologyStore(data);
					setTimeout(() => {
						this._service.getStorage(this.secCode, this._state.code[this.secCode].idx, storage);
					}, 100);
				} else {
					this._service.setPathologyStore(this.sendData);
				}
				return this.sendData;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	getAutoCompleteList(sec: string): Observable<any> {
		const store = this._store.store;
		const storage = store[this._state.code[sec].storage];

		return this._http.post(`${this.appurl}${this._state.code[sec].url}`, null, { headers: this.headers })
			.map(res => {
				const response = res.json();
				let priLists = response.priLdatVal.slice(0);
				let dgnsLists = response.dgnsLdatVal.slice(0);
				let pcLists = response.pcLdatVal.slice(0);
				let scndLists = response.scndLdatVal.slice(0);
				
				this.autoComplete = {
					priLdatVal: priLists,
					dgnsLdatVal: dgnsLists,
					pcLdatVal: pcLists,
					scndLdatVal: scndLists
				};

				if(storage) {
					let data = Object.assign({}, this.autoComplete);
					for(let key of Object.keys(data)) {
						if(~this._state.stringArrayType.indexOf(key) || ~this._state.stringType.indexOf(key)) {
							data[key] = storage[key];
						}
					}
					this._service.setPathologyAutoCompleteStore(data);
					setTimeout(() => {
						this._service.getStorage(sec, this._state.code[sec].idx, storage);
					}, 100);
				} else {
					this._service.setPathologyAutoCompleteStore(this.autoComplete);
				}
			
				return this.autoComplete;
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
	
	// 테이블 데이터 추가
	addData(seq: string, idx:number, rows: any) {
		const codeList = [];
		const code = this._service.secCode(seq);

		
		let dataset = Object.assign({}, this._service.dataset);

		if(rows == 'E1244') {
			dataset.client.splice(0, dataset.client.length);
			dataset.name.splice(0, dataset.name.length);
			dataset.condition.splice(0, dataset.condition.length);
			dataset.client.push([]);
			dataset.name.push();
			return;

		}

		if(rows && dataset) {
			if(this._service.curLocation !== 'final') {

				if (idx == 0) {
					for(let i = dataset.client.length; i >= 0; i--) {
						//console.log('pop')
						dataset.client.splice(i - 1, 1);
						dataset.name.splice(i - 1, 1);
						dataset.condition.splice(i - 1, 1);
					}
				}
				
				if(!dataset.client[idx]) {
					dataset.client.push([]);
					dataset.name.push();
				}

				if(!~this._service.stringStorage.indexOf(seq)) {
					if(!dataset.condition[idx]) {
						dataset.condition[idx] = 'and';
					}
				}

				dataset.client[idx].push(rows);
				dataset.name[idx] = rows.plrtLdatKey;
			} 
			return this._service.submitData(seq, dataset);
		}
	}
	
}