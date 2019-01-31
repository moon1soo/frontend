import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { DashboardService } from '../../dashboard.service';
import { NursEavService } from './nurs-eav.service';
import { StoreService } from '../../store/store.service';

import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'nurs-eav-filter',
	templateUrl: './nurs-eav-filter.component.html'
})

export class NursEavFilterComponent implements OnInit {
	dataSource: any;
	selectedRowsData: Model.NursEav;

	secCode: string;
	clientIdx: number = 0;
	totalCount: any;

    constructor(
		private _store: StoreService,
        private _service: NursEavService,
        private _dashboard: DashboardService
    ) {
		this.secCode = this._service.secCode;
	}
	
    ngOnInit() {
        this._dashboard.nursEavStore$.subscribe(res => {
			res['filter'].length ? this.dataSource = res['filter'] : this.dataSource = [];
			this.totalCount = res['filter'].length;
		});
	}

    onDeleteRow(data: Model.NursEav): void {
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