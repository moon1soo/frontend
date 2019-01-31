import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { AppState } from '../../app.state';
import { OrderService } from './order-search/order.service';
import { DashboardState } from '../dashboard.state';
import { DashboardService } from '../dashboard.service';
import { StoreService } from '../store/store.service';
import { AppService } from '../../app.service';

import * as Model from '../model/dashboard.model';

import * as _ from 'lodash';

interface orderModel {
	ordDtSt: string;
	ordDtEd: string;
}

@Component({
 	selector: 'order-view',
	templateUrl: './order-view.component.html',
	providers: [ OrderService ]
})

export class OrderViewComponent implements OnInit {

	orderForm: FormGroup = new FormGroup({});
	orderData: orderModel;
	refreshMode: boolean = false;
	seqCode: string = this._localService.secCode;

	freeTextCtrl: {freeText: string[]; freeTextCondition: string[];} = {
		freeText: [''],
		freeTextCondition: ['and']
	};
	freeTextAction: string[];
	freeTextCondAction: string[];
	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	oldData: any;

	constructor(
		private _router: Router,
		private _app: AppState,
		private _fb: FormBuilder,
		private _store: StoreService,
		private _translate: TranslateService,
		private _service: DashboardService,
		private _state: DashboardState,
		private _localService: OrderService,
		private _modalService: NgbModal,
		private _appService: AppService
	) {	
		this.orderData = {
			ordDtSt: null,
			ordDtEd: null
		}
	}

	ngOnInit() {
		sessionStorage.setItem('currentUrl', this._router.url);
		const store = this._store.store;
		const storage = store[this._state.code[this.seqCode].storage];
		// 언어 변경
		this._translate.use(this._appService.langInfo);			
		this._appService.language$.subscribe(res => {
			this._translate.use(res); 
			setTimeout(() => {
				window.location.reload();
			}, 100);
		});

		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-order').subscribe(res => {
			this._service.setMessage(res);
		});		
		
		if(storage) {
			this.storageDateLoad(storage);
		}

		this._store.deleteVo$.subscribe(res => {
			if(res === this._state.code[this._localService.secCode].storage) {
				this.refreshMode = true;
				this.orderData = {
					ordDtSt: null,
					ordDtEd: null
				}
				this.storageDate = {
					fromDt: null,
					toDt: null
				}
				this.freeTextCtrl = {
					freeText: [''],
					freeTextCondition: ['and']
				}
				this._localService.list().subscribe(res => {
					setTimeout(() => { this.refreshMode = false; }, 200);
				});
			}
		});

		this.orderForm = this._fb.group({
			'ordDtSt': [null, Validators.compose([Validators.required])],
			'ordDtEd': [null, Validators.compose([Validators.required])]
		});
		this.setDynamicForm();
		setTimeout(() => {

            this.watchForm();
		}, 10);
	}
	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.orderData.ordDtSt = storage.ordDtSt;
		this.orderData.ordDtEd = storage.ordDtEd;
		this.storageDate = {fromDt: this.orderData.ordDtSt, toDt: this.orderData.ordDtEd};		

		// 프리텍스트 교체
		if(storage.freeText.length) {
			// if(storage.freeText.length === 1 && !storage.freeText[0].length) {
			// 	this.freeTextCtrl.freeText = [''];
			// 	this.freeTextCtrl.freeTextCondition = ['and'];
			// } else {
			// 	this.freeTextCtrl.freeText = storage.freeText;
			// 	this.freeTextCtrl.freeTextCondition = storage.freeTextCondition;
			// }	
			this.freeTextCtrl.freeText = storage.freeText;
			this.freeTextCtrl.freeTextCondition = storage.freeTextCondition;
		}
		console.log(this.freeTextCtrl);
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.orderData.ordDtSt = event.fromDt;
		this.orderData.ordDtEd = event.toDt;
		
		this.storageDate = {fromDt: this.orderData.ordDtSt, toDt: this.orderData.ordDtEd};		
		this._service.addDate(this._localService.secCode, {ordDtSt: event.fromDt, ordDtEd: event.toDt});
		// _.forEach(this.orderData, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);
		// });
	}
	// 프리텍스트 컨트롤 동적 추가
	setDynamicForm(): void {
		console.log('동적 추가');
		this.refreshMode = true;
		const idx = this.freeTextCtrl.freeText;
		if(!idx || !idx.length) {
			let text: FormControl = new FormControl('');
			let condition: FormControl = new FormControl('');
			this.orderForm.addControl(`freeText-0`, text);
			this.orderForm.addControl(`freeTextCondition-0`, condition);
		} else {
			console.log(this.freeTextCtrl.freeText);
			for(let i = 0; i<idx.length; i++) {
				let text: FormControl = new FormControl('');
				let condition: FormControl = new FormControl('');
				this.orderForm.addControl(`freeText-${i}`, text);
				this.orderForm.addControl(`freeTextCondition-${i}`, condition);
			}
		}
		setTimeout(() => {
			this.refreshMode = false;
		}, 100);
		
	}
	addCondition(): void {
		let text: FormControl = new FormControl('');
		let condition: FormControl = new FormControl('and');

		this.freeTextCtrl.freeText.push('');
		this.freeTextCtrl.freeTextCondition.push('and');
		
		this.orderForm.addControl(`freeText-${this.freeTextCtrl.freeText.length - 1}`, text);
		this.orderForm.addControl(`freeTextCondition-${this.freeTextCtrl.freeTextCondition.length - 1}`, condition);
	}
	delCondition(): void {
		// let text: FormControl = new FormControl('');
		// let condition: FormControl = new FormControl('and');
		this.freeTextCtrl.freeText.splice(this.freeTextCtrl.freeText.length - 1, 1);
		this.freeTextCtrl.freeTextCondition.splice(this.freeTextCtrl.freeTextCondition.length - 1, 1);
		console.log(this.freeTextCtrl);
		setTimeout(() => {
			this.orderForm.removeControl(`freeText-${this.freeTextCtrl.freeText.length}`);
			this.orderForm.removeControl(`freeTextCondition-${this.freeTextCtrl.freeTextCondition.length}`);
			this.orderForm.updateValueAndValidity();
		}, 10);
	}

	// 폼 변경 여부 관찰.
	watchForm(): void {
		this.orderForm.valueChanges
			.debounceTime(800)
			.distinctUntilChanged()
			.subscribe(res => {		
				console.log(res);
				this.freeTextAction = [];
				this.freeTextCondAction = [];
				for(let key of Object.keys(res)) {
					const title = key.split('-')[0];
					const idx = key.split('-')[1];
					if(title === 'freeText' || title === 'freeTextCondition') {
						// const head = key.split('-')[0];
						// const idx = key.split('-')[1];
			
						if(title === 'freeText') {
							this.freeTextAction.push(res[key]);
						} else if(title === 'freeTextCondition') {
							if(res[key] === "") {
								this.freeTextCondAction.push('and');
							} else {
								this.freeTextCondAction.push(res[key]);
							}
						}
					}
				}
				console.log(this.freeTextAction);
				this.sendData();
		});
	}

	sendData(): void {
		this.freeTextCtrl = {
			freeText: this.freeTextAction,
			freeTextCondition: this.freeTextCondAction
		}
		console.log(this.freeTextCtrl);
		if(this.freeTextCtrl.freeText[0] && this.freeTextCtrl.freeText[0].length) {
			this._service.addDataCondition(this._localService.secCode, this.freeTextCtrl);
		}
	}
}
