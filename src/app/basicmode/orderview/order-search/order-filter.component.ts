import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { DashboardService } from '../../dashboard.service';
import { OrderService } from './order.service';

import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'order-filter',
	templateUrl: './order-filter.component.html'
})

export class OrderFilterComponent implements OnInit {	
	dataSource: any;
	selectedRowsData: Model.OrderList;

	secCode: string;
	clientIdx: number = 0;
	totalCount: any;

    constructor(
        private _service: OrderService,
        private _dashboard: DashboardService
    ) {
		this.secCode = this._service.secCode;
	}
	
    ngOnInit() {
        this._dashboard.orderStore$.subscribe(res => {
			res['filter'].length ? this.dataSource = res['filter'] : this.dataSource = [];
			this.totalCount = res['filter'].length;
		});	
	}

    onDeleteRow(data: Model.OrderList): void {
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