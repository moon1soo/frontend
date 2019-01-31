import { Component, OnInit, OnDestroy, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DxLoadPanelModule, DxDataGridComponent, DxProgressBarModule } from 'devextreme-angular';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { StompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';

import { AppState } from 'app/app.state';
import { HandleError } from '../../modal/handle-error.component';
import { PowermodeStoreService } from '../store/store.service';
import { FinalResultService } from './final-result.service';
import { SqlPreviewModal } from '../../modal/sql-preview-modal.component';
import { AppService } from '../../app.service';
import { DiagramState } from '../diagram.state';
import { DiagramService } from '../diagram.service';
import { ItemListState } from '../../item-list.state';

import { ResultService } from '../patientlist/result.service';
import { ExcelDownloadModal } from '../../modal/excel-download-modal.component';
import { PatientListComponent } from '../patientlist/patient-list.component';
import { TransposeModal } from '../../modal/transpose-modal.component';

import * as Model from '../store/store.model';
import * as moment from 'moment';

@Component({
	selector: 'final-result',
	templateUrl: './final-result.component.html',
	providers: [ FinalResultService, PatientListComponent ]
})
export class FinalResult implements OnInit, OnDestroy  {
	// @Input() data: {data: any; itemList: any; url: any; index: number; activeExcel: boolean; }
	@ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
	@Input('itemList') itemList: {dataSource: any; categoryGroup: string[]};

	data: {data: any; url: any; index: number; activeExcel: boolean; };

	isMenuCollapsed: boolean = true;
	closeResult: string;
	loading: boolean = false;
	
	stfNo: any;
	excelUrl: any;

	tableSource: any; //테이블 데이터
	sqlStr: string; //SQL
	displayCount: number = 0;
	totalCount: number; // 데이터 개수
	totalCountStr: string;
	exceptColumn: string[] = ['hspTpCd']; // 화면에 표시하지 않음
    cellWidth: number = 140;
	dynamicColumns: {caption: string; field: string}[] = [];

    dataSource: any[];	
	columns: {dataField: string; caption: string; cssClass: string; width: number}[] = [];
	
	gridWidth: number = this.columns.length * this.cellWidth;
	progressRate: number = 0;
	progressLeft: any;
	maxValue: number = 100;
	workIndex: string;

	clickTimer: any;
    lastRowCLickedId: any;	

    mdPtNo: string = '';
	mdStfNo: string = '';
	mdCaller: string = '';
	mdLink: string = '';

	exFileName: string;
    exFilePath: string;
	activeExcel: boolean = false;
	isAdmin: boolean = false;

	config: any;

	initRun: boolean = false;
	loadComplete: boolean = true;	
	completeFinal: boolean = false;
	currentPage = 1;
	maxPage: number;
	tempSource = [];

	examItems: any[] = [];
	pathItems: any[] = [];
	formItems: any[] = [];
	mdcnItems: any[] = [];

	examTranspose: boolean = false;
	pathTranspose: boolean = false;
	formTranspose: boolean = false;
	mdcnTranspose: boolean = false;
    
	constructor(
        private _modalService: NgbModal,
        public _activeModal: NgbActiveModal,
		private _app: AppState,
		private _service: FinalResultService,
		private _diagramService: DiagramService,
		private _store: PowermodeStoreService,
		private _translate: TranslateService,
		private _appService: AppService,
		private _state: DiagramState,
		private _patient: PatientListComponent,
		private _detective: ChangeDetectorRef
	) {
		this.excelUrl = `${this._app.ajaxUrl}excelDownLoad.do`;
    }
	ngOnInit(): void {
		const store = this._store.store;
		const authCd = sessionStorage.getItem('authCd');

		if(this._appService.staffInfo) {
            this.stfNo = this._appService.staffInfo.number;
        } else {
            this.stfNo = sessionStorage.getItem('stfNo');
		}

		this._diagramService.setStateWork({mode: 'final'});

		if(authCd.startsWith('A') || authCd.startsWith('R')) {
            this.isAdmin = true;
        }
		this.loading = true;

		const appUrl: any =  {
            ajaxUrl: this._app.ajaxUrl,
            socketUrl: this._app.socketUrl
		}		
		
		this._diagramService.isUserEditing$.subscribe(res => {
			if(res) {
				this._service.cancelJob();
			}
		});	

		this.data = {
			data: this._store.store, 
			url: appUrl,
			index: this._patient.getWorkIndex.workIndex,
			activeExcel: this._patient.getWorkIndex.isIrb
		};
		this._service.finalExcute(store, sessionStorage.getItem('workIndex'), this.data.url.ajaxUrl).subscribe(res => {
			this._diagramService.setStateWork({mode: 'finalRun'});
			// this.dxDatatable(res.FinalResult_List);
			// setTimeout(() => { this.loading = false; }, 300);
		});
		// SQL Viewer
		this._service.getSQLFinalResult(this.data.data, this.data.url.ajaxUrl).subscribe(res => {
			this.sqlStr = res.FinalResult_SQL;
		});	
				
		// 소켓데이터 구독 
        this._service.socketData$.subscribe(res => {
            if(res) {
				console.log('파이널 소켓데이터 수신',res);
				
				const serverMessage = res.SERVER_MESSAGE;
				let allData = res.WORK_LIST;
				// const workIndex = res.WORKINDEX_HISTORY[res.WORKINDEX_HISTORY.length - 1];
				// this.workIndex = workIndex;
				
				if (serverMessage === 'ACTIVE') {
					// this._diagramService.setStateWork({mode: 'run'});
					// 현재 실행한 잡의 인덱스를 저장
					if (res.WORK_HISTORY) {
						const history = Object.getOwnPropertyNames(res.WORK_HISTORY);
						this.workIndex = history[history.length - 1];
						this._service.setWorkIndex = history[history.length - 1];
						sessionStorage.setItem('workIndex', history[history.length - 1]);
	
						// 잡 에러 발생시
						const err = res.WORK_HISTORY[this.workIndex].ERROR_LIST;
						if(err && err.length) {
							this.jobError(err[err.length - 1]);	
						}
					}
					setTimeout(() => { 
						this.loading = false; 
						this.dataGrid.noDataText = this._app.tableText.noData;
					}, 800);
					if(allData.length) {
						this.requestPtInfo({allData: allData, index: this.workIndex, page: 1});
					}
				} else if (serverMessage === 'ALIVE') {
					// this._diagramService.setStateWork({mode: 'final'});
					this.finishSocket(this.workIndex);
				}            
            }
		});

		// IRB 적용 후 마스킹 해제
		this._diagramService.onMasking$.subscribe(res => {
			if (res === 'UNCOVER') {
				this.tempSource = []; // Grid 데이터 초기화
				// this.tableSource = []; 
				this.currentPage = 1; // 페이지 초기화
                this.loading = true;
                this.activeExcel = true;
				this.loadData(this.workIndex);
			}
		});
		
		setTimeout(() => { 
			this.tableResize(); 
		}, 10);
	}
	ngOnDestroy() {
		this._detective.detach(); // try this
		// for me I was detect changes inside "subscribe" so was enough for me to just unsubscribe;
		// this.authObserver.unsubscribe();
	  }

	// 테이블 리사이즈
    tableResize(): void {
        const table = document.getElementById('power-final-result');
		const doc = document.querySelector('.container-fluid');
        
        table.style.height = ((doc as HTMLElement).offsetHeight - 175)+'px';
	}  
	
	requestPtInfo({allData, index, page}: {allData: any, index: string, page: number}) {	
        let tskLen = allData[0].taskStatusList.length; // 선택한 항목 갯수 반환
		let tskIdx = null; // 선택한 항목의 인덱스 반환받을 변수 선언
		const countUrl = `${this.data.url.ajaxUrl}${this._state.sqlReader.finalCount}?workIndex=${index}`;
		for(let i = 0; i < tskLen; i++) {
			if (allData[0].taskStatusList[i].categoryType === 'finalResult'
					&& allData[0].taskStatusList[i].taskType === 'workTask_finalResult') { // 최종 결과의 인덱스를 반환
				tskIdx = i;
			}
		}
		
		if (tskIdx !== null) {
			if (allData[0].taskStatusList[tskIdx].totalCount) {
				this.totalCount = allData[0].taskStatusList[tskIdx].totalCount;
				this._service.getCountFinalResult(countUrl).subscribe(res => {
					if(res && res.errorCode === 'success') {
						// console.log(res);
						this.totalCount = res.interimResultCount.resultCount;
						this.totalCountStr = res.interimResultCount.resultCount.toLocaleString();
					}
					setTimeout(() => { 
						this.loading = false; 
						this.dataGrid.noDataText = this._app.tableText.noData;
					}, 800);
				});
			}
			this.progressRate = allData[0].taskStatusList[tskIdx].rate;

			if (this.progressRate > 55) {
				$('.progress-text').addClass('half');
			}

			const time = moment(allData[0].expectedCompletionTime);
			const now = moment();
			const diff = time.diff(now);

			this.progressLeft = moment(diff).format('mm:ss');

			this._detective.detectChanges();

			if (allData[0].taskStatusList[tskIdx].totalCount > 0 && this.initRun === false) {
				this.initRun = true;
				console.log('최종결과 호출');
				this.loadData(index);
				this._detective.detectChanges();
			}
			console.log('totalCount', typeof this.totalCount !== 'undefined');
			console.log('displayCount', typeof this.displayCount !== 'undefined');
			console.log('Compare', this.totalCount === this.displayCount);

			if (this.totalCount	&& this.displayCount && this.totalCount === this.displayCount) {
				this.loadComplete = true;
				
			} else {
				this.loadComplete = false;
			}
		}
	}
	 // 잡 에러 모달 실행
	 jobError(msg: string): void {       
        this._service.cancelJob().subscribe(res => {
            const modalRef = this._modalService.open(HandleError);
            modalRef.componentInstance.data = msg;
        });
	}
	
	finishSocket(index: string): void {
		this._diagramService.setStateWork({mode: 'final'});
		// Job이 정상적으로 완료되었을 경우 Rate에 100을 할당함
		this.progressRate = 100;
		this.progressLeft = '00:00';
		console.log('잡 생성 완료');
						
		if (this.initRun === false) {
			this.initRun = true;
			this.loadData(index);
		}
		this._detective.detectChanges();
		// job.unsubscribe();

		// 엑셀 다운로드 활성화
		if (this._store.store.basicStore.irbNo !== null
			&& this._store.store.basicStore.irbNo !== '') {
				this.activeExcel = true;
		} else {
			this.activeExcel = false;
		};

		this.completeFinal = true;
		this._detective.detectChanges();
	}
	
	onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
	}
    customizeTooltip = (args: any) => {
        return {
            html: "<strong>" + args.argument + "</strong> : " + args.value
        };
	}

	toggelMenu(): void {
		this.isMenuCollapsed = !this.isMenuCollapsed;
	}
	
	// 데이터 로드
	loadData(index: string): void {
		let workIndex;
		if(index) {
			workIndex = index;
		} else {
			workIndex = this.workIndex ? this.workIndex : sessionStorage.getItem('workIndex');
		}
		// 소켓 요청		
		if ((typeof this.totalCount !== 'undefined' && this.totalCount > this.displayCount)
			|| (this.completeFinal && typeof this.totalCount === 'undefined') ) {

			const url = `${this.data.url.ajaxUrl}${this._state.sqlReader.finalQuery}?workIndex=${workIndex}&page=${this.currentPage}`;
			this._service.getQueryFinalResult(url).subscribe(res => {
				if(res.result_root) {
					this.maxPage = res.result_root.maxPageCount;					

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
		
					this.dxDatatable(this.tempSource);
		
					this._detective.detectChanges();
				}
			});
		}	
	}
	// 데이터 테이블 구성
	dxDatatable(res: any): void {
		this.tableSource = res;

		this.columns = [];
		if(res.length) {
			for(let column of Object.getOwnPropertyNames(res[0])) {
				if(!~this.exceptColumn.indexOf(column)) {
					let caption;
					let style;
					const col = column.split('_');
					if(col[1] !== 'basic') {
						for(let data of this.itemList.dataSource) {
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
						switch(col[2]) {
							case 'ptNo': caption = this._translate.instant('research.patient.no'); break;
							case 'pactId': caption = this._translate.instant('research.admin.receive.id'); break;
							case 'ptNm': caption = this._translate.instant('research.patient.name'); break;
							case 'sexTpCd': caption = this._translate.instant('research.gender'); break;
							case 'ptBrdyDt': caption = this._translate.instant('research.date.of.birth'); break;
							default: caption = col[2];
						}
					}
					this.columns.push({
						dataField: column, caption: caption, cssClass: style, width: this.cellWidth
					});
					this.gridWidth = this.columns.length * this.cellWidth;
				}
			}

			// 검사 Transpose 가능 여부
			if (this.examItems.length) {
				if (~this.examItems.indexOf('implDtm')
				&& ~this.examItems.indexOf('mdfmCpemNm')
				&& ~this.examItems.indexOf('exrsCnte')) {
					this.examTranspose = true;
				} else {
					this.examTranspose = false;
				}
			}

			// 병리 Transpose 가능 여부
			if (this.pathItems.length) {
				if (~this.pathItems.indexOf('implDtm')
				&& ~this.pathItems.indexOf('plrtLdatKey')
				&& ~this.pathItems.indexOf('plrtLdatVal')) {
					this.pathTranspose = true;
				} else {
					this.pathTranspose = false;
				}
			}
			
			// 서식 Transpose 가능 여부
			if (this.formItems.length) {
				if (~this.formItems.indexOf('recDt')
				&& ~this.formItems.indexOf('mdfmCpemNm')
				&& ~this.formItems.indexOf('mdfmCpemCnte')) {
					this.formTranspose = true;
				} else {
					this.formTranspose = false;
				}
			}
			
			// 약품 Transpose 가능 여부
			if (this.mdcnItems.length) {
				if (~this.mdcnItems.indexOf('engMdprNm')
					&& ~this.mdcnItems.indexOf('ordDt')) {
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
			size: 'lg', 
			backdrop: false
		});
		modalRef.componentInstance.data = this.sqlStr;
		modalRef.result.then((result) => {
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}	

	// excel 다운로드
	excelDownload(): void {
		const elem = document.getElementById('btn-submit-powermode-final-excel');
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

		modalRef.componentInstance.data = {seq: 'finalResult', mode: 'powermode', sql: this.sqlStr, workIndex: this.workIndex};
		modalRef.result.then((result) => {
			// console.log('Result', result);
			if (result.path && result.name) {

				this.exFilePath = result.path;
				this.exFileName = result.name;

				this.excelDownload();
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}

	 // 테이블 더블클릭 이벤트
	onRowClick(event: any) {
		if(this.activeExcel) {
			let rows = event.component.getSelectedRowsData();

			if (this.clickTimer && this.lastRowCLickedId === event.rowIndex) {
				clearTimeout(this.clickTimer);
				this.clickTimer = null;
				this.lastRowCLickedId = event.rowIndex;
	
				if (rows.length > 0) {
					this.mdStfNo = sessionStorage.getItem('stfNo');
					this.mdPtNo = rows['0']['ptNo'];
					this.mdCaller = 'CDW';
					this.mdLink = '';
	
					this.mdStfNo = btoa(this.mdStfNo);
					this.mdPtNo = btoa(this.mdPtNo);
					this.mdCaller = btoa(this.mdCaller);
					this.mdLink = 'http://hisweb.snuh.org/webservice/XBAP/app.publish/'
					+ 'HIS.Core.XBAP.xbap?MENU_CD=RFJfSElTLk1DLkRSLlJNLlJWLlVJXy9TZWxlY3RJbnRlZ3JhdGlvbk1lZGljYWxSZWNvcmRBc2sueGFtbA=='
					+ '&STF_NO=' + this.mdStfNo + '&PT_NO=' + this.mdPtNo + '&CALLER=' + this.mdCaller;
	
					// console.log(this.mdLink);
					window.open(this.mdLink);
				}
			} else {
				this.clickTimer = setTimeout(() => {
	
				}, 150);
			}
			this.lastRowCLickedId = event.rowIndex;
		}		
	}
	// Transpose
	openTranspose(param: any): void {
		const modalRef = this._modalService.open(TransposeModal, {
			size: 'lg',
			windowClass: 'large-modal'
		});
		modalRef.componentInstance.data = {
			data: this._store.store.finalResultStore, 
			itemList: this.itemList.dataSource,  
			seq: 'powermode'
		};
		modalRef.componentInstance.item = param;
		modalRef.componentInstance.sql = this.sqlStr;
		modalRef.result.then((result) => {
			
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}

}
