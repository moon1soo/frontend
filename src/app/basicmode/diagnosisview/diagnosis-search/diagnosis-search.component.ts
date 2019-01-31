import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { AppState } from '../../../app.state';
import { DiagnosisService } from './diagnosis.service';
import { StoreService } from '../../store/store.service';
import { DashboardService } from '../../dashboard.service';

import * as Model from '../../model/dashboard.model';
import * as StoreModel from '../../store/store.model';

@Component({
 	selector: 'diagnosis-search',
    templateUrl: './diagnosis-search.component.html',
    providers: [ DiagnosisService ]
})

export class DiagnosisSearchComponent implements OnInit {
    isFilter: boolean = false;

    constructor(
        private _app: AppState,
        private _router: Router,
        private _service: DiagnosisService,
        private _dashboard: DashboardService,
        private _store: StoreService,
	) {
        const store = this._store.store;
		const storage = store['diagnosisStore'];
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