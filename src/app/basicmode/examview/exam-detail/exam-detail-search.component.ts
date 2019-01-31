import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import * as Model from '../../model/dashboard.model';
import { ExamDetailService } from './exam-detail.service';
import { DashboardService } from '../../dashboard.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';

@Component({
 	selector: 'exam-detail-search',
    templateUrl: './exam-detail-search.component.html',
    providers: [ ExamDetailService ]
})

export class ExamDetailSearchComponent implements OnInit {   
   
	constructor(
        private _service: ExamDetailService,
        private _router: Router,
        private _store: StoreService,
		private _state: DashboardState
	) {	
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