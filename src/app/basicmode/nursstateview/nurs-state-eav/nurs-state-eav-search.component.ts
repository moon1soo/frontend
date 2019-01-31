import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';

import * as Model from '../../model/dashboard.model';
import { NursStateEavService } from './nurs-state-eav.service';
import { DashboardService } from '../../dashboard.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

@Component({
 	selector: 'nurs-state-eav-search',
    templateUrl: './nurs-state-eav-search.component.html',
    providers: [ NursStateEavService ]
})

export class NursStateEavSearchComponent implements OnInit {

	constructor(
        private _service: NursStateEavService,
        private _translate: TranslateService,
        private _router: Router,
        private _store: StoreService,
		private _state: DashboardState
	) {
        _translate.addLangs(["ko", "en"]);
		_translate.setDefaultLang('ko');

		// let browserLang = _translate.getBrowserLang();
        // _translate.use(browserLang.match(/ko|en/) ? browserLang : 'ko');

        this._service.list().subscribe(res => {

		});
    }
	ngOnInit() {
        this._store.deleteVo$.subscribe(res => {			
			if(res === this._state.code[this._service.secCode].storage) {			
				this._service.list().subscribe(res => {
				});				
			}			
		});
    }


}