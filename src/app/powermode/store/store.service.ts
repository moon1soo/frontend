import { Injectable, ChangeDetectorRef  } from '@angular/core';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import notify from 'devextreme/ui/notify';
import { TranslateService } from '@ngx-translate/core';

import * as Model from './store.model';
import * as DigModel from '../model/diagram.model';

import { ItemListState } from '../../item-list.state';

import { HandleError } from '../../modal/handle-error.component';
import { SelectData } from '../model/diagram.model';
import { AppService } from '../../app.service';
import { AppState } from '../../app.state';

declare const $: any;
import * as _ from 'lodash';

@Injectable()
export class PowermodeStoreService {
	localstore: any = {};
	condition: string[] = [];
    select: string[] = [];
    stfNo: string;
    openStorage: any;

    private storeVo = new Subject<Model.StoreVo>();
    private updateStoreVo = new Subject<any>();
    private newStore = new Subject<any>();

    storeVo$ = this.storeVo.asObservable();
    updateStoreVo$ = this.updateStoreVo.asObservable();
    newStore$ = this.newStore.asObservable();

    constructor(
        private _router: Router,
        private _appService: AppService,
        private _ref: ChangeDetectorRef,
        private _translate: TranslateService
	) {
		const item = JSON.parse(sessionStorage.getItem('powermodeStore'));

		// console.log('파워모드저장 스토어',item);
        // let item;
        if(this._appService.staffInfo) {
            this.stfNo = this._appService.staffInfo.number;
        } else {
            this.stfNo = sessionStorage.getItem('stfNo');
		}

        const setBasic: any = {
            age1: null,
            age2: null,
            ageTpCd: 'Y',
            condition: null,
            gender: 'A',
            hspTpCd: null,
            irbNo: '',
			irbMethod: '4',
            lclTpCd: 'L1',
            rschRprvId: 'CRI',
            pactTpCd: 'A',
            period1: null,
            period2: null,
            ptTpNm: null,
            ptBrdyDtEd: null,
            ptBrdyDtSt: null,
            queryFlowNm : "New Scenario",
            select: null,
            shareStfNo: null,
            shareYn: null,
            stfNo: this.stfNo
		};

		if(this._appService.convertStore && !item) {
			this.localstore = this._appService.convertStore;
			sessionStorage.setItem('powermodeStore', JSON.stringify(this._appService.convertStore));
            this._appService.setConvertStore = null;
		} else {
			if(item) {
				if(item.groupInfoListStore && item.groupInfoListStore.length === 1 && !item.groupInfoListStore[0].item.length) {
					this.localstore = {
						'basicStore': setBasic,
						'groupInfoListStore': []
					}
				} else {
                    this.localstore = item;
					
				}
			} else {
				this.localstore = {
					'basicStore': setBasic,
					'groupInfoListStore': []
				}
			}
        }
    }
    get store(): any {
        return this.localstore;
    }
    get getStorage(): any {
        return this.openStorage;
    }
    set setStore(store: any) {
        this.localstore = store;
        // this.shareStore();
	}

    // 스토어 저장
	shareStore() {
        this.storeVo.next(this.localstore);
        sessionStorage.setItem('powermodeStore', JSON.stringify(this.localstore));
    }
    saveStore(store) {
        this.localstore = store;
        this.shareStore();
    }
    // 스토어 갱신
	restoreStore(store: any) {  
        this.localstore = store;
        this.localstore.basicStore['stfNo'] = sessionStorage.getItem('stfNo');
        this.shareStore();	
        // this.newStore.next(store);
    }
    // 스토어 불러오기
    openStore(store: any) {
        this.openStorage = store;
    }
    // Validate Store 
    validateStore() {
        const select = this.localstore.basicStore.select;
        const group = this.localstore.groupInfoListStore;
        let validate: boolean = true;
        if(
            typeof select !== "undefined" &&   
            typeof select !== "object" && 
            (select.split(',').length !== this.localstore.groupInfoListStore.length)) {
            notify(this._translate.instant('renewal2017.p.condition-err'), "error", 2000);
            return validate = false;
        }
        for(let member of group) {
            let empty = member.filter.filter(obj => {
                return Object.getOwnPropertyNames(obj).length < 4 && member.item[0] !== 'ptNo';
            });
            if(empty.length) {
                notify(this._translate.instant('renewal2017.p.empty-err'), "error", 2000);
                return validate = false;
            }
        }  
        return validate;      
    }
        
    // basicStore 수정
	shareBasicDefault(data: any) {
        setTimeout(() => {
            let prevStore = Object.assign({}, this.localstore['basicStore']);
            let newData;

            for(let key of Object.getOwnPropertyNames(data)) {
                if(!data[key] && key !== 'hspTpCd') {
                    delete data[key];
                }
            }
            if(prevStore) {
                const assign = Object.assign(prevStore, data);
                this.localstore['basicStore'] = assign;
            } else {
                this.localstore['basicStore'] = data;
            }
            this.shareStore();
        }, 10);        
    }
    // 레이블 수정
    changeLabel({idx, label}: {idx: string; label: string}): void {
        const store = Object.assign({}, this.localstore);
        for(let group of this.localstore.groupInfoListStore) {
            if(group.groupId === idx) {
                group.groupNm = label;
            }
        }
        this.localstore = store;
        this.shareStore();
    }
    // 그룹 추가
	addGroupStore(store: any, seq: string) {
		// console.log('그룹추가', store);

		if(seq === 'new') {
			this.localstore['groupInfoListStore'].push(store);
			this.checkAlone();
		    this.shareStore();
		}
    }
    // 그룹삭제
    removeGroupStore(idx: any) {
		// console.log('그룹삭제',idx);
		const newStore = this.localstore.groupInfoListStore.filter((val) => {
            return val.groupId !== idx;
        });

        const select = this.localstore.basicStore.select.split(',');
        const condition = this.localstore.basicStore.condition.split(',');
        
        this.localstore['groupInfoListStore'] = newStore;

		if(~select.indexOf(idx)) {
			let index = select.indexOf(idx);

			select.splice(index, 1);
			condition.splice(index, 1);
	
			this.localstore.basicStore.select = select.join(',');
			this.localstore.basicStore.condition = condition.join(',');
		}		

        this.checkAlone();
		this.shareStore();
    }
    checkAlone() {
        if(this.localstore['groupInfoListStore'].length === 1) {
            this.localstore.basicStore.select = this.localstore['groupInfoListStore'][0].groupId;
            this.localstore.basicStore.condition = 'and';
        }
    }
    // 스토어 업데이트
    updateStore({idx, children, size, position, update}: DigModel.storeParam) {
        // console.log('스토어 업데이트',idx, children, update);
        for(let member of this.localstore['groupInfoListStore']) {
			if(member.groupId === idx && update !== 'update') {
                let category = [];
                let item = [];
                let filter = [];
                Array.from(children).forEach((child, index) => {
                    category.push(child['group']);
                    item.push(child['code']);
                    if(child['data'].groupId) {
                        console.log(child);
                        child['data'].groupId = idx;
                        filter.push(child['data']);
                    } else {
                        filter.push({ 
                            groupId: idx,
                            category: child['group'],
                            item: child['code'] 
                        });
                    }
                    // child['data'] ? filter.push(child['data']) : { groupId: idx};
				});
				member.category = category;
				member.item = item;
                member.filter = filter;
				member.size = JSON.stringify(size);
				member.position = JSON.stringify(position);
			}
        }
        console.log(this.localstore['groupInfoListStore']);
		this.shareStore();
    }
    setUpdateStore({
        index,
        id,
        filterType,
        ctgCd,
        itemCd,
        data
    }): void {
        this.updateStoreVo.next({
            index,
            id,
            filterType,
            ctgCd,
            itemCd,
            data
        })
    }
    // 스토어 저장
    shareLTStore(param: [DigModel.SelectData, any]) {
        console.log('shareLTStore', param);
        let [cell, store] = param;
        const target = this.localstore['groupInfoListStore'];
        const final = this.localstore['finalResultStore'];
        if(!cell.isFilter) {
            for(let tar of this.localstore['groupInfoListStore']) {
                if(tar.groupId === cell.id) {
                    if(tar.item[cell.index] === cell.itemCd) {
                        tar.filter[cell.index] = store;
                    }
                }
            }
            const update = {
                index: cell.index,
                id: cell.id.split('_')[1],
                filterType: cell.filterType,
                ctgCd: cell.ctgCd,
                itemCd: cell.itemCd,
                data: store
            };
            this.updateStoreVo.next(update);
        } else {
            if(!final) {
                this.localstore['finalResultStore'] = {
					category: [cell.ctgCd],
					item: [cell.itemCd],
					filter: [store.filter]
				};
            } else {
                if(!final.filter.length) {
                    final.filter.push(store.filter);
                } else {      
					let duplicate;
                    for(let i=0; i<final.filter.length; i++) {
                        const arr = store.filter.split('|');
                        const ex = final.filter[i].split('|');
                        if(arr[0] === ex[0] && arr[1] === ex[1]) {
                            if(arr[2].length) {
                                final.filter.splice(i, 1, store.filter);
                            } else {
                                final.filter.splice(i, 1);
                            };
                            duplicate= true;
                            break;
                        }
                    }
                    if(!duplicate) {
                        final.filter.push(store.filter);
                    }
                }
            }
        }
        this.shareStore();
	}

    // 파이널 스토어 저장
    shareFinalStorefilter(param: {category: string[]; item: string[]}) {
        let prevStore = this.localstore['finalResultStore'];
        let store = Object.assign({}, prevStore, param);

		this.localstore['finalResultStore'] = store;
		if(!this.localstore['finalResultStore'].filter) {
			this.localstore['finalResultStore'].filter = [];
		}
        this.shareStore();
    }
    // 조회기간 설정
    setSearchPeriod({fromDt, toDt}: {fromDt: string, toDt: string}) {
        this.localstore.finalResultStore.stdDtSt = fromDt;
        this.localstore.finalResultStore.stdDtEd = toDt;

        this.shareStore();
    }

    // Condition Setting
    setCondition(param: [string[], string[]]): void {
        let [select, condition] = param;

        this.localstore.basicStore.select = select.join(',');
        this.localstore.basicStore.condition = condition.join(',');

        this.shareStore();
    }
    // 스토어 전체 리셋
	resetStore(seq: string): void {
		const setBasic: any = {
			age1: null,
            age2: null,
            ageTpCd: 'Y',
            condition: null,
            gender: 'A',
            hspTpCd: null,
            irbNo: '',
			irbMethod: '4',
            lclTpCd: 'L1',
            rschRprvId: 'CRI',
            pactTpCd: 'A',
            period1: null,
            period2: null,
            ptTpNm: null,
            ptBrdyDtEd: null,
            ptBrdyDtSt: null,
            queryFlowNm : "New Scenario",
            select: null,
            shareStfNo: null,
            shareYn: null,
            stfNo: this.stfNo
		};
		this.localstore = {
            'basicStore': setBasic,
            'groupInfoListStore': []
		}
		this.shareStore();
		if(seq === 'reset') {            
            window.location.reload();
        } else {
            // let url = this._router.url.split('/');
            this._router.navigateByUrl("/tempAuth.do/powermode/paper", { skipLocationChange: true });	
        }        
	}
}