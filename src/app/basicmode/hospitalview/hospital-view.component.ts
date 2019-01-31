import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { IMultiSelectOption, IMultiSelectTexts,IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import 'rxjs/add/observable/of';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from 'app/app.state';
import { StoreService } from '../store/store.service';
import { DashboardService } from '../dashboard.service';
import { DashboardState } from '../dashboard.state';
import { DashboardDatepicker } from '../dashboard.datepicker';
import { AppService } from '../../app.service';
import { MedicalService } from './medical/medical.service';
import { DoctorService } from './doctor/doctor.service';

import * as Model from '../store/store.model';
import * as StoreModel from '../store/store.model';

@Component({
	selector: 'hospital-view',
	templateUrl: './hospital-view.component.html',
	providers: [ MedicalService, DoctorService ]
})
export class HospitalViewComponent implements OnInit {

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
	
	myOptions: any[] = [];
	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};
	activeId: string = 'tab-medical-server';

	visitForm: FormGroup;
	setBasic: any = {
		// period1: null,
		// period2: null,
		ageTpCd: 'Y',
		age1: null,
		age2: null,
		pactTpCd: 'A'
	};
	basic: any;
	secCode: {storage: string;} = {
		storage: 'basicStore'	
	};
	dateUnit: {name: string; value:string;}[] = [
		{name: this._app.trans.oldYear, value: 'Y'},
		{name: this._app.trans.oldMonth, value: 'M'},
		{name: this._app.trans.day, value: 'D'}
	];	

	constructor(
		private _app: AppState,
		private _router: Router,
		private _fb: FormBuilder,
		private _store: StoreService,
		private _state: DashboardState,
		private _service: DashboardService,
		private _medical: MedicalService,
		private _doctor: DoctorService, 
		private _translate: TranslateService,
		private _modalService: NgbModal,
		private _appService: AppService
	) {				
		const store = this._store.store;
		const storage = store.basicStore;		
		this.myOptions = [
			{name: this._app.trans.pactEmergency, id:'E'},
			{name: this._app.trans.pactOut, id:'O'},
			{name: this._app.trans.pactIn, id:'I'}
		];
		this.basic = {
			// period1: null,
			// period2: null,
			ageTpCd: 'Y',
			age1: null,
			age2: null,
			pactTpCd: null
		};
	}
	ngOnInit() {
		const store = this._store.store;
		const storage = store[this.secCode.storage];

		// 언어 변경
		this._translate.use(this._appService.langInfo);
		this._appService.language$.subscribe(res => {
			this._translate.use(res); 
			setTimeout(() => {
				window.location.reload();
			}, 100);
		});

		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-visit').subscribe(res => {
			this._service.setMessage(res);
		});
		
		this.visitForm = this._fb.group({
			'pactTpCd': [this.setBasic.pactTpCd],
			// 'period1': [this.basic.period1, Validators.compose([Validators.required])],
			// 'period2': [this.basic.period2, Validators.compose([Validators.required])],
			'ageTpCd': ['', Validators.compose([Validators.required])],
			'age1': [''],
			'age2': ['']
		});

		if(storage) {
			this.loadData(storage);
		} else {
			this._store.shareBasicDefault(this.setBasic);
		}

		// this._medical.list().subscribe(res => {

		// });
		// this._doctor.list().subscribe(res => {

		// });

		this._store.deleteVo$.subscribe(res => {			
			if(res === 'medicalStore') {
				// this.refreshMode = true;
				this.storageDate = {
					fromDt: null,
					toDt: null
				}
				this.basic = {
					// period1: null,
					// period2: null,
					ageTpCd: 'Y',
					age1: null,
					age2: null,
					pactTpCd: null
				};
			}
		});

		setTimeout(() => {
			this.watchForm();
		}, 10);
	}
	loadData(data: any): void {				
		for(let key of Object.keys(data)) {
			if(key === 'pactTpCd') {
				const val = data[key].split(',');
				if(data[key] !== 'A') {
					this.basic[key] = data[key].split(',');	
				} else {
					this.basic[key] = null;
				}
			} else {
				this.basic[key] = data[key];
			}
		}
		this.storageDate = {fromDt: this.basic.period1, toDt: this.basic.period2};
	}

	// 폼 변경여부 관찰
	watchForm(): void {
		this.visitForm.valueChanges
			.debounceTime(100)
			.distinctUntilChanged()
			.subscribe(res => {
				console.log(res);
				for(let key of Object.keys(res)) {
					// 수진 기간
					if(res[key] !== undefined) {
						// 환자 정보
						if(key ==='pactTpCd') {
							let txt = [];
									
							if(!res[key]) {
								this.setBasic['pactTpCd'] = 'A';
								this.setBasic['ptTpNm'] = null;
							} else {
								for(let prop of res[key]) {
									switch(prop) {
										case 'I':
											txt.push('I|입원/:/');
											break;
										case 'O':
											txt.push('O|외래/:/');
											break;
										case 'E':
											txt.push('E|응급/:/');
											break;
									}
								}	
								this.setBasic['pactTpCd'] = res[key].join(',');
								this.setBasic['ptTpNm'] = txt.join('|');
							}		
							
						} else if(typeof res[key] === 'number') {
							this.setBasic[key] = String(res[key]);
						} else if(key !== 'ptTpNm') {
							this.setBasic[key] = res[key];
						}
					}
				}				
				this._store.shareBasicDefault(this.setBasic);
		});
	}
	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this._store.shareBasicDefault({period1: event.fromDt, period2: event.toDt});
	}
	// 선택 변경
    onChange(event) {
		// console.log(this.basic['pactTpCd']);			 
	}
	// 탭 변경
	beforeChange(event: NgbTabChangeEvent) {
		// console.log('탭 변경 정보', event);
		this.activeId = event.nextId;
		// if ($event.nextId === 'tab-preventchange2') {
		// 	$event.preventDefault();
		// }
	};
}

