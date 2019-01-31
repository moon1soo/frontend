import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { FeeService } from './fee-search/fee.service';
import { DashboardService } from '../dashboard.service';
import { DashboardState } from '../dashboard.state';
import { StoreService } from '../store/store.service';
import { AppService } from '../../app.service';

import * as _ from 'lodash';

interface feeModel {
	feeDtSt: string;
	feeDtEd: string;
}

@Component({
 	selector: 'fee-view',
	templateUrl: './fee-view.component.html',
	providers: [ FeeService ]
})

export class FeeViewComponent implements OnInit {

	feeForm: FormGroup;
	feeData: feeModel = {
		feeDtSt: null,
		feeDtEd: null
	};
	seqCode: string = this._localService.secCode;
	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	refreshMode: boolean = false;

	constructor(
		private _app: AppState,
		private _router: Router,
		private _fb: FormBuilder,
		private _translate: TranslateService,
		private _service: DashboardService,
		private _localService: FeeService,
		private _store: StoreService,
		private _state: DashboardState,
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

		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-fee').subscribe(res => {
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
				this.feeData = {
					feeDtSt: null,
					feeDtEd: null
				};
				this.storageDate = {
					fromDt: null,
					toDt: null
				}
				this._localService.list().subscribe(res => {
					setTimeout(() => { this.refreshMode = false; }, 200);
				});
			}
		});
		this.feeForm = this._fb.group({
			'feeDtSt': [this.feeData.feeDtSt, Validators.compose([Validators.required])],
			'feeDtEd': [this.feeData.feeDtEd, Validators.compose([Validators.required])]
		});
	}	
	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.feeData.feeDtSt = storage.feeDtSt;
		this.feeData.feeDtEd = storage.feeDtEd;
		this.storageDate = {fromDt: this.feeData.feeDtSt, toDt: this.feeData.feeDtEd};		
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.feeData.feeDtSt = event.fromDt;
		this.feeData.feeDtEd = event.toDt;
		
		this.storageDate = {fromDt: this.feeData.feeDtSt, toDt: this.feeData.feeDtEd};
		this._service.addDate(this._localService.secCode, {feeDtSt: event.fromDt, feeDtEd: event.toDt});
		// _.forEach(this.feeData, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);
		// });
	}		
}
