import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { IMultiSelectOption, IMultiSelectTexts,IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

import { AppState } from '../../app.state';
import { DashboardService } from '../dashboard.service';
import { SurgicalService } from './surgical-search/surgical.service';
import { PartiSurService } from './parti-sur.service';
import { PartiAnesthService } from './parti-anesth.service';
import { SurDoctorService } from './sur-doctor/sur-doctor.service';
import { SurMedicalService } from './sur-medical/sur-medical.service';
import { SurDiagService } from './sur-diag-search/sur-diag.service';
import { DashboardState } from '../dashboard.state';
import { StoreService } from '../store/store.service';
import { AppService } from '../../app.service';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';

import * as _ from 'lodash';

interface surgicalModel {
	partiSur: string[];
	anesth: string[];
}
interface surgicalDateModel {
	srgrDtSt: string;
	srgrDtEd: string;
}

@Component({
	selector: 'surgical-view',
    templateUrl: './surgical-view.component.html',
    providers: [ SurgicalService, PartiSurService, PartiAnesthService, SurDoctorService, SurDiagService ]
})
export class SurgicalViewComponent implements OnInit {

	surgicalForm: FormGroup;
	surgicalData: surgicalModel = {
		partiSur: [],
		anesth: []
	};
	surgicalPeriod: surgicalDateModel = {
		srgrDtSt: null,
		srgrDtEd: null
	}

	partiSurData: {id: string; name: string}[];
	partiAnesthData: {id: string; name: string}[];

	refreshMode: boolean = false;

	seqCode: string = this._localService.secCode;
	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

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
		private _app: AppState,
		private _router: Router,
		private _service: DashboardService,
		private _store: StoreService,
		private _state: DashboardState,
        private _fb: FormBuilder,
		private _localService: SurgicalService,
		private _partiSurService: PartiSurService,
		private _partiAnesthService: PartiAnesthService,
		private _translate: TranslateService,
		private _modalService: NgbModal,
		private _appService: AppService
	) {
		// 수술 후 퇴실장소 데이터 가져옴
        this._partiSurService.list().subscribe(res => {
			this.partiSurData = res;
			if(this._partiSurService.partiSurStorage) {
				this.surgicalData.partiSur = this._partiSurService.partiSurStorage;
			}
		});
		// 마취종류 데이터 가져옴
        this._partiAnesthService.list().subscribe(res => {
			this.partiAnesthData = res;
			if(this._partiAnesthService.partiAnesthStorage) {
				this.surgicalData.anesth = this._partiAnesthService.partiAnesthStorage;
			}
		});
	}
	ngOnInit() {
		sessionStorage.setItem('currentUrl', this._router.url);
		const store = this._store.store;
		const storage = store[this._state.code[this.seqCode].storage];

		// 언어 변경
		this._translate.use(this._appService.langInfo);			
		this._appService.language$.subscribe(res => {
			this._translate.use(res); 
			setTimeout(() => { window.location.reload(); }, 100);
		});
		
		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-surgical').subscribe(res => {
			this._service.setMessage(res);
		});		

		if(storage) {
			this.storageDateLoad(storage);
		}

		this._store.deleteVo$.subscribe(res => {
			if(res === this._state.code[this._localService.secCode].storage) {
				this.refreshMode = true;
				this.surgicalData = {
					partiSur: [],
					anesth: []
				}
				this.surgicalPeriod = {
					srgrDtSt: null,
					srgrDtEd: null
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
		this.surgicalForm = this._fb.group({
			'partiSur': [this.surgicalData.partiSur],
			'anesth': [this.surgicalData.anesth]
		});
	}

	// 수술 후 퇴실장소 선택 변경
    onChange(event: MouseEvent): void {
		if(this.surgicalData.partiSur.length >= 0) {
			this._store.shareTableStore({
				select1: this.surgicalData.partiSur.join(','),
			}, this._state.code[this._partiSurService.secCode].storage);
		}
	}
	// 마취종류 선택 변경
    onChangeAneth(event: MouseEvent): void {
		if(this.surgicalData.anesth.length >= 0) {
			this._store.shareTableStore({
				select1: this.surgicalData.anesth.join(','),
			}, this._state.code[this._partiAnesthService.secCode].storage);
		}
	}
	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.surgicalPeriod.srgrDtSt = storage.srgrDtSt;
		this.surgicalPeriod.srgrDtEd = storage.srgrDtEd;
		this.storageDate = {fromDt: this.surgicalPeriod.srgrDtSt, toDt: this.surgicalPeriod.srgrDtEd};		
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.surgicalPeriod.srgrDtSt = event.fromDt;
		this.surgicalPeriod.srgrDtEd = event.toDt;
		
		this.storageDate = {fromDt: this.surgicalPeriod.srgrDtSt, toDt: this.surgicalPeriod.srgrDtEd};
		this._service.addDate(this._localService.secCode, {srgrDtSt: event.fromDt, srgrDtEd: event.toDt});
		// _.forEach(this.surgicalPeriod, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);			
		// });
	}
}
