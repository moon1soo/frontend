import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import { DashboardService } from '../../dashboard.service';
import { DoctorService } from './doctor.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

import * as Model from '../../model/dashboard.model';

declare const $: any;

@Component({
 	selector: 'doctor-filter',
	templateUrl: './doctor-filter.component.html'
})

export class DoctorFilterComponent implements OnInit {
	
	dataSource: any;
	selectedRowsData: Model.DoctorList;

	secCode: string;
	clientIdx: number = 0;
	totalCount: any;

    constructor(
        private _service: DoctorService,
        private _dashboard: DashboardService
    ) {
		this.secCode = this._service.secCode;
	}
	
    ngOnInit() {
        this._dashboard.doctorStore$.subscribe(res => {
			res['filter'].length ? this.dataSource = res['filter'] : this.dataSource = [];
			this.totalCount = res['filter'].length;
		});
	}

    onDeleteRow(data: Model.DoctorList): void {
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