import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { SurDoctorService } from './sur-doctor.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';
import { AppService } from '../../../app.service';

@Component({
 	selector: 'sur-doctor-search',
	templateUrl: './sur-doctor-search.component.html',
	providers: [ SurDoctorService ]
})

export class SurDoctorSearchComponent implements OnInit {   
	isFilter: boolean = false;
    constructor(
		private _router: Router,
		private _translate: TranslateService,
		private _service: SurDoctorService,
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