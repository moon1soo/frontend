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
import { UploadPatientsModal } from '../../modal/upload-patients-modal.component';
import { ConcernService } from './concern-search/concern.service';

import { DashboardService } from '../dashboard.service';
import { AppState } from '../../app.state';
import { DashboardState } from '../dashboard.state';
import { StoreService } from '../store/store.service';
import { AppService } from '../../app.service';

import * as Model from '../model/dashboard.model';

import notify from 'devextreme/ui/notify';
import * as _ from 'lodash';

@Component({
 	selector: 'concern-view',
	templateUrl: './concern-view.component.html',
	providers : [
		ConcernService
	]
})

export class ConcernViewComponent implements OnInit {

	refreshMode: boolean = false;
	closeResult: string;

	appUrl: string;
	uploadUrl: string;
	isUploaded = false;
	uploadPatient: Number;

	concernForm: FormGroup;
	concernData = {
		uploadYN: null
	};

	constructor(
		private _app: AppState,
        private _service: DashboardService,
        private _fb: FormBuilder,
        private _router: Router,
        private _translate: TranslateService,
        private _store: StoreService,
		private _state: DashboardState,
		private _modalService: NgbModal,
		private _appService: AppService,
		private _localService: ConcernService
	) {
		this.appUrl = this._app.ajaxUrl;
		this.uploadUrl = `${this.appUrl}work/execute/patientsUpload.json`;
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
		// 환자명단 업로드 수 파악
		this._store.storeVo$.subscribe(res => {
			const patient = res.basicStore.uploadPatients;
			if(patient) {
				this.uploadPatient = patient.split(',').length;
				// this.concernData.uploadYN = 'Y';
			} else {
				this.uploadPatient = null;
				// this.concernData.uploadYN = 'N';
			}
			
		});
		//  쿼리플로우에서 삭제할 경우 환자명단 업로드 목록도 삭제
		this._store.deleteVo$.subscribe(res => {
			if(res === this._state.code[this._localService.secCode].storage) {
				const store = this._store.store;
				store.basicStore.uploadPatients = null;
				this._store.setStore = store;
				this.concernData.uploadYN = 'N';
			}
		});

		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-concern').subscribe(res => {
			this._service.setMessage(res);
		});

		const store = this._store.store;
		const storage = store[this._state.code[this._localService.secCode].storage];

		this.concernForm  = this._fb.group({
			'uploadYN': this.concernData.uploadYN
		});

		if (storage) {
			if (storage.uploadYN === 'Y') {
				this.checkUploaded(storage);
			}
		}

		setTimeout(() => {
            this.watchForm();
        }, 10);
	}
	
	// Upload Patients
	uploadPatients(): void {
		const modalRef = this._modalService.open(UploadPatientsModal, {
			size: 'lg'
		});
		modalRef.componentInstance.data = 'basicmode';
		modalRef.result.then((result) => {
			if (result && result !== 'no') {
				if(result.length < 100000) {
					this.concernData.uploadYN = 'Y';
					this.concernForm.setValue(this.concernData);
	
					const store = this._store.store;
					const basic = store.basicStore;
					basic['uploadPatients'] = result.response;
				} else {
					notify(this._translate.instant('renewal2017.p.alert-limit-upload'), 'error', 2000);
				}
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}

	checkUploaded(storage: any): void {
		this.concernData.uploadYN = storage.uploadYN;
		this.concernForm.setValue(this.concernData);
	}

    // 폼 변경 여부 관찰.
	watchForm(): void {
		this.concernForm.valueChanges
			.debounceTime(100)
			.distinctUntilChanged()
			.subscribe(res => {
				if(!this.refreshMode) {
					for(let key of Object.keys(res)) {
						let data;
						if(key === 'uploadYN') {
							res[key] ? data = 'Y' : data = 'N';
							this._service.addDataString(this._localService.secCode, key, data);
						}
					}
				}
		});
	}
}
