import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MedicineService } from './medicine.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'medicine-search',
    templateUrl: './medicine-search.component.html',
    providers: [ MedicineService ]
})

export class MedicineSearchComponent implements OnInit {
	isFilter: boolean = false;
	constructor(
        private _service: MedicineService,
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