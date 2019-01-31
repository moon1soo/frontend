import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { DxDataGridModule, DxDataGridComponent, DxLoadPanelModule } from 'devextreme-angular';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { SqlLogService } from './sql-log.service';
import { DashboardState } from 'app/basicmode/dashboard.state';
import { AppState } from '../../app.state';

declare const $: any;

@Component({
 	selector: 'sql-log',
    templateUrl: './sql-log.component.html',
    providers: [ SqlLogService, DashboardState]
})

export class SqlLogComponent implements OnInit {
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
		private _fb: FormBuilder,
		private _service: SqlLogService,
		private _state: DashboardState,
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
        this._service.getSqlViewLogList(this.currentPage).subscribe(res => {
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
