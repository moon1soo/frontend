import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { DashboardService } from '../../dashboard.service';
import { PathSlipService } from './path-slip.service';

import * as Model from '../../model/dashboard.model';

@Component({
  selector: 'path-slip-filter',
  templateUrl: './path-slip-filter.component.html',
})

export class PathSlipFilterComponent implements OnInit {
    dataSource: any;
    selectedRowsData: Model.PathList;

    secCode: string;
    clientIdx: number = 0;
    totalCount: any;

    constructor(
        private _service: PathSlipService,
        private _dashboard: DashboardService
    ) {
		    this.secCode = this._service.secCode;
    }

    ngOnInit() {
        this._dashboard.pathologyStore$.subscribe(res => {
        this.dataSource = res['filter'];
        this.totalCount = res['filter'].length;
		    //res['filter'].length ? this.dataSource = res['filter'] : this.dataSource = [];
		});	
    }
    
    onDeleteRow(data: Model.PathList): void {
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
