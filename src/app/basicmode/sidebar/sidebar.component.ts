import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Router, NavigationEnd } from '@angular/router';
import { HelpModal } from '../../modal/help-modal.component';
import { SaveQueryModal } from '../../modal/save-query-modal.component';
import { WorkflowComponent } from '../workflow/workflow.component';
import { WorkflowService } from '../workflow/workflow.service';
import { ResultService } from '../interimresult/interim-result.service';
import { StoreService } from '../store/store.service';
import { ScenarioService } from '../scenario/scenario.service';
import { UploadPatientsModal } from '../../modal/upload-patients-modal.component';
import { AppState } from '../../app.state';

@Component({
	selector: 'sidebar-layout',
	templateUrl: './sidebar.component.html',
	providers: [ 
		ScenarioService,
		WorkflowComponent,
		WorkflowService,
		ResultService
	]
})
export class SidebarComponent implements OnInit {
	@Output() toggle = new EventEmitter();
	closeResult: string;
	appurl: string;
	adminYn: boolean = false;
	isPatientList: boolean = false;

	constructor(
		private _app: AppState,
		private _router: Router,
		private _modalService: NgbModal,
		private _store: StoreService,
		private _service: ScenarioService,
		private _workflow: WorkflowComponent
	) {
		this.appurl = this._app.ajaxUrl;
		
	}
	ngOnInit() {
		const stfNo = sessionStorage.getItem('stfNo');
		
		if (sessionStorage.getItem('authCd') === 'A' || sessionStorage.getItem('authCd') === 'R') {
			this.adminYn = true;
		} else {
			this.adminYn = false;
		}

		// 주소 변경 감지
		const route = this._router.url;
		
		let disableUpload = (url: string) => {
			if(~url.indexOf('interim')) {
				this.isPatientList = true;
			} else {
				this.isPatientList = false;
			}
		}
		disableUpload(route);
		this._router.events.subscribe(event => {
			if(event instanceof NavigationEnd) {
				disableUpload(event.url);
			}
		});
		// console.log(this._router.url);
	}

	toggleMenu() {
        this.toggle.emit();
	}
	// 시나리오 저장
	saveScenario(): void {
		const select = this._store.store.basicStore.select;
		console.log('select', select);

		if (select && select.length > 0) {
			const modalRef = this._modalService.open(SaveQueryModal);
			let store = {};
			modalRef.result.then((result) => {
				if (result && result !== 'no') {
					// 시나리오 저장 액션
					store['queryFlowNm'] = result.queryFlowNm;
					store['shareYn'] = result.shareYn;
					store['shareStfNo'] = result.shareStfNo;
					this._store.shareBasicDefault(store);
	
					this._service.saveQuery(this._store.store).subscribe();
				}
			}, (reason) => {
				this.closeResult = `Dismissed ${reason}`;
			});
		} else {
			alert('설정된 조건이 없어 쿼리를 저장할 수 없습니다.');
		}
	}
	// New Query
	newQuery(): void {
		const path = this._router.url;
		console.log(this._store.store.basicStore);
		if (this._store.store.basicStore.select) {
			this._workflow.resetStore('reset');
		} else {
			this._store.resetStore('reset');
		}
	}

	// Upload Patients
	uploadPatients(): void {
		const setBasic: any = {
			hspTpCd: null,
			lclTpCd: 'L1',
			rschRprvId: 'CRI',
			gender: 'A',
			ageTpCd: 'Y',
			age1: null,
			age2: null,
			pactTpCd: 'A',
			ptBrdyDtSt: null,
			ptBrdyDtEd: null,
			stfNo: sessionStorage.getItem('stfNo'),
			irbNo: '',
			irbMethod: '4'
		};
		this._store.setStore = {
			'basicStore': setBasic
		}
		this._store.shareStore();

		const modalRef = this._modalService.open(UploadPatientsModal, {
			size: 'lg'
		});
		modalRef.componentInstance.data = 'basicmode';
		modalRef.result.then((result) => {
			if (result && result !== 'no') {
				const store = this._store.store;

				store.basicStore['uploadYn'] = 'Y';
				store.basicStore.select = 'upload';
				store.basicStore.condition = 'and';
				
				this._store.setStore = store;
				this._store.shareStore();
				
				this._router.navigateByUrl('/tempAuth.do/basicmode/result/interim/patient', { skipLocationChange: true });
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}

	help(): void {
		const win = window;
		win.open(this.appurl + 'help.do', 'Bestcare Help', 'width=1200, height=960, location=no, menubar=no, status=no, toolbar=no');
	}

	goToHome() {
		if (this._store.store.basicStore.select) {
			this._workflow.resetStore('home');
		} else {
			this._store.resetStore('home');
		}
	}
}
