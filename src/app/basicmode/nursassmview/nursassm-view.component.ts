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
import { NursAssmService } from './nursassm.service';
import { NursDeptService } from '../nursdiagview/nurs-dept/nurs-dept.service';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';
import { Route } from '@angular/router/src/config';

import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';

interface nursAssmModel {
	wrtDtSt: string;
	wrtDtEd: string;
	dept1: string;
	ifflCtg: string;
	ifflFrom: string;
	ifflTo: string;
	bdsrCtg: string;
	bdsrFrom: string;
	bdsrTo: string;
	cmmOldCtg: string;
	cmmOldFrom: string;
	cmmOldTo: string;
	apcOldCtg: string;
	apcOldFrom: string;
	apcOldTo: string;
	mtCtg: string;
	mtFrom: string;
	mtTo: string;
	cmmCtg: string;
	cmmFrom: string;
	cmmTo: string;
	apcCtg: string;
	apcFrom: string;
	apcTo: string;
	chldCtg: string;
	chldFrom: string;
	chldTo: string;
}

@Component({
	selector: 'nursassm-view',
	templateUrl: './nursassm-view.component.html',
	providers: [
		NursAssmService,
		NursDeptService
	]
})
export class NursAssmViewComponent implements OnInit {

	nursAssmViewForm: FormGroup;
	nursAssmData: nursAssmModel = {
		wrtDtSt: null,
		wrtDtEd: null,
		dept1: null,
		ifflCtg: null,
		ifflFrom: null,
		ifflTo: null,
		bdsrCtg: null,
		bdsrFrom: null,
		bdsrTo: null,
		cmmOldCtg: null,
		cmmOldFrom: null,
		cmmOldTo: null,
		apcOldCtg: null,
		apcOldFrom: null,
		apcOldTo: null,
		mtCtg: null,
		mtFrom: null,
		mtTo: null,
		cmmCtg: null,
		cmmFrom: null,
		cmmTo: null,
		apcCtg: null,
		apcFrom: null,
		apcTo: null,
		chldCtg: null,
		chldFrom: null,
		chldTo: null,
	};

	refreshMode: boolean = false;
	
	seqCode: string = this._localService.secCode;

	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};
	  
	ptCtg: string;

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

	ifflOption: any[] = [
		{ id: 'N', name: this._app.trans.noRisk },
		{ id: 'L', name: this._app.trans.lowRisk },
		{ id: 'H', name: this._app.trans.highRisk }
	];

	bdsrOption: any[] = [
		{ id: 'M', name: this._app.trans.minusRisk },
		{ id: 'P', name: this._app.trans.plusRisk }
	];

	pt4Option: any[] = [
		{ id: '1', name: this._app.trans.group1 },
		{ id: '2', name: this._app.trans.group2 },
		{ id: '3', name: this._app.trans.group3 },
		{ id: '4', name: this._app.trans.group4 },
	];

	pt5Option: any[] = [
		{ id: '1', name: this._app.trans.group1 },
		{ id: '2', name: this._app.trans.group2 },
		{ id: '3', name: this._app.trans.group3 },
		{ id: '4', name: this._app.trans.group4 },
		{ id: '5', name: this._app.trans.group5 },
	];

	pt6Option: any[] = [
		{ id: '1', name: this._app.trans.group1 },
		{ id: '2', name: this._app.trans.group2 },
		{ id: '3', name: this._app.trans.group3 },
		{ id: '4', name: this._app.trans.group4 },
		{ id: '5', name: this._app.trans.group5 },
		{ id: '6', name: this._app.trans.group6 }
	];
	

	ctgSettings: IMultiSelectSettings = {
        buttonClasses: 'btn btn-light',
		selectAddedValues: true,
		dynamicTitleMaxItems: 1,
		maxHeight: '160px',
		displayAllSelectedText: true
	};

	ctgTexts: IMultiSelectTexts  = {
        checkAll: this._app.trans.checkAll, //전체
        uncheckAll: this._app.trans.uncheckAll, //선택해제
        checked: 'item selected',
        checkedPlural: this._app.trans.checkedPlural, //개 선택
        searchPlaceholder: 'Find',
        searchEmptyResult: this._app.trans.searchEmptyResult, 
        searchNoRenderText: this._app.trans.searchNoRenderText,
        defaultTitle: this._app.trans.category,
        allSelected: this._app.trans.allSelected, //전체 선택',
	};

	constructor(
		private _app: AppState,
		private _service: DashboardService,
		private _store: StoreService,
		private _state: DashboardState,
		private _fb: FormBuilder,
		private _router: Router,
		private _localService: NursAssmService,
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
		this._translate.get('renewal2017.p.message-nursAssm').subscribe(res => {
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
				this.nursAssmData = {
					wrtDtSt: null,
					wrtDtEd: null,
					dept1: null,
					ifflCtg: null,
					ifflFrom: null,
					ifflTo: null,
					bdsrCtg: null,
					bdsrFrom: null,
					bdsrTo: null,
					cmmOldCtg: null,
					cmmOldFrom: null,
					cmmOldTo: null,
					apcOldCtg: null,
					apcOldFrom: null,
					apcOldTo: null,
					mtCtg: null,
					mtFrom: null,
					mtTo: null,
					cmmCtg: null,
					cmmFrom: null,
					cmmTo: null,
					apcCtg: null,
					apcFrom: null,
					apcTo: null,
					chldCtg: null,
					chldFrom: null,
					chldTo: null,
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
		this.nursAssmViewForm = this._fb.group({
			'wrtDtSt': [this.nursAssmData.wrtDtSt, Validators.compose([Validators.required])],
			'wrtDtEd': [this.nursAssmData.wrtDtEd, Validators.compose([Validators.required])],
			'dept1': [this.nursAssmData.dept1],
			'ifflCtg': [this.nursAssmData.ifflCtg],
			'ifflFrom': [this.nursAssmData.ifflFrom],
			'ifflTo': [this.nursAssmData.ifflTo],
			'bdsrCtg': [this.nursAssmData.bdsrCtg],
			'bdsrFrom': [this.nursAssmData.bdsrFrom],
			'bdsrTo': [this.nursAssmData.bdsrTo],
			'cmmOldCtg': [this.nursAssmData.cmmOldCtg],
			'cmmOldFrom': [this.nursAssmData.cmmOldFrom],
			'cmmOldTo': [this.nursAssmData.cmmOldTo],
			'apcOldCtg': [this.nursAssmData.apcOldCtg],
			'apcOldFrom': [this.nursAssmData.apcOldFrom],
			'apcOldTo': [this.nursAssmData.apcOldTo],
			'mtCtg': [this.nursAssmData.mtCtg],
			'mtFrom': [this.nursAssmData.mtFrom],
			'mtTo': [this.nursAssmData.mtTo],
			'cmmCtg': [this.nursAssmData.cmmCtg],
			'cmmFrom': [this.nursAssmData.cmmFrom],
			'cmmTo': [this.nursAssmData.cmmTo],
			'apcCtg': [this.nursAssmData.apcCtg],
			'apcFrom': [this.nursAssmData.apcFrom],
			'apcTo': [this.nursAssmData.apcTo],
			'chldCtg': [this.nursAssmData.chldCtg],
			'chldFrom': [this.nursAssmData.chldFrom],
			'chldTo': [this.nursAssmData.chldTo],
		});

		setTimeout(() => {
			this.watchForm();
        }, 10);
	}

	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.nursAssmData.wrtDtSt = storage.wrtDtSt;
		this.nursAssmData.wrtDtEd = storage.wrtDtEd;
		this.nursAssmData.dept1 = storage.dept1;
		this.nursAssmData.ifflCtg = storage.ifflCtg;
		this.nursAssmData.ifflFrom = storage.ifflFrom;
		this.nursAssmData.ifflTo = storage.ifflTo;
		this.nursAssmData.bdsrCtg = storage.bdsrCtg;
		this.nursAssmData.bdsrFrom = storage.bdsrFrom;
		this.nursAssmData.bdsrTo = storage.bdsrTo;
		this.nursAssmData.cmmOldCtg = storage.cmmOldCtg;
		this.nursAssmData.cmmOldFrom = storage.cmmOldFrom;
		this.nursAssmData.cmmOldTo = storage.cmmOldTo;
		this.nursAssmData.apcOldCtg = storage.apcOldCtg;
		this.nursAssmData.apcOldFrom = storage.apcOldFrom;
		this.nursAssmData.apcOldTo = storage.apcOldTo;
		this.nursAssmData.mtCtg = storage.mtCtg;
		this.nursAssmData.mtFrom = storage.mtFrom;
		this.nursAssmData.mtTo = storage.mtTo;
		this.nursAssmData.cmmCtg = storage.cmmCtg;
		this.nursAssmData.cmmFrom = storage.cmmFrom;
		this.nursAssmData.cmmTo = storage.cmmTo;
		this.nursAssmData.apcCtg = storage.apcCtg;
		this.nursAssmData.apcFrom = storage.apcFrom;
		this.nursAssmData.apcTo = storage.apcTo;
		this.nursAssmData.chldCtg = storage.chldCtg;
		this.nursAssmData.chldFrom = storage.chldFrom;
		this.nursAssmData.chldTo = storage.chldTo;
		this.storageDate = {fromDt: storage.wrtDtSt, toDt: storage.wrtDtEd};
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		console.log(event);
		this.nursAssmData.wrtDtSt = event.fromDt;
		this.nursAssmData.wrtDtEd = event.toDt;

		this.storageDate = {fromDt: event.fromDt, toDt: event.toDt};
		this._service.addDate(this._localService.secCode, {wrtDtSt: event.fromDt, wrtDtEd: event.toDt});
		// _.forEach(this.diagnosisData, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);
		// });
	}

    // 폼 변경 여부 관찰.
	watchForm(): void {
		this.nursAssmViewForm.valueChanges
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

	// 선택 변경
	onChange(event) {
		
	}

	deleteScore(ctg: any) {
		const store = this._store.store.nursAssessmentStore;
		
		this.nursAssmViewForm.get(ctg + 'From').reset();
		this.nursAssmViewForm.get(ctg + 'To').reset();

		store[ctg + 'From'] = null;
		store[ctg + 'To'] = null;
	}

	setScore(ctg: any, from: any, to: any) {
		this.nursAssmData[ctg + 'From'] = from;
		this.nursAssmData[ctg + 'To'] = to;
	}
}
