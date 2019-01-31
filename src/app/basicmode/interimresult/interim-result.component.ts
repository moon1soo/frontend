import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import 'rxjs/add/observable/of';
import { TranslateService } from '@ngx-translate/core';

import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from 'app/app.state';
import { ResultService } from './interim-result.service';
import { ExcelDownloadModal } from '../../modal/excel-download-modal.component';
import { SqlPreviewModal } from '../../modal/sql-preview-modal.component';
// import { JobStatusModal } from '../../modal/job-status-modal.component';
import { IrbApprovalModal } from './irb-approval-modal.component';

import * as Model from '../store/store.model';
import * as StoreModel from '../store/store.model';
import { DashboardService } from 'app/basicmode/dashboard.service';
import { DashboardState } from 'app/basicmode/dashboard.state';
import { StoreService } from '../store/store.service';
import { DashboardFunc } from 'app/basicmode/dashboard.func';
import { AppService } from '../../app.service';

declare const $: any;

@Component({
	selector: 'interim-result',
	templateUrl: './interim-result.component.html',
	providers: [ ResultService ]
})
export class InterimResultComponent implements OnInit {
	@ViewChild('accInterim') accInterim: any;
	@ViewChild('excelDownForm') excelDownForm: any;

	activeId: string[] = [];

	closeResult: string;
	selectGroup: string[] = [];
	itemGroup: string[] = [];
	store: any;
	sqlStr: string;
	totalCount: any[] = [];
	seqCode: string = 'patient';
	initPatient: string;
	
	excelUrl: string;
	exFileName: string;
	exFilePath: string;
	irbExists: boolean = false;
	activeExcel: boolean = false;

	rate: any;

    jobData: any[] = [];
    monthGroup: any;
	countGroup: any[] = [];
	
	isFinished: boolean = false;
	ageExists: boolean = false;

	irbForm = {
		stfNo: null,
		irbNo: null,
		irbMthd: null,
		itemList: null,
		ptListSql: null,
		irbCount: null,
		ptListCount: null,
	};

	adminYn: boolean = false;

	examResultExists: boolean = false;

	constructor(
		private _fb: FormBuilder,
		private _app: AppState,
		private _state: DashboardState,
		private _router: Router,
		private _translate: TranslateService, 
		private _service: ResultService,
		private _dashboard: DashboardService,
		private _func: DashboardFunc,
		private _modalService: NgbModal,
		private _store: StoreService,
		private _appService: AppService,
		private _detective: ChangeDetectorRef
	) {
		this.excelUrl = `${this._app.ajaxUrl}excelDownLoad.do`;

		const init = this._store.store.basicStore.select.split(',')[0];

		this.initPatient = init;

		const stfNo = sessionStorage.getItem('stfNo');

		const path = sessionStorage.getItem('currentUrl');	
		
		// window.onbeforeunload = function(e) {
		// 	console.log('Im refresher');
		// 	_router.navigateByUrl("/tempAuth.do/basicmode", { skipLocationChange: true });
		// }
		
		if (sessionStorage.getItem('authCd') === 'A' || sessionStorage.getItem('authCd') === 'R') {
			this.adminYn = true;
		} else {
			this.adminYn = false;
		}		

		if (this._store.store.examResultStore) {
			this.examResultExists = true;
		} else {
			this.examResultExists = false;
		}
	}

	ngOnDestroy(): void {
		// this._service.cancelJob().subscribe(res => {
		// 	console.log('Work Destroy');
		// });
	}

	ngOnInit(): void {
		// 언어 변경
		this._translate.use(this._appService.langInfo);
		this._appService.language$.subscribe(res => {
			this._translate.use(res); 
			setTimeout(() => {
				window.location.reload();
			}, 100);
		});

		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-interim').subscribe(res => {
			this._dashboard.setMessage(res);
		});		
		
		// 현재 실행중인 주제영역 확인
		this._service.currentSeq$.subscribe(res => {
			if (this.activeId.indexOf(res) < 0) {
				if (res === 'examResult') {
					this.activeId.push('exam');
					// this.activeId = ['exam'];
				} else {
					this.activeId.push(res);
					// this.activeId = [res];
				}
			}
			// this.accInterim.toggle(res);
		});

		// Progress 완료 여부 확인
		this._service.jobCompleted$.subscribe(res => {
			if (res === true) {
				this.isFinished = true;
				this._func.setCreatePatient(false);
			}
		});

		this.store = this._store.store;
		if(this.store.basicStore.select) {
			this.selectGroup = this.store.basicStore.select.split(',');
			this.itemGroup = this.store.basicStore.select.split(',');
			this.itemGroup.push('patient');

			if (this.selectGroup.includes('upload')) {
				const sidx = this.selectGroup.indexOf('upload');
				const iidx = this.itemGroup.indexOf('upload');
				this.selectGroup.splice(sidx, 1);
				this.itemGroup.splice(iidx, 1);

				if (this._service.setData['patient'] === false) {
					// 중간 결과 환자명단 성별/나이대별 데이터 및 카운트 불러오기
					this._service.getCountResult(this._state.resultCount['patient']).subscribe(res => {
						// 카운트 불러오기
						this._service.setTotalCount(res.result_root.interimResultCount, 'patient');

						// 성별/나이대별 데이터 불러오기
						let jsonData = res.result_root.patientsResultCountByAge;
						let arrData = Object.keys(jsonData).map(function(k) {
							return jsonData[k];
						});

						this._service.setCountByAge(arrData);
					});

					this._service.setData['patient'] = true;
				}

				this.isFinished = true;
				this._func.setCreatePatient(false);
			} else {
				// this.executeJob();
				// this._service.getWorkProgress();
			}
		}

		// this._store.storeVo$.subscribe(res => {
		// 	if (this._store.store.basicStore.select) {
		// 		this.initPatient = this._store.store.basicStore.select.split(',')[0];
		// 	}
		// });
		
		// // 검사결과 탭 추가
		// if(this.store.examResultStore) {
		// 	const sidx = this.selectGroup.indexOf('exam');
		// 	const iidx = this.itemGroup.indexOf('exam');

		// 	if (sidx > -1) {
		// 		this.selectGroup.splice(sidx, 1, 'examResult');
		// 	}
		// 	if (iidx > -1) {
		// 		this.itemGroup.splice(iidx, 1, 'examResult');
		// 	}
		// }

		// 엑셀 다운로드 활성화
		if (this.store.basicStore.irbNo !== null
			&& this.store.basicStore.irbNo !== '') {
				this.activeExcel = true;
		} else {
			this.activeExcel = false;
		};

		// sql데이터 가져오기
		this._service.sql$.subscribe(res => {
			this.sqlStr = res;
		});
		// //  활성화 탭 정보 가져오기
		this._service.seqCode$.subscribe(res => {
			this.seqCode = res;
		});
		// setTimeout(() => {
		// 	this._service.setOnMasking('UNCOVER');
		// }, 3000);
		
		// 제외조건 가져오기
		this._store.exceptCon$.subscribe(res => {
			this.selectGroup = res.select;
			this._service.setExcept(res);

			// 환자명단 호출
			this._router.navigateByUrl("/tempAuth.do/basicmode/result/interim/patient", { skipLocationChange: true });
		});
		
		setTimeout(() => {
			const scroll = document.querySelectorAll('.container-inp');
			const tab = (document.querySelector('.tab-grid') as HTMLElement);
			Array.from(scroll).forEach(obj => {
				(obj as HTMLElement).style.height = (tab.offsetHeight - 80) +'px';
			});
		}, 10);

		this._service.ageStoreVo$.subscribe(res => {
			this.ageExists = true;
			if (!this._detective['destroyed']) {
                this._detective.detectChanges();
            }
		});
	}

	ngAfterViewInit() {
		// 테이블 건수 가져오기
		this._service.totalCount$.subscribe(res => {
			console.log('totalCount', this.totalCount);
			const count = [];
			for(let title of this.totalCount) {
				if(!~count.indexOf(title.title)) {
					count.push(title.title);
				}
			}
			for(let item of Object.keys(res)) {
				if(!~count.indexOf(item)) {
					this.totalCount.push(res[item]);
				}
			}
			this.totalCount.sort((a, b) => {
				if(a.index < b.index) {
					return -1;
				}
				if(a.index > b.index) {
					return 1;
				}
			});
		});
	}
	// 아코디언 메뉴 변경
	beforeChange(event: NgbPanelChangeEvent) {
	}

	// IRB Approvals 열기
	irbApprovals() {
		const modalRef = this._modalService.open(IrbApprovalModal, {
			size: 'lg'
		});

		this._service.getSQLResult(this._state.sqlViewer['patient']).subscribe(res => {
			this.irbForm.ptListSql = res.PATIENT_InterimResult_SQL;
		});

		this._service.getCountResult(this._state.resultCount['patient']).subscribe(res => {
			this.irbForm.ptListCount = res.result_root.interimResultCount.patientsCount;
		});

		modalRef.result.then((result) => {
			if (result !== 'cancel') {
				this._store.setStore = result;
				this._store.shareStore();
				this.activeExcel = true;
				
				if (this._store.store.basicStore['irbMethod'] !== '4') {
					this._service.setOnMasking('UNCOVER');
				}
	
				this.irbForm.stfNo = this._store.store.basicStore.stfNo;
				this.irbForm.irbNo = this._store.store.basicStore.irbNo;
				this.irbForm.irbMthd = this._store.store.basicStore.irbMethod;
				this.irbForm.irbCount = this._store.store.basicStore.ptCnt;
				this.irbForm.itemList = this._store.store.basicStore.select;
	
				this._service.setIRBLog(this.irbForm).subscribe();
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}

	// sql viewer 열기
	sqlViewer() {
		const modalRef = this._modalService.open(SqlPreviewModal, {
			size: 'lg'
		});
		modalRef.componentInstance.data = this.sqlStr;
		modalRef.result.then((result) => {
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}
	// excel 다운로드
	excelDownload(): void {
		const url = this._state.createExcel[this.seqCode];
		const elem = document.getElementById('btn-submit-excel');
		// this._service.createExcel(url).subscribe(res => {
		// 	if(res) {
				setTimeout(() => {
					let event = document.createEvent('Event');
					event.initEvent('click', true, true);
					elem.dispatchEvent(event);
				}, 10);
		// 	}
		// });
	}

	// 엑셀 다운로드 Modal 열기
	excelDownModal() {
		const modalRef = this._modalService.open(ExcelDownloadModal, {
			size: 'lg',
			backdrop: 'static'
		});

		if (this.seqCode === 'patient') {
			modalRef.componentInstance.data = {seq: 'ptInfo', mode: 'basicmode', sql: this.sqlStr};
		} else {
			modalRef.componentInstance.data = {seq: this.seqCode, mode: 'basicmode', sql: this.sqlStr};
		}
		modalRef.result.then((result) => {
			console.log('Result', result);
			if (result.path && result.name) {

				this.exFilePath = result.path;
				this.exFileName = result.name;

				this.excelDownload();
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}

	executeJob() {
		this._service.getExecute().subscribe();
	}
}

