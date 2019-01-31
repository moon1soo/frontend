import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ConcernService } from './concern.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'concern-search',
    templateUrl: './concern-search.component.html',
    providers: [ ConcernService ]
})

export class ConcernSearchComponent implements OnInit {
	isFilter: boolean = false;
	constructor(
        private _service: ConcernService,
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