import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { MedicineService } from './medicine-search/medicine.service';
import { DashboardService } from '../dashboard.service';
import { AppState } from '../../app.state';
import { DashboardState } from '../dashboard.state';
import { StoreService } from '../store/store.service';
import { AppService } from '../../app.service';

import * as Model from '../model/dashboard.model';

import * as _ from 'lodash';

interface medicineModel {
    mdprDtSt: string;
    mdprDtEd: string;
}

@Component({
 	selector: 'medicine-view',
    templateUrl: './medicine-view.component.html',
    providers: [ MedicineService ]
})

export class MedicineViewComponent implements OnInit {

    medicineForm: FormGroup;
    medicineData: medicineModel;

    refreshMode: boolean = false;

    seqCode: string = this._localService.secCode;
	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	constructor(
		private _app: AppState,
        private _localService: MedicineService,
        private _service: DashboardService,
        private _fb: FormBuilder,
        private _router: Router,
        private _translate: TranslateService,
        private _store: StoreService,
		private _state: DashboardState,
		private _modalService: NgbModal,
		private _appService: AppService
	) {	
        this.medicineData = {
			mdprDtSt: null,
            mdprDtEd: null
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
		this._translate.get('renewal2017.p.message-medicine').subscribe(res => {
			this._service.setMessage(res);
		});

		if(storage) {
			this.storageDateLoad(storage);
		}
        this._store.deleteVo$.subscribe(res => {			
			if(res === this._state.code[this._localService.secCode].storage) {
				this.refreshMode = true;
				this.medicineData = {
                    mdprDtSt: null,
                    mdprDtEd: null
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
        this.medicineForm = this._fb.group({
			'mdprDtSt': [this.medicineData.mdprDtSt, Validators.compose([Validators.required])],
            'mdprDtEd': [this.medicineData.mdprDtEd, Validators.compose([Validators.required])],
        });
    }
    // 날짜 로드
	storageDateLoad(storage: any): void {
		this.medicineData.mdprDtSt = storage.mdprDtSt;
		this.medicineData.mdprDtEd = storage.mdprDtEd;
		this.storageDate = {fromDt: this.medicineData.mdprDtSt, toDt: this.medicineData.mdprDtEd};		
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.medicineData.mdprDtSt = event.fromDt;
		this.medicineData.mdprDtEd = event.toDt;
		
		this.storageDate = {fromDt: this.medicineData.mdprDtSt, toDt: this.medicineData.mdprDtEd};
		this._service.addDate(this._localService.secCode, {mdprDtSt: event.fromDt, mdprDtEd: event.toDt});
		// _.forEach(this.medicineData, (val, key) => {
		// 	this._service.addDataString(this._localService.secCode, key, val);
		// });
    }	
}
