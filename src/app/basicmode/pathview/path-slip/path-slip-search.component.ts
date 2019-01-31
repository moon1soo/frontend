import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { PathSlipService } from './path-slip.service';
import { DashboardState } from '../../dashboard.state';
import { DashboardService } from '../../dashboard.service';
import { StoreService } from '../../store/store.service';


@Component({
 	selector: 'path-slip-search',
	templateUrl: './path-slip-search.component.html',
	providers: [ PathSlipService ]
})

export class PathSlipSearchComponent implements OnInit {
	isFilter: boolean = false;
	constructor(
		private _service: PathSlipService,
		private _router: Router,
		private _store: StoreService,
		private _state: DashboardState
	) {		
		this._service.list().subscribe(res => {

		});
	}
	
	ngOnInit() {
		const url = this._router.url.split('/');
        const location = url[url.length - 1];

        if(location === 'additem') {
            this.isFilter = true;
        } else {
            this.isFilter = false;
        }
		this._store.deleteVo$.subscribe(res => {
			if(res === this._state.code[this._service.secCode].storage) {
				this._service.list().subscribe(res => {
				});
			}
		});
	}	
}