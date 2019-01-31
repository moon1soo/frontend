import { Injectable, ChangeDetectorRef  } from '@angular/core';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import * as Model from './store.model';

import { AppState } from '../../app.state';
import { DashboardState } from '../dashboard.state';
import { ItemListState } from '../../item-list.state';

import { HandleError } from '../../modal/handle-error.component';
import { assertNotNull } from '@angular/compiler/src/output/output_ast';
import { DashboardFunc } from '../dashboard.func';
import { AppService } from '../../app.service';

import { StompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';

@Injectable()
export class StoreService {
	localstore: any = {};
	condition: string[] = [];
	select: string[] = [];
	// curItemCd: string;
	setBasic: any = {
		hspTpCd: null,
		lclTpCd: 'L1',
		rschRprvId: 'CRI',
		gender: 'A',
		ageTpCd: 'Y',
		age1: null,
		age2: null,
		pactTpCd: 'A',
		ptBrdyDtSt: null,
		ptBrdyDtEd: null,
		stfNo: sessionStorage.getItem('stfNo'),
		irbNo: null,
		irbMethod: '4',
		uploadPatients: null
		// irbNo: '111-1111-111', // 테스트용
		// irbMethod: '1' // 테스트용
	};

	private storeVo = new Subject<Model.StoreVo>();
	private hospitalVo = new Subject<any>();
	private conditionVo = new Subject<string>();
	private selectVo = new Subject<string>();
	private deleteVo = new Subject<string>();
	private exceptCon = new Subject<any>();
	private socketData = new Subject<any>();
	// private curItemCd = new Subject<string>();

	storeVo$ = this.storeVo.asObservable();
	hospitalVo$ = this.hospitalVo.asObservable();
	conditionVo$ = this.conditionVo.asObservable();
	selectVo$ = this.selectVo.asObservable();
	deleteVo$ = this.deleteVo.asObservable();
	exceptCon$ = this.exceptCon.asObservable();
	socketData$ = this.socketData.asObservable();
	// curItemCd$ = this.curItemCd.asObservable();

	stfNo = sessionStorage.getItem('stfNo');
	exProgress: any;

	constructor(
		private _state: DashboardState,
		private _finalState: ItemListState,
		private _router: Router,
		private _ref: ChangeDetectorRef,
		private _func: DashboardFunc,
		private _appService: AppService,
		private _stomp: StompService
	) {
		const item = JSON.parse(sessionStorage.getItem('store'));
		if(item) {
			this.localstore = item;
			// console.log(item);
		} else {			
			this.localstore = {
				'basicStore': this.setBasic
			}
			// console.log(this.localstore);
		}

		if(this._appService.staffInfo) {
            this.setBasic.stfNo = this._appService.staffInfo.number;            
        } else {
            this.setBasic.stfNo = sessionStorage.getItem('stfNo');
		}
	}

	get store(): any {
        return this.localstore;
    }
    set setStore(store: any) {
		this.localstore = store;
		// this.shareStore();
	}


	checkDuplCate(key: string): string {
		for (let cate of this._state.processGroup) {
			const prop = Object.getOwnPropertyNames(cate);
			const arr = cate[prop[0]].split(',');
			if (~arr.indexOf(key)) {
				return prop[0];
			}
		}
	}
	
	// 스토어 저장
	shareStore() {
		this.storeVo.next(this.localstore);
		sessionStorage.setItem('store', JSON.stringify(this.localstore));
		// console.log('세션저장스토어',JSON.parse(sessionStorage.getItem('store')));
	}
	// 스토어 갱신
	restoreStore(store: any) {
		this.localstore = store;
		console.log(this.localstore);
		this.localstore.basicStore['stfNo'] = sessionStorage.getItem('stfNo');
		this.shareStore();
	}

	// and, or 조건 추가
	shareCondition([select, condition]: any) {
		if(select) {
			this.localstore['basicStore'].select = select;
		}
		if(condition) {
			this.localstore['basicStore'].condition = condition;
		}
		this.shareStore();
	}
	// 색인 추가/삭제
	shareWordIndex(storage: string, data: string[]) {
		this.localstore[storage].name1 = data;

		this.shareStore();
	}

	// basicStore 수정
	shareBasicDefault(data: any) {
		console.log('베이직스토어',data);
		let prevStore = Object.assign({}, this.localstore['basicStore']);
		let newData;
		 
		for(let key of Object.getOwnPropertyNames(data)) {
			if(!data[key] && !~this._state.visitInBasicStore.indexOf(key) && !~this._state.hospitalBasicStore.indexOf(key)) {
				delete data[key];
			} else if(!data[key] && key === 'pactTpCd') {
				data[key] = 'A';
			}
		}
		if(prevStore) {
			const assign = Object.assign(prevStore, data);
			// console.log(assign);
			this.localstore['basicStore'] = assign;
		} else {
			this.localstore['basicStore'] = data;
		}

		// let isMedical = Object.keys(this.localstore.basicStore).filter(key => {
		// 	return ~this._state.visitInBasicStore.indexOf(key) && this.localstore.basicStore.key;
		// });
		let isVisit = this._state.visitInBasicStoreVar.filter(key => {
			return this.localstore.basicStore[key] && this.localstore.basicStore[key].length;
		});
		if((isVisit.length && !this.localstore.medicalStore) && (isVisit.length && !this.localstore.doctorStore)) {
			console.log('visit 존재여부',isVisit);
			this.localstore.medicalStore = {
				select1: [],
				name1: [],
				condition1: []
			}
		}
		// console.log(isMedical);
		
		this.shareStore();
	}
	// 병원 스토어
	shareHospital(data: Model.StringStoreVo) {
		this.localstore['hospitalStore'] = data;
		this.hospitalVo.next(data);
		this.shareStore();
	}
	// 테이블 스토어
	shareTableStore(data: Model.TableStoreVo, seq: string) {
		console.log('스토어 최종 저장', data, seq);
		const dataset = Object.assign({}, this.localstore[seq], data);
		let isEmpty = [];
		for(let key of Object.keys(data)) {
			if(data[key] && data[key].length > 1) {
				isEmpty.push(false);	
			} else if(
				data[key] && 
				data[key].length === 1 && 
				data[key][0].length && key !== 'freeTextCondition'
			) {
				isEmpty.push(false);
			}
		}
		if(!isEmpty.length) {
			// delete this.store[seq];			 
			if(seq === 'medicalStore') {
				// mdedicalStore의 경우 수진일/환자구분/수진당시나이 데이터가 존재하면 삭제하지 않음.				
				let isVisit = this._state.visitInBasicStoreVar.filter(key => {
					return this.localstore.basicStore[key] && this.localstore.basicStore[key].length;
				});
				console.log('베이직스토어 상황',isVisit);
				if(!isVisit.length && this.localstore.basicStore.pactTpCd === 'A') {
					this.removeTableStore(seq);
				} else {
					this.localstore.medicalStore = data;
				}
			} else {
				// 데이터가 없는 스토어는 삭제
				this.removeTableStore(seq);
			}			
		} else {
			this.localstore[seq] = dataset;
		}
		// this.store[seq] = dataset;		
		this.shareStore();
	}	
	// 기타 스토어
	shareEtcStore(data: any, seq: string) {
		this.localstore[seq] = data;
		this.shareStore();
	}
	// finalResultStore 저장
	shareFinalStore(data: any, seq: string) {
		console.log(data);
		let prevStore = this.localstore['finalResultStore'];
		if(prevStore) {
			const assign = Object.assign(prevStore, data);
			this.localstore['finalResultStore'] = assign;
		} else {
			this.localstore['finalResultStore'] = data;
		}
		this.shareStore();
	}
	// finalResultStore 필터 저장 
	shareFinalStorefilter(data: string[], storage: string, dataCd: string): void {
		let prevStore = this.localstore['finalResultStore'];
		const filterset = {filter: []};		
		let curItemCd: string;
		for(let key of this._finalState.matchAddItem) {
			if(key.store === storage && key.itemCd === dataCd && typeof key.itemCd !== 'undefined') {
				curItemCd = key.itemCd;
			}
		}
		if(!prevStore) {
			this.localstore['finalResultStore'] = filterset;
		}
		if(!this.localstore['finalResultStore'].filter) {
			this.localstore['finalResultStore'].filter = [];
		}
		const tar = this.localstore['finalResultStore'].filter;
		const param = `${this.checkDuplCate(storage)}|${curItemCd}|${data.join(',')}`;
		if(tar.length) {
			let duplicate;
			for(let i=0; i<tar.length; i++) {
				const arr = tar[i].split('|');
				if(arr[0] === this.checkDuplCate(storage) && arr[1] === curItemCd) {
					tar.splice(i, 1, param); 
					duplicate= true;
					break;
				}
			}
			if(!duplicate) {
				tar.push(param);
			}
		} else {
			tar.push(param);
		}

		this.shareStore();
	}
	
	// 스토어 삭제
	removeTableStore(storeNm: string) {
		let group = this.checkDuplCate(storeNm);
		// console.log(this.localstore.basicStore);
		if(this.localstore.basicStore.select) {
			const select = this.localstore.basicStore.select.split(',');

			delete this.localstore[storeNm];
			if(~select.indexOf(group)) {
				this.removeBasicStoreSelect(group)
			}
			this.shareStore();
		}
	}
	// 스토어 삭제
	removeStore(group: string, storeNm: string) {
		console.log('스토어삭제2', group, storeNm);
		const select = this.localstore.basicStore.select.split(',');

		if(~select.indexOf(group)) {
			if(select.length === 1) {
				this.localstore['basicStore'].select = null;
				this.localstore['basicStore'].condition = null;
			} else if(select.length > 1) {		
				this.removeBasicStoreSelect(group);
			}
		}
		delete this.localstore[storeNm];

		if(group === 'visit') {
			for(let key of this._state.visitInBasicStoreVar) {
				this.localstore.basicStore[key] = null;
			}
			this.localstore.basicStore.ageTpCd = 'Y';
			this.localstore.basicStore.pactTpCd = 'A';
		}

		this.shareStore();
		this.deleteVo.next(storeNm);
	}
	// 그룹 삭제
	removeBasicStoreSelect(group: string): void {
		const select = this.localstore.basicStore.select.split(',');
		const condition = this.localstore.basicStore.condition.split(',');
		const idx = select.indexOf(group);

		select.splice(idx, 1);
		condition.splice(idx, 1);
		this.localstore['basicStore'].select = select.join(',');
		this.localstore['basicStore'].condition = condition.join(',');
	}
	// 스토어 순서 변경
	reArrStore(param: any): void {
		const [group, condition] = param;
		this.localstore['basicStore'].select = group.join(',');
		this.localstore['basicStore'].condition = condition.join(',');
		this.shareStore();
	}
	// 제외 조건 설정
	exceptResult(data: any) {
		this.exceptCon.next(data);
	}
	// 스토어 전체 리셋
	resetStore(param: any): void {		
		const setBasic: any = {
			hspTpCd: null,
			lclTpCd: 'L1',
			rschRprvId: 'CRI',
			gender: 'A',
			ageTpCd: 'Y',
			age1: null,
			age2: null,
			pactTpCd: 'A',		
			ptBrdyDtSt: null,
			ptBrdyDtEd: null,
			stfNo: sessionStorage.getItem('stfNo'),
			irbNo: '',
			irbMethod: '4'			
		};
		this.localstore = {
			'basicStore': setBasic
		} 
		this.shareStore();
		this._func.setCreatePatient(true);
		this._func.setRunQuery(false);
		let url = this._router.url.split('/');
		if (param === 'home') {
			this._router.navigateByUrl("/tempAuth.do/gate", { skipLocationChange: true });
		} else {
			if(url[url.length -1] === 'concernView') {
				window.location.reload();
			} else {
				this._router.navigateByUrl("/tempAuth.do/basicmode/condition/concernView", { skipLocationChange: true });
			}
		}
	}

	getWorkProgress() {
		const sessionId  = sessionStorage.getItem('sessionId');

		let workIndex = '';

		let job =
			this._stomp.subscribe(`/user/${sessionId}/work/message`)
				.map((message: Message) => {
					return message.body;
				}).subscribe((msg_body) => {
					let msg = JSON.parse(msg_body);
					
					if (msg) {
						const serverMessage = msg.SERVER_MESSAGE;
						this.socketData.next(msg_body);

						if (serverMessage === 'ACTIVE') {
							if (msg.WORK_LIST.length) {
								workIndex = msg.WORK_LIST[0].workIndex;
							}
						} else if (msg.SERVER_MESSAGE === 'DISCONNECT' 
							// || (msg.WORKINDEX_HISTORY && msg.WORKINDEX_HISTORY.length)
							|| (workIndex !== '' && msg.SERVER_MESSAGE === 'ALIVE' && Object.keys(msg.WORK_HISTORY).indexOf(workIndex))) {
								setTimeout(() => {
									job.unsubscribe();
								}, 1000);
						}
					}
				});
	}
}
