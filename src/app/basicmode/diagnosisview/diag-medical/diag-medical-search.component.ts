import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { DiagMedicalService } from './diag-medical.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

@Component({
 	selector: 'diag-medical-search',
    templateUrl: './diag-medical-search.component.html',
    providers: [ DiagMedicalService ]
})

export class DiagMedicalSearchComponent implements OnInit {
    isFilter: boolean = false;

    constructor(
        private _router: Router,
        private _service: DiagMedicalService,
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