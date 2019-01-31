import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { DashboardService } from '../../dashboard.service';
import { ConcernService } from './concern.service';

import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'concern-client',
	templateUrl: './concern-client.component.html'
})

export class ConcernClientComponent implements OnInit {
	dataSource: any = [];
	selectedRowsData: Model.ConcernList;

	secCode: string;
	clientIdx: number = 0;
	totalCount: any;

	isLoadtable: boolean = false;

    constructor(
        private _service: ConcernService,
        private _dashboard: DashboardService
    ) {
		this.secCode = this._service.secCode;
	}
	
    ngOnInit() {
        this._dashboard.concernPatientStore$.subscribe(res => {
			res['client'].length ? this.dataSource = res['client'][0] : this.dataSource = [];
			res['client'].length ? this.totalCount = res['client'][0].length : this.totalCount = 0;
		});
	}

    onDeleteRow(data: Model.ConcernList): void {
        this._dashboard.removeData(this.secCode, this.clientIdx, data.data);
	}
	
	onDeleteAll(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		this._dashboard.removeClientGroup(this.secCode, 0);
	}
	
    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
		setTimeout(() => { this.isLoadtable = true; }, 50);
	}
	
}