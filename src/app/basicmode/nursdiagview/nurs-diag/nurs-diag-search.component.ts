import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import { NursDiagService } from './nurs-diag.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';
import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'nurs-diag-search',
    templateUrl: './nurs-diag-search.component.html'
})

export class NursDiagSearchComponent implements OnInit {   

	constructor(
        private _service: NursDiagService,
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