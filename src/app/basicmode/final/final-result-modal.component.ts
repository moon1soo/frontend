import { Component, OnInit, Input, Pipe, PipeTransform, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { StompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';

import { AppService } from 'app/app.service';
import { AppState } from 'app/app.state';
import { HandleError } from '../../modal/handle-error.component';
import { StoreService } from '../store/store.service';
import { FinalResultService } from './final-result.service';
import { DashboardState } from 'app/basicmode/dashboard.state';
import { SqlPreviewModal } from '../../modal/sql-preview-modal.component';
import { ExcelDownloadModal } from '../../modal/excel-download-modal.component';
import { TransposeModal } from '../../modal/transpose-modal.component';
import { IrbApprovalModal } from '../interimresult/irb-approval-modal.component';

import * as Model from '../store/store.model';
import * as moment from 'moment';

declare const $: any;

interface InpGroup {
	categoryCd: string;
	categoryNm: string;
	columnCd: string;
	columnNm: string;
	columnAliasCd: string;
	tableCd: string;
	seq: string;
	[props: string]: any;
}

@Component({
	selector: 'final-result-modal',
    templateUrl: './final-result-modal.component.html',
    providers: [ FinalResultService, StoreService, AppService ]
})
export class FinalResultModal implements OnInit {
	@ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
	@Input() data: any;
	
	config: any;

	isMenuCollapsed: boolean = true;
	closeResult: string;
	loading: boolean = true;

	tableSource: any; //테이블 데이터
	tempSource = [];
	sqlStr: string; //SQL
	totalCount: any; // 데이터 개수
	totalCountComma: any;

	exceptColumn: string[] = ['hspTpCd']; // 화면에 표시하지 않음

	dynamicColumns: {dataField: string; caption: string; cssClass: string;}[] = [];

	getExcelUrl: string = 'getFinalResultExcel.json';
	excelUrl: string;
	exFileName: string;
	exFilePath: string;

    dataSource: any[];	

	jobData: any[] = [];
    monthGroup: any;
	countGroup: any[] = [];

	rate: any;
	left: any;
	
	currentPage = 1;
	maxPage: number;

	scrollTop: number = 0;
	selection: string = 'none';

	activeExcel: boolean = false;
	cellWidth: number = 140;
	gridWidth: number = this.dynamicColumns.length * this.cellWidth;

	mdPtNo: string = '';
	mdStfNo: string = '';
	mdCaller: string = '';
	mdLink: string = '';

	clickTimer: any;
	lastRowCLickedId: any;

	initRun: boolean = false;

	adminYn: boolean = false;
	displayCount = 0;
	displayCountComma: any;
	completeFinal: boolean = false;

	examItems: any[] = [];
	pathItems: any[] = [];
	formItems: any[] = [];
	mdcnItems: any[] = [];

	examTranspose: boolean = false;
	pathTranspose: boolean = false;
	formTranspose: boolean = false;
	mdcnTranspose: boolean = false;

	irbExists: boolean = false;

	irbForm = {
		stfNo: null,
		irbNo: null,
		irbMthd: null,
		itemList: null,
		ptListSql: null,
		irbCount: null,
		ptListCount: null,
	};	
	
	constructor(
		private _modalService: NgbModal,
		private _app: AppState,
		public _activeModal: NgbActiveModal,
        private _service: FinalResultService,
		private _state: DashboardState,
		private _store: StoreService,
		private _stomp: StompService,
		private _detective: ChangeDetectorRef,
		private _translate: TranslateService
	) {
		this.excelUrl = `${this._app.ajaxUrl}excelDownLoad.do`;

		const stfNo = sessionStorage.getItem('stfNo');
		
		if (sessionStorage.getItem('authCd') === 'A' || sessionStorage.getItem('authCd') === 'R') {
			this.adminYn = true;
		} else {
			this.adminYn = false;
		}
	}

	ngOnInit(): void {
		// IRB 적용이 될 경우 각 Row 클릭 가능하도록 변경
		if (this._store.store.basicStore['irbNo'] !== ''
			&& this._store.store.basicStore['irbNo'] !== null) {
			this.irbExists = true;

			if (this._store.store.basicStore['irbMethod'] !== '4') {
				this.selection = 'single';
			}
		} else {
			this.irbExists = false;
		}

		// IRB 적용 후 마스킹 해제
		this._service.onMasking$.subscribe(res => {
			if (res === 'UNCOVER') {
				this.tempSource = []; // Grid 데이터 초기화
				this.currentPage = 1; // 페이지 초기화
				this.loading = true;
				this.irbExists = true;

				if (this.completeFinal) {
					this.activeExcel = true;
				} else {
					this.activeExcel = false;
				}

				if (this._store.store.basicStore['irbMethod'] !== '4') {
					this.selection = 'single';
				}
				
				this.loadData();
			}
		});

		// SQL Viewer
		this._service.getSQLFinalResult().subscribe(res => {
			this.sqlStr = res.FinalResult_SQL;
		});

		// Job 생성
		this._service.getExecuteFinal().subscribe(res => {
			const response = res.json();
			let workIndex;
			const type = response.workExecutionResultVO.workExecutionResultType;
			this.completeFinal = false;
			
			if (type === 'ACTION_SUCCESS') {
				let job = 
				this._stomp.subscribe('/user/' + sessionStorage.getItem('sessionId') + '/work/message')
				.map((message: Message) => {
					return message.body;
				}).subscribe((msg_body) => {
                    const msg = JSON.parse(msg_body);
                    const serverMessage = msg.SERVER_MESSAGE;

					let allData = msg.WORK_LIST;
					
					if (serverMessage === 'ACTIVE') {
						// 현재 실행한 잡의 인덱스를 저장
						if (msg.WORK_HISTORY) {
							const history = Object.getOwnPropertyNames(msg.WORK_HISTORY);
							workIndex = history[history.length - 1];
							this._service.setWorkIndex = history[history.length - 1];
							sessionStorage.setItem('workIndex', history[history.length - 1]);

							// 잡 에러 발생시
							const err = msg.WORK_HISTORY[workIndex].ERROR_LIST;
							if(err && err.length) {
								this.jobError(err[err.length - 1]);
		
							}
						}
						if (allData.length > 0) { // 데이터 유무 체크
							let tskLen = Object.keys(allData[0].taskStatusList).length; // 선택한 항목 갯수 반환
							let tskIdx = null; // 선택한 항목의 인덱스 반환받을 변수 선언
		
							for (let i = 0; i < tskLen; i++) {
								if (allData[0].taskStatusList[i].categoryType === 'finalResult'
										&& allData[0].taskStatusList[i].taskType === 'workTask_finalResult') { // 최종 결과의 인덱스를 반환
									tskIdx = i;
								}
							}
		
							if (tskIdx !== null) {
								this.rate = allData[0].taskStatusList[tskIdx].rate;

								if (this.rate > 55) {
									$('.progress-text').addClass('half');
								}
								
								const time = moment(allData[0].expectedCompletionTime);
								const now = moment();
								const diff = time.diff(now);

								this.left = moment(diff).format('mm:ss');
								
								if (allData[0].taskStatusList[tskIdx].totalCount > 0) {
									this.totalCount = allData[0].taskStatusList[tskIdx].totalCount;
									this.totalCountComma = this.addComma(this.totalCount);

									if (this.initRun === false) {
										this.initRun = true;
										this.loadData();
									}
								}
								if (!this._detective['destroyed']) {
									this._detective.detectChanges();
								}
							}
						}

					} else if (serverMessage === 'DISCONNECT' || serverMessage === 'ALIVE') {
						// Job이 정상적으로 완료되었을 경우 Rate에 100을 할당함
						this.rate = 100;
						this.left = '00:00';

						this._service.getCountFinalResult().subscribe(res => {
							this.totalCount = res.result_root.interimResultCount.resultCount;
							this.totalCountComma = this.addComma(this.totalCount);

							if (!this._detective['destroyed']) {
								this._detective.detectChanges();
							}
						})

						// 완료 Flag 생성
						this.completeFinal = true;

						if (this.irbExists) {
							this.activeExcel = true;
						} else {
							this.activeExcel = false;
						}
						
						if (this.initRun === false) {
							this.loadData();
						}

						if (!this._detective['destroyed']) {
							this._detective.detectChanges();
						}
						job.unsubscribe();
					}
				});
			}
		});
	}
	onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
	}

	// 잡 에러 모달 실행
    jobError(msg: string): void {       
        this._service.cancelJob().subscribe(res => {
            const modalRef = this._modalService.open(HandleError);
            modalRef.componentInstance.data = msg;
        });
    }

    customizeTooltip = (args: any) => {
        return {
            html: "<strong>" + args.argument + "</strong> : " + args.value
        };
	}

	// 테이블 크기 설정
	tableResize(): void {
		const tbl = document.querySelector('.resultGrid') as HTMLElement;
		tbl.style.height = window.innerHeight - 280 + 'px';
	}
	toggelMenu(): void {
		this.isMenuCollapsed = !this.isMenuCollapsed;
	}
	// 데이터 로드
	loadData(): void {
		const urlGroup = this._state.sqlReader;
		this.dataGrid.noDataText = this._app.tableText.load;

		if ((typeof this.totalCount !== 'undefined' && this.totalCount > this.displayCount)
			|| (this.completeFinal === true && typeof this.totalCount === 'undefined') ) {
			this._service.getQueryFinalResult(urlGroup['final']  + 'page=' + this.currentPage).subscribe(res => {			
				this.maxPage = res.result_root.maxPageCount;

				if (this.completeFinal === true && typeof this.totalCount === 'undefined') {
					this.totalCount = res.result_root.totalCount;
					this.totalCountComma = this.addComma(this.totalCount);
				}
			
				if (this.maxPage > this.currentPage) {
					this.currentPage = this.currentPage + 1;
				}
					
				setTimeout(() => {
					this.loading = false; 
					this.dataGrid.noDataText = this._app.tableText.noData;
				}, 800);
			
				if (this.tempSource.length > 99) {
					this.tempSource = this.tempSource.concat(res.result_root.resultData);
				} else {
					this.tempSource = res.result_root.resultData;
				}
			
				this.displayCount = this.tempSource.length;
				this.displayCountComma = this.addComma(this.displayCount);
			
				this.dxDatatable(this.tempSource);
			
				if (!this._detective['destroyed']) {
					this._detective.detectChanges();
				}
			});
		}
	}
	// 데이터 테이블 구성
	dxDatatable(res: any): void {
		this.tableSource = res;
		this.dynamicColumns = [];

		if (res.length > 0) {
			for(let column of Object.getOwnPropertyNames(res[0])) {
				if(!~this.exceptColumn.indexOf(column)) {
					let caption;
					let style;
					const col = column.split('_');
					if(col[1] !== 'basic') {
						for(let data of this.data.itemList) {
							if(data.ctgCd === col[1] && data.itemCd === col[2]) {
								caption = data.itemNm;
								style = 'dynamicAdd';

								// 검사 선택 항목을 배열에 저장
								if (data.ctgCd === 'exam') {
									this.examItems.push(data.itemCd);
								}
								// 병리 선택 항목을 배열에 저장
								if (data.ctgCd === 'pathology') {
									this.pathItems.push(data.itemCd);
								}
								// 서식 선택 항목을 배열에 저장
								if (data.ctgCd === 'form') {
									this.formItems.push(data.itemCd);
								}
								// 약품 선택 항목을 배열에 저장
								if (data.ctgCd === 'medicine') {
									this.mdcnItems.push(data.itemCd);
								}
							}
						}
					} else {
						style = 'normal';
						switch (col[2]) {
							case 'ptNo': caption = this._translate.instant('research.patient.no'); break;
							case 'pactId': caption = this._translate.instant('research.admin.receive.id'); break;
							case 'ptNm': caption = this._translate.instant('research.patient.name'); break;
							case 'sexTpCd': caption = this._translate.instant('research.gender'); break;
							case 'ptBrdyDt': caption = this._translate.instant('research.date.of.birth'); break;
							default: caption = col[2];
						}
					}
					
					if (column !== '1310_nursEav_nrVocEntAtrItemNm') {
						this.dynamicColumns.push({
							dataField: column, caption: caption, cssClass: style
						});
					}
					
					this.gridWidth = this.dynamicColumns.length * this.cellWidth;

					// const button = document.getElementById('showMore');
					// button.style.width = String(this.gridWidth) + 'px';
				}
			}

			// 검사 Transpose 가능 여부
			if (this.examItems.length > 0) {
				if (this.examItems.indexOf('implDtm') > -1
				&& this.examItems.indexOf('mdfmCpemNm') > -1
				&& this.examItems.indexOf('exrsCnte') > -1) {
					this.examTranspose = true;
				} else {
					this.examTranspose = false;
				}
			}

			// 병리 Transpose 가능 여부
			if (this.pathItems.length > 0) {
				if (this.pathItems.indexOf('implDtm') > -1
				&& this.pathItems.indexOf('plrtLdatKey') > -1
				&& this.pathItems.indexOf('plrtLdatVal') > -1) {
					this.pathTranspose = true;
				} else {
					this.pathTranspose = false;
				}
			}
			
			// 서식 Transpose 가능 여부
			if (this.formItems.length > 0) {
				if (this.formItems.indexOf('recDt') > -1
				&& this.formItems.indexOf('mdfmCpemNm') > -1
				&& this.formItems.indexOf('mdfmCpemCnte') > -1) {
					this.formTranspose = true;
				} else {
					this.formTranspose = false;
				}
			}
			
			// 약품 Transpose 가능 여부
			if (this.mdcnItems.length > 0) {
				if (this.mdcnItems.indexOf('engMdprNm') > -1
					&& this.mdcnItems.indexOf('ordDt') > -1) {
					this.mdcnTranspose = true;
				} else {
					this.mdcnTranspose = false;
				}
			}			

		} 
	}
	// SQLViewer 모달 열기
	sqlViewer() {
		const modalRef = this._modalService.open(SqlPreviewModal, {
			size: 'lg', backdrop: 'static'
		});
		modalRef.componentInstance.data = this.sqlStr;
		modalRef.result.then((result) => {
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}
	// excel 다운로드
	excelDownload(): void {
		const elem = document.getElementById('btn-submit-excel-final');
		setTimeout(() => {
			let event = document.createEvent('Event');
			event.initEvent('click', true, true);
			elem.dispatchEvent(event);
		}, 10);
	}

	// 엑셀 다운로드 Modal 열기
	excelDownModal() {
		const modalRef = this._modalService.open(ExcelDownloadModal, {
			size: 'lg',
			backdrop: 'static'
		});
		modalRef.componentInstance.data = {seq: 'finalResult', mode: 'basicmode', sql: this.sqlStr};
		modalRef.result.then((result) => {
			if (result.path && result.name) {

				this.exFilePath = result.path;
				this.exFileName = result.name;

				this.excelDownload();
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}
	
	// 카운트에 Comma 붙이기
	addComma(nm) {
		return nm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	// 테이블 더블클릭 이벤트
	onRowClick(event: any) {
		var rows = event.component.getSelectedRowsData();
		this.mdPtNo = rows['0']['0002_basic_ptNo'];
	
		if (this.clickTimer && this.lastRowCLickedId === event.rowIndex) {
			clearTimeout(this.clickTimer);
			this.clickTimer = null;
			this.lastRowCLickedId = event.rowIndex;
	
			if (this.mdPtNo !== '********') {
				this.mdStfNo = sessionStorage.getItem('stfNo');
				this.mdCaller = 'CDW';
				this.mdLink = '';
	
				this.mdStfNo = btoa(this.mdStfNo);
				this.mdPtNo = btoa(this.mdPtNo);
				this.mdCaller = btoa(this.mdCaller);
				this.mdLink = 'http://hisweb.snuh.org/webservice/XBAP/app.publish/'
					+ 'HIS.Core.XBAP.xbap?MENU_CD=RFJfSElTLk1DLkRSLlJNLlJWLlVJXy9TZWxlY3RJbnRlZ3JhdGlvbk1lZGljYWxSZWNvcmRBc2sueGFtbA=='
					+ '&STF_NO=' + this.mdStfNo + '&PT_NO=' + this.mdPtNo + '&CALLER=' + this.mdCaller;
				window.open(this.mdLink);
			}
		} else {
			this.clickTimer = setTimeout(() => {
	
			}, 150);
		}
		this.lastRowCLickedId = event.rowIndex;
	}

	openModal(param: any): void {
		const modalRef = this._modalService.open(TransposeModal, {
			size: 'lg',
			windowClass: 'large-modal'
		});
		modalRef.componentInstance.data = {
			data: this.data.data,
			itemList: this.data.itemList,
			seq: 'basicmode'
		}
		modalRef.componentInstance.item = param;
		modalRef.componentInstance.sql = this.sqlStr;
		modalRef.result.then((result) => {
			
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
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
}
