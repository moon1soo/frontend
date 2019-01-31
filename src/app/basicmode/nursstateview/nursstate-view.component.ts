import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { IMultiSelectOption, IMultiSelectTexts,IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { DashboardService } from '../dashboard.service';
import { DashboardState } from '../dashboard.state';
import { StoreService } from '../store/store.service';
import { NursStateService } from './nurs-state/nurs-state.service';
import { NursStateEavService } from './nurs-state-eav/nurs-state-eav.service';
import { NursDeptService } from '../nursdiagview/nurs-dept/nurs-dept.service';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';
import { Route } from '@angular/router/src/config';

import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';

interface nursStateModel {
	wrtDtSt: string;
	wrtDtEd: string;
	dept1: string;
}

@Component({
	selector: 'nursstate-view',
	templateUrl: './nursstate-view.component.html',
	providers: [
		NursStateService,
		NursStateEavService,
		NursDeptService
	]
})
export class NursStateViewComponent implements OnInit {

	nursStateForm: FormGroup;
	nursStateData: nursStateModel = {
		wrtDtSt: null,
		wrtDtEd: null,
		dept1: null
	};

	refreshMode: boolean = false;
	
	seqCode: string = this._localService.secCode;

	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	  };
	  
	isStateExists: boolean = true;

    mySettings: IMultiSelectSettings = {
        enableSearch: true,
        buttonClasses: 'btn btn-light',
		selectAddedValues: true,
		dynamicTitleMaxItems: 1,
		maxHeight: '450px',
		displayAllSelectedText: true
	};

	myTexts: IMultiSelectTexts  = {
        checkAll: this._app.trans.checkAll, //전체
        uncheckAll: this._app.trans.uncheckAll, //선택해제
        checked: 'item selected',
        checkedPlural: this._app.trans.checkedPlural, //개 선택
        searchPlaceholder: 'Find',
        searchEmptyResult: this._app.trans.searchEmptyResult, 
        searchNoRenderText: this._app.trans.searchNoRenderText,
        defaultTitle: this._app.trans.checkAll, //전체
        allSelected: this._app.trans.allSelected, //전체 선택',
	};

	myOptions: any[] = [];
  
	constructor(
		private _app: AppState,
		private _service: DashboardService,
		private _store: StoreService,
		private _state: DashboardState,
		private _fb: FormBuilder,
		private _router: Router,
		private _localService: NursStateService,
		private _translate: TranslateService,
		private _modalService: NgbModal,
		private _appService: AppService
	) {
		// 간호기록부서 불러오기
		this._localService.getDeptList().subscribe(res => {
			for (let data of res.allList) {
				this.myOptions.push({
					id: data.deptCd,
					name: data.deptNm
				});
			}
		});		
	}
	ngOnInit() {
		sessionStorage.setItem('currentUrl', this._router.url);

		// 언어 변경
		this._translate.use(this._appService.langInfo);
		this._appService.language$.subscribe(res => {
			this._translate.use(res);
			setTimeout(() => {
				window.location.reload();
			}, 100);
		});

		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-nursState').subscribe(res => {
			this._service.setMessage(res);
		});

		const store = this._store.store;
		const storage = store[this._state.code[this.seqCode].storage];

		if(storage) {
			this.storageDateLoad(storage);
		}

		this._store.deleteVo$.subscribe(res => {
			if(res === this._state.code[this._localService.secCode].storage) {
				this.refreshMode = true;
				this.nursStateData = {
					wrtDtSt: null,
					wrtDtEd: null,
					dept1: null
				}
				this.storageDate = {
					fromDt: null,
					toDt: null
				}
				this._localService.list().subscribe(res => {
					setTimeout(() => { this.refreshMode = false; }, 200);
				});
			}
		});

		this._store.storeVo$.subscribe(res => {
			if(res.nursStateStore) {
				this.isStateExists = Boolean((res.nursStateStore.select1 && res.nursStateStore.select1.length === 0) 
					|| (res.nursStateStore.select1 && res.nursStateStore.select1[0] === ''));
			}
		});

		this.nursStateForm = this._fb.group({
			'wrtDtSt': [this.nursStateData.wrtDtSt, Validators.compose([Validators.required])],
			'wrtDtEd': [this.nursStateData.wrtDtEd, Validators.compose([Validators.required])],
			'dept1': [this.nursStateData.dept1]
		});

		setTimeout(() => {
			this.watchForm();
    }, 10);
	}

	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.nursStateData.wrtDtSt = storage.wrtDtSt;
		this.nursStateData.wrtDtEd = storage.wrtDtEd;
		this.nursStateData.dept1 = storage.dept1;
		this.storageDate = {fromDt: storage.wrtDtSt, toDt: storage.wrtDtEd};
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		console.log(event);
		this.nursStateData.wrtDtSt = event.fromDt;
		this.nursStateData.wrtDtEd = event.toDt;

		this.storageDate = {fromDt: event.fromDt, toDt: event.toDt};
		this._service.addDate(this._localService.secCode, {wrtDtSt: event.fromDt, wrtDtEd: event.toDt});
		// _.forEach(this.diagnosisData, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);
		// });
	}

	// 선택 변경
    onChange(event) {
		// console.log(this.basic['pactTpCd']);
	}
	
    // 폼 변경 여부 관찰.
	watchForm(): void {
		this.nursStateForm.valueChanges
			.debounceTime(100)
			.distinctUntilChanged()
			.subscribe(res => {
				if(!this.refreshMode) {
					for(let key of Object.keys(res)) {
						let data;
						data = res[key];
						if (data) {
							this._service.addDataString(this._localService.secCode, key, data);
						}
					}
				}
		});
	}		
}
