import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import * as Model from '../../model/dashboard.model';
import { NursEavService } from './nurs-eav.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

@Component({
 	selector: 'nurs-eav-search',
	templateUrl: './nurs-eav-search.component.html',
	providers: [
        NursEavService
    ]
})

export class NursEavSearchComponent implements OnInit {
	isFilter: boolean = false;
	constructor(
        private _service: NursEavService,
        private _translate: TranslateService,
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
    }
}