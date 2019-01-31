import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { DashboardService } from '../../dashboard.service';
import { MedicalService } from './medical.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

import * as Model from '../../model/dashboard.model';

declare const $: any;

@Component({
 	selector: 'medical-filter',
	templateUrl: './medical-filter.component.html'
})

export class MedicalFilterComponent implements OnInit {
	
	dataSource: any;
	selectedRowsData: Model.MedicalList;

	secCode: string;
	clientIdx: number = 0;
	totalCount: any;

    constructor(
        private _service: MedicalService,
        private _dashboard: DashboardService
    ) {
		this.secCode = this._service.secCode;
    }
    ngOnInit() {
        this._dashboard.medicalStore$.subscribe(res => {
			res['filter'].length ? this.dataSource = res['filter'] : this.dataSource = [];
			this.totalCount = res['filter'].length;
		});	
	}

    onDeleteRow(data: Model.MedicalList): void {
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