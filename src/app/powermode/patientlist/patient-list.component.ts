import { Component, OnInit, Output, Input, ViewChild, OnChanges } from '@angular/core';
import { DxLoadPanelModule, DxDataGridComponent, DxProgressBarModule } from 'devextreme-angular';
import { TranslateService } from '@ngx-translate/core';
import notify from 'devextreme/ui/notify';
import { StompService, StompConfig } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { Subject } from 'rxjs/Subject';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { ResultService } from './result.service';
import { DiagramService } from '../diagram.service';
import { PowermodeStoreService } from '../store/store.service';
import { AppService } from '../../app.service';
import { DiagramState } from '../diagram.state';
import { SqlPreviewModal } from '../../modal/sql-preview-modal.component';
import { ExcelDownloadModal } from '../../modal/excel-download-modal.component';

import { IrbApprovalModal } from './irb-approval-modal.component';
import { HandleError } from '../../modal/handle-error.component';

declare const $: any;

interface ColumnModel {
    dataField: string; 
    caption: string; 
    category: string; 
    [props: string]: any;
}

@Component({
 	selector: 'patient-list',
    templateUrl: './patient-list.component.html'
})
export class PatientListComponent implements OnInit, OnChanges {
    @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent
	@Input('itemList') itemList: {dataSource: any; categoryGroup: string[]};
    config: any;
    
    stfNo: any;

    storeVo: any;
    dataSource: any;
    itemCdList: any;
	loading: boolean = false;
	cellWidth: number = 140;
    columns: ColumnModel[] = [
        {dataField: 'ptNo', caption: this._translate.instant('research.patient.no'), category: 'ptInfo', filterType: null},
        {dataField: 'ptNm', caption: this._translate.instant('research.patient.name'), category: 'ptInfo', filterType: null},
        {dataField: 'sexTpCd', caption: this._translate.instant('research.gender'), category: 'ptInfo', filterType: null},
        {dataField: 'ptBrdyDt', caption: this._translate.instant('research.date.of.birth'), category: 'ptInfo', filterType: null}

	];
	
    gridWidth: number = this.columns.length * this.cellWidth;
    progressRate: number = 0;
    maxValue: number = 100;

    currentPage = 1;
    maxPage: number;
    
    clickTimer: any;
    lastRowCLickedId: any;	

    mdPtNo: string = '';
	mdStfNo: string = '';
	mdCaller: string = '';
	mdLink: string = '';

	scrollTop: number = 0;
    selection: string = 'none';
    
    disableSql: boolean = true;
    isAdmin: boolean = false;
    isFinished: boolean = false;
    sqlStr: string;
    closeResult: string;
    workIndex: any;

    excelUrl: any;
    exFileName: string;
    exFilePath: string;
    irbExists: boolean = false;
	activeExcel: boolean = false;
    
    irbForm = {
		stfNo: null,
		irbNo: null,
		irbMthd: null,
		itemList: null,
		ptListSql: null,
		irbCount: null,
		ptListCount: null,
	};

	private onLazy = new Subject<any>();
	onLazy$ = this.onLazy.asObservable();
    
	constructor(
        private _globals: AppState,
        private _store: PowermodeStoreService,
        private _service: ResultService,
        private _diagramService: DiagramService,
        private _translate: TranslateService,
        private _appService: AppService,
        private _app: AppState,
        private _stomp: StompService,
        private _state: DiagramState,
        private _modalService: NgbModal
    ) {
        this.excelUrl = `${this._app.ajaxUrl}excelDownLoad.do`;
    }
    ngOnInit() {
        const store = this._store.store;
        const authCd = sessionStorage.getItem('authCd');

        sessionStorage.setItem('prevLink', 'interim');

        if(this._appService.staffInfo) {
            this.stfNo = this._appService.staffInfo.number;
        } else {
            this.stfNo = sessionStorage.getItem('stfNo');
        }
        // 권한 체크
        if(authCd.startsWith('A') || authCd.startsWith('R')) {
            this.isAdmin = true;
        }
        
        // 언어 변경
		this._translate.use(this._appService.langInfo);
		this._appService.language$.subscribe(res => {
            this._translate.use(res); 
            setTimeout(() => { window.location.reload(); }, 100);
        });
        // sql 호출
        this._service.getSQLResult().subscribe(res => {
            this.disableSql = false;
            this.sqlStr = res;
        });
        // 작업단계 구독
        this._diagramService.stateWork$.subscribe(res => {
            // console.log(res);
            switch(res.mode) {
                case 'output': 
                    setTimeout(() => { 
                        this.tableResize(); 
                    }, 10);
					break;		
			}
        });
        this._service.startQuery$.subscribe(res => {
            if(res) {
                this.loading = true;
                this.tableResize();
            }
        });

        this._service.patientResult$.subscribe(res => {                  
            this.dataSource = res.result_root.resultData;
            if(this.dataSource && !this.dataSource.length) {
                this.dataGrid.noDataText = this._app.tableText.noData;
            }
            setTimeout(() => { 
                $('.patient-list').trigger('click');
                this.loading = false; 
                this.isFinished = true;
				this.saveFilterStore();
			}, 800);
        });

        // 엑셀 다운로드 활성화
		if (store.basicStore.irbNo !== null
			&& store.basicStore.irbNo !== '') {
				this.activeExcel = true;
		} else {
			this.activeExcel = false;
        };
        
        // IRB 적용 후 마스킹 해제
		this._diagramService.onMasking$.subscribe(res => {
			if (res === 'UNCOVER') {
				this.dataSource = []; // Grid 데이터 초기화
				this.currentPage = 1; // 페이지 초기화
                this.loading = true;
                this.activeExcel = true;
				
				this.onLoadData();
			}
		});
        
        // 소켓데이터 구독 
        this._service.patientSocketData$.subscribe(res => {            
            if(res) {
                // let workIndex;
                console.log('환자명단 소켓데이터 수신',res);
                if(res['SERVER_MESSAGE'] === 'ALIVE') {

                    // 현재 실행한 잡의 인덱스를 저장
                    if (res['WORK_HISTORY']) {
                        // const workIndex = work.workIndex;
                        const history = Object.getOwnPropertyNames(res['WORK_HISTORY']);
                        this.workIndex = history[history.length - 1];
                        this._service.setWorkIndex = history[history.length - 1];
                        // this._finalService.setWorkIndex = history[history.length - 1];
                        sessionStorage.setItem('workIndex', history[history.length - 1]);

                        // 잡 에러 발생시
                        const err = res['WORK_HISTORY'][this.workIndex].ERROR_LIST;
                        if(err && err.length) {
                            this.jobError(err[err.length - 1]);

                        }
                    }

                    this._service.getQueryResult(this.workIndex).subscribe(res => {
                        this.dataSource = res.result_root.resultData;
                     
                        if(this.dataSource && !this.dataSource.length) {
                            this.dataGrid.noDataText = this._app.tableText.noData;
                        }
                        setTimeout(() => { 
                            this.loading = false; 
                            // this.disableExcel = false;
                            this.saveFilterStore();
                            this.isFinished = true;
                            this._diagramService.setStateWork({mode: 'patient'});
                        }, 800);
                    });
                    this._service.getCountResult().subscribe(res => {
                        // this.irbForm.ptListCount = res.interimResultCount.patientsCount;
                    });
                }               
            }
        });        
       
        // Lazy Load
		// this.onLazy$.subscribe(res => {
		// 	this.scrollTop = res;

		// 	if (this.scrollTop > this.currentPage * 1750 && this.maxPage > this.currentPage) {
		// 		this.currentPage = this.currentPage + 1;
		// 		this.onLoadData();
		// 	}
        // });      
        
    }
    ngOnChanges(): void {
        this.initTable();
    }
    
	get getWorkIndex() {
		return {workIndex: this.workIndex, isIrb: this.activeExcel};
    }

    // 잡 에러 모달 실행
    jobError(msg: string): void {       
        this._service.cancelJob().subscribe(res => {
            const modalRef = this._modalService.open(HandleError);
            modalRef.componentInstance.data = msg;
        });
    }

    onLoadData() {
		const store = this._store.store;

        // 중간결과 리스트 불러오기
        this.dataGrid.noDataText = this._app.tableText.load;
        this._service.getQueryResult(this.workIndex).subscribe(res => {
            this.dataSource = res.result_root.resultData;
         
            if(this.dataSource && !this.dataSource.length) {
                this.dataGrid.noDataText = this._app.tableText.noData;
                this.dataSource = this.dataSource.concat(res.result_root.resultData);
            } else {
                this.dataSource = res.result_root.resultData;
            }

            // IRB 적용이 될 경우 각 Row 클릭 가능하도록 변경
			if (store.basicStore['irbMethod'] !== '4' && store.basicStore['irbNo'] !== null) {
				this.selection = 'single';
            }
            
            setTimeout(() => { 
                this.loading = false; 
                this.saveFilterStore();
                this.isFinished = true;
                // this._diagramService.setStateWork({mode: 'patient'});
            }, 800);
        });
    }
    // 테이블 리사이즈
    tableResize(): void {
        const table = document.getElementById('power-patient-result');
        const doc = document.querySelector('.patient-list-area');
        
        table.style.height = ((doc as HTMLElement).offsetHeight - 70)+'px';
        this.dataGrid.instance.refresh();
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
    
                    window.open(this.mdLink);
                }
            } else {
                this.clickTimer = setTimeout(() => {
    
                }, 150);
            }
            this.lastRowCLickedId = event.rowIndex;
        }		
	}
 
    // excel 다운로드
	excelDownload(): void {
		const url = this._state.sqlReader.excel;
		const elem = document.getElementById('btn-submit-powermode-excel');
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

		modalRef.componentInstance.data = {seq: 'ptInfo', mode: 'powermode', sql: this.sqlStr, workIndex: this.workIndex};
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
    // 프로그레스 바
    format(value) {
        return `Loading: ${value * 100}%`;
    }
    
	// 필터 스토어 저장
	saveFilterStore(): void {
        const finalStore = this._store.store.finalResultStore;
		let store = {
			category: [],
			item: []
		}
		for(let col of this.columns) {
            store.category.push(col.category);
            if(col.category === 'ptInfo' && ~col.dataField.indexOf('Msk')) {
                store.item.push(col.dataField.replace('Msk', ''));
            } else {
                store.item.push(col.dataField);
            }
        }
        this._service.setColumnList(this.columns);
        if(!finalStore || !(finalStore.item && finalStore.item.length)) {
            this._store.shareFinalStorefilter(store);
        }
	}
    
    // 추가 테이블 리스트
    initTable(): void {
        const store = Object.assign({}, this._store.store);
        const addItemList = this.itemList.dataSource.splice(0);
        const category = store.basicStore.select.split(',');
        let selectGroup = [];
        let selectItem = [];
        this.itemCdList = [];
        for(let sel of category) {
            for(let item of store.groupInfoListStore) {
                if(sel === item.groupId) {
                    for(let key of item.item) {
                        selectItem.push(key);
                    }
                    for(let key of item.category) {
                        selectGroup.push(key);
                    }
                } 
            }
        }
        
        for(let data of addItemList) {
            if(~selectItem.indexOf(data.itemCd) && ~selectGroup.indexOf(data.ctgCd)) {
                this.itemCdList.push(data);
            }
        }
        for(let item of this.itemCdList) {
            this.columns.push({
                dataField: item.itemCd, 
                caption: item.itemNm, 
                category: item.ctgCd, 
                ltUseYn: item.ltUseYn,
                filterType: item.filterType                
            });
            
            this.gridWidth = this.columns.length * this.cellWidth;
        }
        this.dataGrid.noDataText = '';
    }
  
    onContentReady(e): void {
        e.component.option("loadPanel.enabled", false);     
       
        // this.onScroll(e, this.onLazy);
    }

    // Scroll 동작시 위치 반한
	onScroll(e, onLazy) {
		e.component.getScrollable().on('scroll', (options) => {
            // onLazy.next(options.scrollOffset.top);
            const res = options.scrollOffset.top;
            this.scrollTop = res;

			if (this.scrollTop > this.currentPage * 1750 && this.maxPage > this.currentPage) {
				this.currentPage = this.currentPage + 1;
			}
		});
    }
}