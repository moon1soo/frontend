import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { DashboardService } from '../dashboard.service';
import { DashboardState } from '../dashboard.state';
import { StoreService } from '../store/store.service';
import { NursDiagService } from './nurs-diag/nurs-diag.service';
import { NursCircumService } from './nurs-circum/nurs-circum.service';
import { NursPlanService } from './nurs-plan/nurs-plan.service';
import { NursDeptService } from './nurs-dept/nurs-dept.service';

import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';
import { Route } from '@angular/router/src/config';

import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';

interface nursDiagModel {
	wrtDtSt: string;
	wrtDtEd: string;
	fmtYn1: string;
}

@Component({
	selector: 'nursdiag-view',
	templateUrl: './nursdiag-view.component.html',
	providers: [
		NursDiagService,
		NursCircumService,
		NursPlanService,
		NursDeptService
	]
})
export class NursDiagViewComponent implements OnInit {

	nursDiagForm: FormGroup;
	nursDiagData: nursDiagModel = {
		wrtDtSt: null,
		wrtDtEd: null,
		fmtYn1: null
	};

	refreshMode: boolean = false;
	
	seqCode: string = this._localService.secCode;

	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	initTab = 'diagnosis';
	activeId = '';

	constructor(
		private _app: AppState,
		private _service: DashboardService,
		private _store: StoreService,
		private _state: DashboardState,
		private _fb: FormBuilder,
		private _router: Router,
		private _localService: NursPlanService,
		private _deptService: NursDeptService,
		private _translate: TranslateService,
		private _modalService: NgbModal,
		private _appService: AppService
	) {
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

		const store = this._store.store;
		const storage = store[this._state.code[this.seqCode].storage];

		if(storage) {
			this.storageDateLoad(storage);
		}

		this._store.deleteVo$.subscribe(res => {
			if(res === this._state.code[this._localService.secCode].storage) {
				this.refreshMode = true;
				this.nursDiagData = {
					wrtDtSt: null,
					wrtDtEd: null,
					fmtYn1: null
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
		this.nursDiagForm = this._fb.group({
			'wrtDtSt': [this.nursDiagData.wrtDtSt, Validators.compose([Validators.required])],
			'wrtDtEd': [this.nursDiagData.wrtDtEd, Validators.compose([Validators.required])],
			'fmtYn1': [this.nursDiagData.fmtYn1]
		});

		setTimeout(() => {
			this.watchForm();
        }, 10);
	}

	// 간호계획 탭일 경우 수행건만 체크박스 활성화
	beforeChange(event: NgbTabChangeEvent) {
		this.activeId = event.nextId;
	}

	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.nursDiagData.wrtDtSt = storage.wrtDtSt;
		this.nursDiagData.wrtDtEd = storage.wrtDtEd;
		this.nursDiagData.fmtYn1 = storage.fmtYn1;
		this.storageDate = {fromDt: storage.wrtDtSt, toDt: storage.wrtDtEd};
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.nursDiagData.wrtDtSt = event.fromDt;
		this.nursDiagData.wrtDtEd = event.toDt;

		this.storageDate = {fromDt: this.nursDiagData.wrtDtSt, toDt: this.nursDiagData.wrtDtEd};
		this._service.addDate(this._localService.secCode, {wrtDtSt: event.fromDt, wrtDtEd: event.toDt});
		// _.forEach(this.diagnosisData, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);
		// });
	}

    // 폼 변경 여부 관찰.
	watchForm(): void {
		this.nursDiagForm.valueChanges
			.debounceTime(100)
			.distinctUntilChanged()
			.subscribe(res => {
				if(!this.refreshMode) {
					for(let key of Object.keys(res)) {
						let data;
						if (key === 'fmtYn1') {
							res[key] ? data = 'Y' : data = 'N';
							if (data === 'Y') {
								this._service.addDataString(this._localService.secCode, key, data);
							}
						}
					}
				}
		});
	}	
}
