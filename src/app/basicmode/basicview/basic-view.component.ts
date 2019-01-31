import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { NavigationExtras, NavigationStart, Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';

import { StoreService } from '../store/store.service';
import { AppState } from 'app/app.state';
import { AppService } from '../../app.service';
import { DateRangePicker } from '../../widget/daterangepicker';
declare const $: any;

import * as _ from 'lodash';

@Component({
 	selector: 'basic-view',
	templateUrl: './basic-view.component.html'
})
export class BasicViewComponent implements OnInit {

  stfNo = sessionStorage.getItem('stfNo');

  yd = new Date(Date.now() - 24 * 1000 * 60 * 60);
  yesterDay = { year: this.yd.getFullYear(), month: this.yd.getMonth() + 1, day: this.yd.getDate() };
  
	basicForm: FormGroup;
	today: NgbDateStruct;
	lastDate: NgbDateStruct;
	// basic: any;
	setBasic: any = {
		hspTpCd: null,
		lclTpCd: 'L1',
		rschRprvId: 'CRI',
		stfNo: this.stfNo,
		language: 'kr',
		gender: 'A',
		ptBrdyDtSt: null,
		ptBrdyDtEd: null
	};

	secCode: {storage: string;} = {
		storage: 'basicStore'
	};
	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	constructor(
		private _fb: FormBuilder,
		private _app: AppState,
		private _store: StoreService,
		private _translate: TranslateService,
		private _router: Router,
		private _modalService: NgbModal,
		private _appService: AppService
	) {
		this.today = this._app.today;
		this.lastDate = this._app.lastDate;
	
		this.basicForm = _fb.group({
			'gender': ['', Validators.compose([Validators.required])],
			'ptBrdyDtSt': [''],
			'ptBrdyDtEd': ['']
		});
	}
	ngOnInit() {
		const store = this._store.store;
		const storage = store[this.secCode.storage];
		sessionStorage.setItem('currentUrl', this._router.url);
		// $('select').selectpicker();
		// 언어 변경
		this._translate.use(this._appService.langInfo);			
		this._appService.language$.subscribe(res => {
			this._translate.use(res); 
			setTimeout(() => {
				window.location.reload();
			}, 100);
		});

		if(storage) {
			this.setBasic = storage;
			this.storageDateLoad(storage);
		} else {
			this._store.shareBasicDefault(this.setBasic);
		}

		setTimeout(() => {
			this.watchForm();
		}, 10);
	}

	// 데이터 로드
	storageDateLoad(storage: any): void {
		for(let key of Object.keys(storage)) {
			this.setBasic[key] = storage[key];
		}
		
		this.storageDate = {fromDt: storage.ptBrdyDtSt, toDt: storage.ptBrdyDtEd};		
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		console.log('생년월일 입력',event);
		this.setBasic.ptBrdyDtSt = event.fromDt;
		this.setBasic.ptBrdyDtEd = event.toDt;
		
		this.storageDate = {fromDt: this.setBasic.ptBrdyDtSt, toDt: this.setBasic.ptBrdyDtEd};		
		this._store.shareBasicDefault(this.setBasic);
	}	

	// 폼 변경 여부 관찰.
	watchForm(): void {
		this.basicForm.valueChanges
			.debounceTime(800)
			.distinctUntilChanged()
			.subscribe(res => {
				for(let key of Object.keys(res)) {
					if(!~key.indexOf('ptBrdyDt')) {
						this.setBasic[key] = res[key];
					}
				}
				// if(this.setBasic.hspTpCd) {
				// 	delete this.setBasic.hspTpCd;
				// }
				this._store.shareBasicDefault(this.setBasic);
		});
	}
}
