import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { DashboardService } from '../dashboard.service';
import { DashboardState } from '../dashboard.state';
import { StoreService } from '../store/store.service';
import { DiagnosisService } from './diagnosis-search/diagnosis.service'
import { DiagMedicalService } from './diag-medical/diag-medical.service'
import { AppService } from '../../app.service';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';

import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';

declare const $: any;

interface diagnosisModel {
	dgnsDtSt: string;
	dgnsDtEd: string;
}

@Component({
	selector: 'diagnosis-view',
	templateUrl: './diagnosis-view.component.html',
	providers: [ DiagnosisService ]
})
export class DiagnosisViewComponent implements OnInit {

  	diagnosisForm: FormGroup;
	diagnosisData: diagnosisModel = {
		dgnsDtSt: null,
		dgnsDtEd: null
	};

	refreshMode: boolean = false;
	seqCode: string = this._localService.secCode;
	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	private submitComplete = new Subject<boolean>();
	submitComplete$ = this.submitComplete.asObservable();
	requestComplete: boolean = false;

	constructor(
    	private _app: AppState,
		private _service: DashboardService,
		private _store: StoreService,
		private _state: DashboardState,
		private _fb: FormBuilder,
		private _router: Router,
		private _localService: DiagnosisService,
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

		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-diagnosis').subscribe(res => {
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
				this.diagnosisData = {
					dgnsDtSt: null,
					dgnsDtEd: null
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
		this.diagnosisForm = this._fb.group({
			'dgnsDtSt': [this.diagnosisData.dgnsDtSt, Validators.compose([Validators.required])],
			'dgnsDtEd': [this.diagnosisData.dgnsDtEd, Validators.compose([Validators.required])]
		});
	}
	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.diagnosisData.dgnsDtSt = storage.dgnsDtSt;
		this.diagnosisData.dgnsDtEd = storage.dgnsDtEd;
		this.storageDate = {fromDt: storage.dgnsDtSt, toDt: storage.dgnsDtEd};		
		
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.diagnosisData.dgnsDtSt = event.fromDt;
		this.diagnosisData.dgnsDtEd = event.toDt;
		
		this.storageDate = {fromDt: event.fromDt, toDt: event.toDt};
		console.log(this.storageDate);
		this._service.addDate(this._localService.secCode, {dgnsDtSt: event.fromDt, dgnsDtEd: event.toDt});
		// _.forEach(this.diagnosisData, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);		
		// });
	}	
}
