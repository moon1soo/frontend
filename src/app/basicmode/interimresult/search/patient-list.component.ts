import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { DxDataGridModule, DxLoadPanelModule, DxDataGridComponent } from 'devextreme-angular';
import { Router } from '@angular/router';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { DashboardState } from '../../dashboard.state';
import { StoreService } from '../../store/store.service';
import { DashboardFunc } from '../../dashboard.func';
import { AppState } from '../../../app.state';

import { ResultService } from '../interim-result.service';
import * as Model from '../interim.model';


@Component({
	selector: 'patient-list',
	templateUrl: './patient-list.component.html'
})

export class PatientInterimComponent implements OnInit {
	@ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

	dataSource: Model.PatinetInterim[] = [];
	totalCount: string;
	loading: boolean;
    
	seqCode: string = 'patient';
	
	isCreateFinish: boolean = false;

	selectedRowsData: any;
	
	mdPtNo: string = '';
	mdStfNo: string = '';
	mdCaller: string = '';
	mdLink: string = '';

	onMasking: boolean = true;	

	clickTimer: any;
	lastRowCLickedId: any;	

	isExecuted: boolean = false;

	currentPage = 1;
	maxPage: number;

	scrollTop: number = 0;
	selection: string = 'none';

	private onLazy = new Subject<any>();
	onLazy$ = this.onLazy.asObservable();

	constructor(
		private _fb: FormBuilder,
		private _state: DashboardState,
		private _store: StoreService,
		private _service: ResultService,
		private _router: Router,
		private _func: DashboardFunc,
		private _app: AppState
	) {	
		this.onRowClick = this.onRowClick.bind(this);
	}
	ngOnInit() {
		const urlSql = this._state.sqlViewer;
		const seq = this.seqCode.toUpperCase();

		this._service.setSeq(this.seqCode);

		setTimeout(() => {this.loading = true;}, 100);

		this._service.getSQLResult(urlSql[this.seqCode]).subscribe(res => {
			this._service.setSql(res[`${seq}_InterimResult_SQL`]);
		});
		
		this.loadData();
		this._service.except$.subscribe(res => {
			setTimeout(() => {
				this.loadData();
			}, 100);
		});
		this._func.createPatient$.subscribe(res => {
			this.isCreateFinish = res;
		});

		// IRB 적용 후 마스킹 해제
		this._service.onMasking$.subscribe(res => {
			if (res === 'UNCOVER') {
				this.dataSource = []; // Grid 데이터 초기화
				this.currentPage = 1; // 페이지 초기화
				this.loading = true;
				
				this.onLoadData();
			}
		});
		
		// Lazy Load
		this.onLazy$.subscribe(res => {
			this.scrollTop = res;

			if (this.scrollTop > this.currentPage * 1750 && this.maxPage > this.currentPage) {
				this.currentPage = this.currentPage + 1;
				this.onLoadData();
			}
		});
		
	}
	loadData(): void {
		this._service.setSql(null);
		
		this.onLoadData();
		this._func.runQuery$.subscribe(res => {
			if(res) {
				this.onLoadData();
				// this._func.setRunQuery(false);
			}
		});
	}

	ngAfterViewInit() {
	}

	onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
		const count = e.component.totalCount();
		this.totalCount = count;
		// setTimeout(() => {this.loading = true;}, 10);
		this.onScroll(e, this.onLazy);
	}

	// Scroll 동작시 위치 반한
	onScroll(e, onLazy) {
		e.component.getScrollable().on('scroll', function(options) {
			onLazy.next(options.scrollOffset.top);
		});
	}

	// 테이블 더블클릭 이벤트
	onRowClick(event: any) {
		var rows = event.component.getSelectedRowsData();

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

				console.log(this.mdLink);
				window.open(this.mdLink);
			}
		} else {
			this.clickTimer = setTimeout(() => {

			}, 150);
		}
		this.lastRowCLickedId = event.rowIndex;
	}


	onLoadData() {
		const urlGroup = this._state.sqlReader;
		const urlCount = this._state.resultCount;
		const store = this._store.store;
	
		// 중간결과 리스트 불러오기
		this.dataGrid.noDataText = this._app.tableText.load;
		this._service.getQueryResult(urlGroup[this.seqCode] + 'page=' + this.currentPage).subscribe(res => {
			setTimeout(() => { 
				this.loading = false; 
				this.dataGrid.noDataText = this._app.tableText.noData;
			}, 800);

			if (this.dataSource.length > 0) {
				this.dataSource = this.dataSource.concat(res.result_root.resultData);
			} else {
				this.dataSource = res.result_root.resultData;
			}

			this.maxPage = res.result_root.maxPageCount;

			// IRB 적용이 될 경우 각 Row 클릭 가능하도록 변경
			if (this._store.store.basicStore['irbMethod'] !== '4' && this._store.store.basicStore['irbNo'] !== null) {
				this.selection = 'single';
			}
		});
	}
}
