import { Component, OnInit, OnChanges, Input, EventEmitter, ViewChild } from '@angular/core';

import { AppState } from '../../app.state';
import { ResultService } from './result.service';
import { DiagramService } from '../diagram.service';

import * as StoreModel from '../store/store.model';
import { PowermodeStoreService } from '../store/store.service';

interface ColumnModel {
    dataField: string; 
    caption: string; 
    category: string; 
    [props: string]: any;
}
interface ItemModel {
	dataSource: any; 
	categoryGroup: any[]; 
	seq: string
}

@Component({
 	selector: 'add-item',
    templateUrl: './add-item.component.html'
})
export class AddItemComponent implements OnChanges {
    @Input('itemList') itemList: {dataSource: any; categoryGroup: any[]};

    storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
    };
    config: any;

    // itemList: ItemModel;

    finalStore: StoreModel.StoreFinalResult = {
		category: [],
		item: [],
		filter: [],
		stdDtSt: null,
		stdDtEd: null
    };
    columns: ColumnModel[] = [];
    columCategory: string[] = [];
    categoryGroup: any[];
    
	constructor(
        private _app: AppState,
        private _service: ResultService,
        private _diagramService: DiagramService,
        private _store: PowermodeStoreService
    ) {

    }

    ngOnInit() {
        const store = this._store.store;

        sessionStorage.setItem('prevLink', 'final');

        // 선택한 칼럼정보 구독하기
        this._service.columnInfo$.subscribe(res => {
            this.columns = res;
            
            let columCategory = [];
            for(let key of res) {
                columCategory.push(key.category);
            }
            this.categoryGroup = this.itemList.categoryGroup.filter(obj => {
                return ~columCategory.indexOf(obj.ctgCd);
            });
            this.saveFilterStore();
        });

        const stdDtSt = store.finalResultStore.stdDtSt;
		const stdDtEd = store.finalResultStore.stdDtEd;

        console.log('[stdDtSt]', stdDtSt);
        console.log('[stdDtEd]', stdDtEd);

        if (stdDtSt === null || stdDtEd === null
            || stdDtSt === '' || stdDtEd === ''
            || typeof stdDtSt === 'undefined' || typeof stdDtEd === 'undefined') {
			this.checkDate(store.groupInfoListStore);
		} else {
            this.selectDate({ fromDt: stdDtSt, toDt: stdDtEd });
        }
    }
    ngOnChanges() {
       
    }
    removeColumn(event: MouseEvent, column: ColumnModel): void {
        this._service.setRemoveColumn(column);
    }
    // 필터 열기
	openFilter(event: MouseEvent, data: any): void {
		const selectionDataCell = {
			ctgCd: data.category,
			itemNm: data.caption,
			itemCd: data.dataField,
			filterType: data.filterType,
			isFilter: true
		}
		this._diagramService.setselectionData(selectionDataCell);
    }
    // 필터 스토어 저장
	saveFilterStore(): void {
		let store = {
			category: [],
			item: []
		}
		for(let col of this.columns) {
            store.category.push(col.category);
            if(col.category === 'ptInfo' && ~col.dataField.indexOf('Msk')) {
                store.item.push(col.dataField.replace('Msk', ''));
            } else {
                store.item.push(col.dataField);
            }
        }
		this._store.shareFinalStorefilter(store);
	}
    // 날짜 로드
	storageDateLoad(storage: any): void {
		this.finalStore.stdDtSt = storage.stdDtSt;
		this.finalStore.stdDtEd = storage.stdDtEd;
		this.storageDate = {fromDt: storage.stdDtSt, toDt: storage.stdDtEd};
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.finalStore.stdDtSt = event.fromDt;
		this.finalStore.stdDtEd = event.toDt;

        this.storageDate = {fromDt: event.fromDt, toDt: event.toDt};
        this._store.setSearchPeriod({fromDt: event.fromDt, toDt: event.toDt});
    }
    
	// 스토어에 있는 날짜 정보 취합하기
	checkDate(store: any) {
		const storeGroup = Object.keys(store);

		const fromGroup = [];
		const toGroup = [];

		// 스토어 개별 탐색
		storeGroup.forEach((item) => {
			const itemGroup = Object.keys(store[item]);
			// 개별 스토어의 내부 탐색
			itemGroup.forEach((part) => {
                if (part === 'filter') {
                    const filterGroup = Object.keys(store[item][part]);

                    // 날짜 값 탐색
                    filterGroup.forEach((filter) => {
                        // 날짜 From 값이 있으면 배열에 추가
                        if (store[item][part][filter]['fromDt'] && store[item][part][filter]['fromDt'].length === 10) {
                            fromGroup.push(store[item][part][filter]['fromDt']);
                        }
                        // 날짜 To 값이 있으면 배열에 추가
                        if (store[item][part][filter]['toDt'] && store[item][part][filter]['toDt'].length === 10) {
                            toGroup.push(store[item][part][filter]['toDt']);
                        }
                    });
                }
			});
		});

		let from = '';
		let to = '';

		// From 값 배열 정렬 후 가장 빠른 날짜 반환
		if (fromGroup.length > 0) {
			fromGroup.sort();
			
			from = fromGroup[0];
		}

		// To 값 배열 정렬 후 가장 늦은 날짜 반환
		if (toGroup.length > 0) {
            console.log('toGroup', toGroup);
			toGroup.sort();

			to = toGroup[toGroup.length -1];
        }

		// 날짜 설정
		if (from && to) {
			this.selectDate({fromDt: from, toDt: to});
		}
	}
}
