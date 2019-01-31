import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';

import { HandleError } from '../../modal/handle-error.component';
import { StoreService } from '../store/store.service';
import { FinalResultService } from './final-result.service';
import { ResultService } from '../interimresult/interim-result.service';
import { FinalResultModal } from './final-result-modal.component';
import { DashboardState } from '../dashboard.state';
import { DashboardFunc } from '../dashboard.func';
import { DashboardService } from '../dashboard.service';
// import { TransposeModal } from './transpose-modal.component';
import { IrbApprovalModal } from '../interimresult/irb-approval-modal.component';

import { ItemListState } from '../../item-list.state';
import { AppService } from '../../app.service';

import * as Model from './final-result.model';
import * as StoreModel from '../store/store.model';

interface InpGroup {
	categoryCd: string;
	categoryNm: string;
	columnCd: string;
	columnNm: string;
	columnAliasCd: string;
	tableCd: string;
	seq: string;
	[props: string]: any;
}

@Component({
	selector: 'add-item-layout',
	templateUrl: './add-item.component.html',
	providers: [ FinalResultService, ResultService, ItemListState ]
})

export class AddItemComponent implements OnInit {
	isMenuCollapsed: boolean = true;
	isFilterCollapsed: boolean = true;
	closeResult: string;

	// initConstGroup: string[] = ['ptInfo', 'ptInfo','ptInfo','ptInfo'];
	// initConstItem: string[] = ['ptNo','ptNm','sexTpCd','ptBrdyDt'];

	seqCode: string;
    categoryGroup: string[] = [];
	dataSource: InpGroup[] = [];
	resultForm: FormGroup = new FormGroup({});
	// selectForm: string[] = [];
	// selectCategory: string[] = [];
	finalStore: StoreModel.StoreFinalResult = {
		category: [],
		item: [],
		filter: [],
		stdDtSt: null,
		stdDtEd: null
	};
	finalStoreVo: any;

	selectCtgCd: string;
	selectItemCd: string;

	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	irbForm = {
		stfNo: null,
		irbNo: null,
		irbMthd: null,
		itemList: null,
		ptListSql: null,
		irbCount: null,
		ptListCount: null,
	};

	tooltipVisible: boolean = false;

    constructor(
		private _router: Router,
		private _translate: TranslateService,
		private _modalService: NgbModal,
		private _dashboard: DashboardService,
        private _service: FinalResultService,
		private _store: StoreService,
		private _state: DashboardState,
		private _fb: FormBuilder,
		private _localState: ItemListState,
		private _func: DashboardFunc,
		private _appService: AppService
    ) {
		sessionStorage.setItem('currentUrl', this._router.url);

		this.seqCode = this._service.seqCode;
    }

    ngOnInit() {
		const path = sessionStorage.getItem('currentUrl');
		// 언어 변경
		this._translate.use(this._appService.langInfo);			
		this._appService.language$.subscribe(res => {
			this._translate.use(res); 
			setTimeout(() => {
				window.location.reload();
			}, 100);
		});

		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-final').subscribe(res => {
			this._dashboard.setMessage(res);
		});		

		this._func.getCurUrl('final');
		sessionStorage.setItem('prevLink', 'final');

		if(path && path !== '/tempAuth.do/basicmode/final/additem') {
			this._router.navigateByUrl(path, { skipLocationChange: true });
		} else {
			this._router.navigateByUrl("/tempAuth.do/basicmode/final/additem", { skipLocationChange: true });	
		}

		const store = this._store.store;
		const storage = store[this._state.code[this.seqCode].storage];

		// finalResultStore 초기화
		if(!storage) {
			this._store.shareFinalStore(this.finalStore, this._state.code[this._service.seqCode].storage);
			// this.checkDate(store);
		} else {
			this.storageDateLoad(storage);
		}

		const stdDtSt = store.finalResultStore.stdDtSt;
		const stdDtEd = store.finalResultStore.stdDtEd;

		if (stdDtSt === null || stdDtEd === null
            || stdDtSt === '' || stdDtEd === ''
            || typeof stdDtSt === 'undefined' || typeof stdDtEd === 'undefined') {
			this.checkDate(store);
		}

        // Add Item 리스트 가져오기
		this._service.list().subscribe(res => {
			const clone = res.slice(0);
			this.dataSource = clone;

			for(let cate of res) {
				if(cate.ctgCd && !~this.categoryGroup.indexOf(cate.ctgCd)) {
					this.categoryGroup.push(cate.ctgCd);
				}
			}
            this.makeInpGroup();
		});
		// 스토어 구독
		this._store.storeVo$.subscribe(res => {
			this.finalStoreVo = res.finalResultStore;
		});

		
	}

	// 스토어에 있는 날짜 정보 취합하기
	checkDate(store: any) {
		const storeGroup = Object.keys(store);

		const fromGroup = [];
		const toGroup = [];

		// 스토어 개별 탐색
		storeGroup.forEach((item, idx) => {
			const itemGroup = Object.keys(store[item]);

			// 개별 스토어의 내부 탐색
			itemGroup.forEach((part, idx) => {
				// 날짜 From 값 탐색
				if (part.indexOf('DtSt') > -1 || part.indexOf('period1') > -1) {
					// 날짜 From 값이 있으면 배열에 추가
					if (part !== 'ptBrdyDtSt' && part !==  'rangeDtSt') {
						if (store[item][part] && store[item][part] !== '' && store[item][part] !== []) {
							fromGroup.push(store[item][part]);
						}
					}
				}
				// 날짜 To 값 탐색
				if (part.indexOf('DtEd') > -1 || part.indexOf('period2') > -1) {
					// 날짜 To 값이 있으면 배열에 추가
					if (part !== 'ptBrdyDtEd' && part !==  'rangeDtEd') {
						if (store[item][part] && store[item][part] !== '' && store[item][part] !== []) {
							toGroup.push(store[item][part]);
						}
					}
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
			toGroup.sort();

			to = toGroup[toGroup.length -1];
		}


		console.log('[from & to]', fromGroup, toGroup);

		// 날짜 설정
		if (from && to) {
			this.selectDate({fromDt: from, toDt: to});
		}
	}
	    
	// 체크박스 목록 생성
    makeInpGroup(): void {
		const items = this._store.store.finalResultStore;

        for (let data of this.dataSource) {
			let control: FormControl = new FormControl('');
			
			this.resultForm.addControl(data.ctgCd + '-' + data.itemCd, control);
			data.isChecked = false;
			if(~this._localState.initConstItem.indexOf(data.itemCd)
				&& ~this._localState.initConstGroup.indexOf(data.ctgCd)) {
				data.isChecked = true;
				data.isDisabled = true;
				this.resultForm.controls[data.ctgCd + '-' + data.itemCd].disable();
			} else {
				if(items.item && ~items.item.indexOf(data.itemCd)
					&& items.category && ~items.category.indexOf(data.ctgCd)) {
					data.isChecked = true;
					data.isDisabled = false;
				} else {
					data.isChecked = false;
					data.isDisabled = false;
				}
			}
            
			data.isFilter = false;
            if(!~this.categoryGroup.indexOf(data.categoryCd)) {
                this.categoryGroup.push(data.categoryCd);
			}
		}
		return this.matchTable();
	}
	
	matchTable() {
		const store = Object.assign({}, this._store.store);
		const storeList = Object.keys(store);
		const itemList = this._localState.matchAddItem;
		
		const code = [], 
			group = [], 
			filter = [];
		Array.from(itemList).forEach((item, index) => {
			if(~storeList.indexOf(item.store)) {
				if(store[item.store][item.code1] && store[item.store][item.code1].length > 0) {					
					code.push(item.itemCd);
					group.push(item.category);
				}
			} 
			if(item.filter) {
				filter.push(item.category + ':' + item.itemCd);
			}
		});

		for(let data of this.dataSource) {
			let idx = code.indexOf(data.itemCd);

			if(~idx && data.ctgCd === group[idx]) {
				data.isChecked = true;
			}
			if(~filter.indexOf(data.ctgCd + ':' + data.itemCd)) {
				data.isFilter = true;
			}
		}
		return this.makeStore();
	}

	// 스토어 생성
	makeStore(): void {
		let selectForm = [];
		let selectCategory = [];
		for(let data of this.dataSource) {		
			if(data.isChecked) {
				selectForm.push(data.itemCd);
				selectCategory.push(data.ctgCd);
			}
		}
		this.finalStore = {
            category: selectCategory,
			item: selectForm,
			stdDtSt: this.finalStore.stdDtSt,
			stdDtEd: this.finalStore.stdDtEd,
			filter: this.finalStore.filter
		}
		return this._store.shareFinalStore(this.finalStore, this._state.code[this.seqCode].storage);
	}
	
	// 최종결과 테이블 보기
	viewResultTable(): void {
		this.makeStore();
		setTimeout(() => {
			this.openModal(this._store.store['finalResultStore']);
		}, 10);
	}
	// 결과테이블 모달 열기
	openModal(param: any): void {
		const modalRef = this._modalService.open(FinalResultModal, {
			size: 'lg',
			windowClass: 'large-modal'
		});
		modalRef.componentInstance.data = {data: param, itemList: this.dataSource};
		modalRef.result.then((result) => {
			this._service.cancelJob().subscribe(res => {
				console.log('Work Destroy');
			});
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
			this._service.cancelJob().subscribe(res => {
				console.log('Work Destroy');
			});
		});
	}
	checkDuplCate(key: string): string {
		for(let cate of this._state.processGroup) {
			const prop = Object.getOwnPropertyNames(cate);
			const arr = cate[prop[0]].split(',');
			if(~arr.indexOf(key)) {
				return prop[0];
			}
		}
	}
	// 필터 영역 열기
	toggleFilter(event: MouseEvent, data: any): void {
		this.isFilterCollapsed = false;
		this.selectCtgCd = data.ctgCd;
		this.selectItemCd = data.itemCd;	
	}	
	// 필터 창 닫기
	closeBotTab(event: MouseEvent) {
		this.isFilterCollapsed = true;
	}

	// openModal2(param: any): void {
	// 	this.makeStore();

	// 	const modalRef = this._modalService.open(TransposeModal, {
	// 		size: 'lg',
	// 		windowClass: 'large-modal'
	// 	});

	// 	modalRef.componentInstance.data = {data: param, itemList: this.dataSource};
	// 	modalRef.result.then((result) => {
			
	// 	}, (reason) => {
	// 		this.closeResult = `Dismissed ${reason}`;
	// 	});
	// }

	// IRB Approvals 열기
	irbApprovals() {
		const modalRef = this._modalService.open(IrbApprovalModal, {
			size: 'lg'
		});

		this._service.getSQLResult(this._state.sqlViewer['patient']).subscribe(res => {
			this.irbForm.ptListSql = res.PATIENT_InterimResult_SQL;
		});

		this._service.getCountResult(this._state.resultCount['patient']).subscribe(res => {
			this.irbForm.ptListCount = res.result_root.interimResultCount.patientsCount;
		});

		modalRef.result.then((result) => {
			if (result !== 'cancel') {
				this._store.setStore = result;
				this._store.shareStore();
				
				if (this._store.store.basicStore['irbMethod'] !== '4') {
					this._service.setOnMasking('UNCOVER');
				}
	
				this.irbForm.stfNo = this._store.store.basicStore.stfNo;
				this.irbForm.irbNo = this._store.store.basicStore.irbNo;
				this.irbForm.irbMthd = this._store.store.basicStore.irbMethod;
				this.irbForm.irbCount = this._store.store.basicStore.ptCnt;
				this.irbForm.itemList = this._store.store.basicStore.select;
	
				this._service.setIRBLog(this.irbForm).subscribe();
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}

	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.finalStore.stdDtSt = storage.stdDtSt;
		this.finalStore.stdDtEd = storage.stdDtEd;
		this.finalStore.filter = storage.filter;
		this.storageDate = {fromDt: storage.stdDtSt, toDt: storage.stdDtEd};
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		console.log(event);
		this.finalStore.stdDtSt = event.fromDt;
		this.finalStore.stdDtEd = event.toDt;

		this.storageDate = {fromDt: event.fromDt, toDt: event.toDt};
		// this._dashboard.addDate(this._localService.secCode, {wrtDtSt: event.fromDt, wrtDtEd: event.toDt});
	}

	toggleVisible(data) {
		if (data.itemCd === 'nrVocEntAtrItemNm') {
			this.tooltipVisible = !this.tooltipVisible;
		}
	}
}
