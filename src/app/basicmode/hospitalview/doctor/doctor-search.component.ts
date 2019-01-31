import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';

import { DoctorService } from './doctor.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

@Component({
 	selector: 'doctor-search',
    templateUrl: './doctor-search.component.html',
    providers: [ DoctorService ]
})

export class DoctorSearchComponent implements OnInit {   
    @Input('activeTab') activeTab: string;
    isFilter: boolean = false;

    constructor(
        private _service: DoctorService,
        private _router: Router,
        private _store: StoreService,
		private _state: DashboardState
	) {
        this._service.list().subscribe(res => {

        });
    }
	ngOnInit() {
        sessionStorage.setItem('currentUrl', this._router.url);
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