import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { ExamService } from './exam-search/exam.service';
// import { ExamResultService } from './exam-result/exam-result.service';

import { DashboardService } from '../dashboard.service';
import { DashboardState } from '../dashboard.state';
import { StoreService } from '../store/store.service';
import { AppService } from '../../app.service';

import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';

import * as _ from 'lodash';

interface examModel {
	testDtSt: string;
	testDtEd: string;
	yn: string;
}

@Component({
	selector: 'exam-view',
    templateUrl: './exam-view.component.html',
    providers: [ ExamService ]
})
export class ExamViewComponent implements OnInit {
	@ViewChild('tab') tab: any;
	
  	examForm: FormGroup;
	examData: examModel = {
		testDtSt: null,
		testDtEd: null,
		yn: null
	}
	
	isExam: boolean = true;
	ixExamResult: boolean = true;

	refreshMode: boolean = false;

	seqCode: string = this._localService.secCode;
	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	constructor(
		private _app: AppState,
		private _router: Router,
		private _service: DashboardService,
		private _store: StoreService,
		private _state: DashboardState,
        private _fb: FormBuilder,
		private _localService: ExamService,
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
		this._translate.get('renewal2017.p.message-exam').subscribe(res => {
			this._service.setMessage(res);
		});

		const store = this._store.store;
		const storage = store[this._state.code[this.seqCode].storage];

		if(storage) {
			this.storageDateLoad(storage);
		}

		this._store.deleteVo$.subscribe(res => {
			if(res === this._state.code[this._localService.secCode].storage) {
				this.tab.select('tab-exam');

				this.refreshMode = true;
				this.examData = {
					testDtSt: null,
					testDtEd: null,
					yn: null
				}
				this.storageDate = {
					fromDt: null,
					toDt: null
				}
				this._localService.list().subscribe(res => {
					setTimeout(() => { 
						this.refreshMode = false; 						
					}, 200);
				});
			}
		});
		this.examForm = this._fb.group({
			'testDtSt': [this.examData.testDtSt, Validators.compose([Validators.required])],
			'testDtEd': [this.examData.testDtEd, Validators.compose([Validators.required])],
			'yn': [this.examData.yn]
		});

		this._store.storeVo$.subscribe(res => {
			if(res.examStore) {
				this.isExam = Boolean(res.examStore.select1.length === 0 
					|| (res.examStore.select1 && res.examStore.select1[0] === ''));
			}
			if(res.examResultStore) {
				this.ixExamResult = Boolean(res.examResultStore.select1.length === 0 
					|| (res.examResultStore.select1 && res.examResultStore.select1[0] === ''));
			}
		});	

		setTimeout(() => {
            this.watchForm();
        }, 10);
	}
	
	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.examData.testDtSt = storage.testDtSt;
		this.examData.testDtEd = storage.testDtEd;
		this.examData.yn = storage.yn;
		this.storageDate = {fromDt: storage.testDtSt, toDt: storage.testDtEd};		
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.examData.testDtSt = event.fromDt;
		this.examData.testDtEd = event.toDt;
		
		this.storageDate = {fromDt: this.examData.testDtSt, toDt: this.examData.testDtEd};
		this._service.addDate(this._localService.secCode, {testDtSt: event.fromDt, testDtEd: event.toDt});
		// _.forEach(this.examData, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);
		// });
	}

    // 폼 변경 여부 관찰.
	watchForm(): void {
		this.examForm.valueChanges
			.debounceTime(100)
			.distinctUntilChanged()
			.subscribe(res => {
				if(!this.refreshMode) {
					for(let key of Object.keys(res)) {
						let data;
						if (key === 'yn') {
							res[key] ? data = 'Y' : data = 'N';
							this._service.addDataString(this._localService.secCode, key, data);
						}
					}
				}
		});
	}
}

