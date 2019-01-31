import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { DashboardService } from '../../dashboard.service';
import { RediationRegionService } from './rediation-region.service';
import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'rediation-region-filter',
	templateUrl: './rediation-region-filter.component.html'
})

export class RediationRegionFilterComponent implements OnInit {
	dataSource: any;
	selectedRowsData: Model.RediationRegionList;

	secCode: string;
	clientIdx: number = 0;
	totalCount: any;

    constructor(
        private _service: RediationRegionService,
        private _dashboard: DashboardService
    ) {
		this.secCode = this._service.secCode;
    }
    ngOnInit() {
        this._dashboard.rediationTherapyRegionStore$.subscribe(res => {
			res['filter'].length ? this.dataSource = res['filter'] : this.dataSource = [];
			this.totalCount = res['filter'].length;
		});
	}

    onDeleteRow(data: Model.RediationRegionList): void {
        this._dashboard.removeData(this.secCode, this.clientIdx, data.data);
	}
	
	onDeleteAll(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		this._dashboard.removeFilterGroup(this.secCode, 0);
	}

    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
	}
	
}