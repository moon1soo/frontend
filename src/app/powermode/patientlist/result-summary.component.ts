import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxLoadPanelModule, DxDataGridComponent } from 'devextreme-angular';

import { AppState } from '../../app.state';

import { ResultService } from './result.service';

@Component({
 	selector: 'result-summary',
    templateUrl: './result-summary.component.html'
})
export class ResultSummaryComponent implements OnInit {

    loading: boolean = false;
    totalCount: string;
	constructor(
        private _globals: AppState,
        private _service: ResultService
    ) {

    }
    ngOnInit() {
        this.loading = true;
        this._service.ageStoreVo$.subscribe(res => {
            this.loading = false;
        });
    }  
    ngAfterViewInit() {
        this._service.totalCount$.subscribe(res => {
            this.totalCount = res;
            this.loading = false;
        });
    }
   
}