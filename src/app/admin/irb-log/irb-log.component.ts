import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent, DxLoadPanelModule } from 'devextreme-angular';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { IrbLogService } from './irb-log.service';
import { AppState } from '../../app.state';

declare const $: any;

@Component({
 	selector: 'irb-log',
    templateUrl: './irb-log.component.html',
    providers: [ IrbLogService ]
})

export class IrbLogComponent implements OnInit {
	@ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @Output() select = new EventEmitter();
    
    loading: boolean = true;
    dataSource: any[] = [];

	currentPage: number = 1;
	onLast: boolean = false;

	scrollTop: number = 0;

	private onLazy = new Subject<any>();
	onLazy$ = this.onLazy.asObservable();

	constructor(
		private _service: IrbLogService,
		private _app: AppState
	) {
	}
	ngOnInit() {
        // Login Log List 불러오기
		this.loadData();

		// Lazy Load
		this.onLazy$.subscribe(res => {
			this.scrollTop = res;

			if (this.scrollTop > this.currentPage * 1750) {
				this.currentPage = this.currentPage + 1;
				this.loadData();
			}
		});		
    }
    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);

		this.onScroll(e, this.onLazy);
	}

	onScroll(e, onLazy) {
		if (e.component.getScrollable()) {
			e.component.getScrollable().on('scroll', function(options) {
				onLazy.next(options.scrollOffset.top);
			});
		}
	}

	loadData() {
		this.dataGrid.noDataText = this._app.tableText.load;
        this._service.getIRBLogList(this.currentPage).subscribe(res => {
			setTimeout(() => {
				this.loading = false;
				this.dataGrid.noDataText = this._app.tableText.noData;
			}, 800);

			if (this.dataSource.length > 0) {
				this.dataSource = this.dataSource.concat(res.result);
			} else {
				this.dataSource = res.result;
			}
        });
	}
}
