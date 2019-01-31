import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { CcService } from './cc-search/cc.service';
import { DashboardState } from '../dashboard.state';
import { DashboardService } from '../dashboard.service';
import { StoreService } from '../store/store.service';
import { AppService } from '../../app.service';

import * as Model from '../model/dashboard.model';

import * as _ from 'lodash';

interface ccModel {
	ccDtSt: string;
	ccDtEd: string;
}

@Component({
 	selector: 'cc-view',
    templateUrl: './cc-view.component.html',
    providers: [ CcService ]
})

export class CcViewComponent implements OnInit {
    ccForm: FormGroup;
	ccData: ccModel = {
		ccDtSt: null,
		ccDtEd: null
	};

	refreshMode: boolean = false;
	seqCode: string = this._localService.secCode;
	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	constructor(
        private _app: AppState,
        private _localService: CcService,
		private _service: DashboardService,
		private _state: DashboardState,
		private _store: StoreService,
        private _translate: TranslateService,
        private _router: Router,
		private _fb: FormBuilder,
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
		this._translate.get('renewal2017.p.message-cc').subscribe(res => {
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
				this.ccData = {
					ccDtSt: null,
					ccDtEd: null
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
		this.ccForm = this._fb.group({
			'ccDtSt': [this.ccData.ccDtSt, Validators.compose([Validators.required])],
			'ccDtEd': [this.ccData.ccDtEd, Validators.compose([Validators.required])]
		});
	}
	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.ccData.ccDtSt = storage.ccDtSt;
		this.ccData.ccDtEd = storage.ccDtEd;
		this.storageDate = {fromDt: this.ccData.ccDtSt, toDt: this.ccData.ccDtEd};		
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.ccData.ccDtSt = event.fromDt;
		this.ccData.ccDtEd = event.toDt;
		
		this.storageDate = {fromDt: this.ccData.ccDtSt, toDt: this.ccData.ccDtEd};
		this._service.addDate(this._localService.secCode, {ccDtSt: event.fromDt, ccDtEd: event.toDt});
		// _.forEach(this.ccData, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);
		// });
	}	    
}
