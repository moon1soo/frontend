import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import * as Model from '../../model/dashboard.model';
import { SurDiagService } from './sur-diag.service';
import { DashboardService } from '../../dashboard.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';
import { AppService } from '../../../app.service';

@Component({
 	selector: 'sur-diag-search',
	templateUrl: './sur-diag-search.component.html',
	providers: [ SurDiagService ]
})

export class SurDiagSearchComponent implements OnInit {   
    isFilter: boolean = false;
	constructor(
        private _service: SurDiagService,
        private _dashboard: DashboardService,
        private _translate: TranslateService,
        private _router: Router,
        private _store: StoreService,
        private _state: DashboardState,
        private _appService: AppService
	) {	 
        this._service.list().subscribe(res => {		
		
		});   
    }
	ngOnInit() {
		const url = this._router.url.split('/');
        const location = url[url.length - 1];

        // 언어 변경
		this._translate.use(this._appService.langInfo);			
		this._appService.language$.subscribe(res => {
            this._translate.use(res); 
            setTimeout(() => { window.location.reload(); }, 100);
        });
        
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