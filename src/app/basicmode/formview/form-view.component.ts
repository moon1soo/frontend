import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { AppState } from '../../app.state';
import { DashboardService } from '../dashboard.service';
import { FormBasicService } from './form-basic/form-basic.service'
import { DashboardState } from '../dashboard.state';
import { StoreService } from '../store/store.service';
import { AppService } from '../../app.service';

interface formModel {
	formDtSt: string;
	formDtEd: string;
}

@Component({
	selector: 'form-view',
	templateUrl: './form-view.component.html',
	providers: [ FormBasicService ]
})
export class FormViewComponent implements OnInit {
	@ViewChild('formBasic') formBasic: any; 
	@ViewChild('tab') tab: any; 

    formForm: FormGroup;
	formData: {yn: string} = {		
		yn: null
	};
	formPeriod: formModel = {
		formDtSt: null,
		formDtEd: null
	}
	
	isFormBasic: boolean = true;
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
		private _localService: FormBasicService,
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
		this._translate.get('renewal2017.p.message-form').subscribe(res => {
			this._service.setMessage(res);
		});
	
		const store = this._store.store;
		const storage = store[this._state.code[this.seqCode].storage];
		if(storage) {
			this.storageDateLoad(storage);
		}
		
		this._store.deleteVo$.subscribe(res => {			
			if(res === this._state.code[this._localService.secCode].storage) {
				this.tab.select('tab-form');
				
				this.refreshMode = true;
				this.formData = {
					yn: null
				}
				this.storageDate = {
					fromDt: null,
					toDt: null
				}
				this.formPeriod = {
					formDtSt: null,
					formDtEd: null
				}
				this._localService.list().subscribe(res => {
					setTimeout(() => { this.refreshMode = false; }, 200);
				});				
			}			
		});
		this.formForm = this._fb.group({			
			'yn': [this.formData.yn]
		});
		setTimeout(() => {
			
			this._store.storeVo$.subscribe(res => {
				if(res.formStore) {
					this.isFormBasic = Boolean((res.formStore.select1 && res.formStore.select1.length === 0) 
						|| (res.formStore.select1 && res.formStore.select1[0] === ''));
				}
			});
			
            this.watchForm();
        }, 10);
	}
	// 날짜 로드
	storageDateLoad(storage: any): void {
		console.log(storage);
		this.formPeriod.formDtSt = storage.formDtSt;
		this.formPeriod.formDtEd = storage.formDtEd;
		this.formData.yn = storage.yn;
		this.storageDate = {fromDt: storage.formDtSt, toDt: storage.formDtEd};		
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.formPeriod.formDtSt = event.fromDt;
		this.formPeriod.formDtEd = event.toDt;
		
		this.storageDate = {fromDt: this.formPeriod.formDtSt, toDt: this.formPeriod.formDtEd};
		this._service.addDate(this._localService.secCode, {formDtSt: event.fromDt, formDtEd: event.toDt});
		// _.forEach(this.formPeriod, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);
		// });
	}	

    // 폼 변경 여부 관찰.
	watchForm(): void {
		this.formForm.valueChanges
			.debounceTime(100)
			.distinctUntilChanged()
			.subscribe(res => {
				if(!this.refreshMode) {
					for(let key of Object.keys(res)) {
						let data;
						if(key === 'yn') {
							res[key] ? data = 'Y' : data = 'N';
							this._service.addDataString(this._localService.secCode, key, data);
						}
					}
				}
		});
	}
}

