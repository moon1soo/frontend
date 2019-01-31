import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { NavigationExtras, NavigationStart, Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import {NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { IMultiSelectOption, IMultiSelectTexts,IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import * as Model from '../model/diagram.model';
// import * as StoreModel from '../store/store.model';

import { PowermodeStoreService } from '../store/store.service';
import { AppState } from 'app/app.state';
import { AppService } from '../../app.service';
import { HospitalService } from './hospital.service';
import { DashboardState } from '../../basicmode/dashboard.state';

import * as _ from 'lodash';

@Component({
 	selector: 'basic-view',
	templateUrl: './basic-view.component.html',
	providers: [ HospitalService, DashboardState ]
})
export class BasicViewComponent implements OnInit {
  	stfNo = sessionStorage.getItem('stfNo');
 
	basicForm: FormGroup;
	hospitalForm: FormGroup;

	setBasic: any = {
		hspTpCd: null,
		gender: 'A',
		ptBrdyDtSt: null,
		ptBrdyDtEd: null
	};

	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	optionsModel: any[] = [];
    myOptions: any[] = [];
    mySettings: IMultiSelectSettings = {
        enableSearch: false,
        buttonClasses: 'btn btn-light',
		selectAddedValues: true,
		dynamicTitleMaxItems: 6
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

	constructor(
		private _fb: FormBuilder,
		private _app: AppState,
		private _store: PowermodeStoreService,
		private _translate: TranslateService,
		private _router: Router,
		private _modalService: NgbModal,
		private _appService: AppService,
		private _service: HospitalService
	) {
		this.basicForm = _fb.group({
			'gender': ['', Validators.compose([Validators.required])],
			'ptBrdyDtSt': [''],
			'ptBrdyDtEd': ['']
		});
		this.hospitalForm = this._fb.group({
			'optionsModel': ['']
		});
	}
	ngOnInit() {
		const store = this._store.store;
		const storage = store.basicStore;
		sessionStorage.setItem('currentUrl', this._router.url);
		// console.log(this._app.trans.uncheckAll);
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
		// 병원목록 불러오기
		this._service.list().subscribe(res => {
            for(let data of res) {
                this.myOptions.push({
                    id: data.hspTpCd,
                    name: data.hspTpNm
                });
            }
		});

		setTimeout(() => {
			this.watchForm();
		}, 10);
	}

	// 데이터 로드
	storageDateLoad(storage: any): void {
		// console.log('데이터로드', storage);
		for(let key of Object.keys(storage)) {
			this.setBasic[key] = storage[key];
		}		
		this.storageDate = {fromDt: storage.ptBrdyDtSt, toDt: storage.ptBrdyDtEd};		
		if(storage.hspTpCd) {
			this.optionsModel = storage.hspTpCd.split(',');
		}		
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.setBasic.ptBrdyDtSt = event.fromDt;
		this.setBasic.ptBrdyDtEd = event.toDt;
		
		this.storageDate = {fromDt: this.setBasic.ptBrdyDtSt, toDt: this.setBasic.ptBrdyDtEd};		
		this._store.shareBasicDefault(this.setBasic);
	}
	// 선택 변경
    onChange() {
		if(this.optionsModel.length) {
			this._store.shareBasicDefault({hspTpCd: this.optionsModel.join(',')});
		}
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
				this._store.shareBasicDefault(this.setBasic);
		});
	}
}
