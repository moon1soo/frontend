import { Component, OnInit, Input, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { DxDataGridModule, DxLoadPanelModule, DxDataGridComponent } from 'devextreme-angular';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HandleError } from '../../modal/handle-error.component';

import { DiagramService } from '../diagram.service';
import { ResultService } from './result.service';
import { PowermodeStoreService } from '../store/store.service';
import { Router } from '@angular/router';
import { AppState } from '../../app.state';
import { AppService } from '../../app.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

import * as Model from '../model/diagram.model';

@Component({
	selector: 'irb-approval-modal',
    templateUrl: './irb-approval-modal.component.html',
    providers: [
        PowermodeStoreService, ResultService, AppService, DiagramService
    ]
})

export class IrbApprovalModal implements OnInit {
    @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @Input() data: any;

    dataSource: any[] = [];
    selectedRowsData: any;

    loading = true;

    clickTimer: any;
    lastRowCLickedId: any;

    irbNo: string;
    irbMethod: string;
    ptCnt: string;

    irbExists = false;
    testerYn = false;

    adminYn: boolean = false;
    constructor(
        private _http: Http,
        private _modalService: NgbModal,
        private _store: PowermodeStoreService,
        private _service: ResultService,
        private _diagramService: DiagramService,
        private _router: Router,
        public activeModal: NgbActiveModal,
        private _app: AppState
    ) {
		const stfNo = sessionStorage.getItem('stfNo');
		
		if (sessionStorage.getItem('authCd') === 'A' || sessionStorage.getItem('authCd') === 'R') {
			this.adminYn = true;
		} else {
			this.adminYn = false;
        }
        
        if (sessionStorage.getItem('authCd') === 'T') {
            this.testerYn = true;
        } else {
            this.testerYn = false;
        }
    }

    ngOnInit() {
        sessionStorage.setItem('currentUrl', this._router.url);
        this.dataGrid.noDataText = this._app.tableText.load;
        
        this._diagramService.getIRBApprovalList().subscribe(res => {
            this.dataSource = res['IRB_Approval_List'];
            setTimeout(() => { 
				this.loading = false; 
				this.dataGrid.noDataText = this._app.tableText.noData;
			}, 800);
        });
    }

	// 테이블 row 선택 이벤트 
    onSelectionChanged(event) {
        this.selectedRowsData = event.selectedRowsData;
        this.irbNo = this.selectedRowsData['0']['irbNo'];
        this.irbMethod = this.selectedRowsData['0']['irbMethod'];
        this.ptCnt = this.selectedRowsData['0']['ptCnt'];

        if (this.selectedRowsData && this.selectedRowsData.length > 0) {
            this.irbExists = true;
        }
    }

    // IRB 적용
    irbApply() {
        const store = this._store.store;
        
        store.basicStore['irbNo'] = this.irbNo;
        store.basicStore['irbMethod'] = this.irbMethod;
        store.basicStore['ptCnt'] = this.ptCnt;

        this._store.setStore = store;

        this.activeModal.close(store);
    }

    // 개발용 IRB 적용 기능 (임시)
    devOnly() {
        const store = this._store.store;      

        store.basicStore['irbNo'] = '111-1111-111';
        store.basicStore['irbMethod'] = '1';
        store.basicStore['ptCnt'] = '1000';

        this._store.setStore = store;

        this.activeModal.close(store);
    }
}
