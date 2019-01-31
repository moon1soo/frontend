import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import * as Model from '../../model/dashboard.model';
import { NursCircumService } from './nurs-circum.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

@Component({
 	selector: 'nurs-circum-search',
    templateUrl: './nurs-circum-search.component.html'
})

export class NursCircumSearchComponent implements OnInit {
	constructor(
        private _service: NursCircumService,
        private _translate: TranslateService,
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