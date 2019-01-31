import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import * as Model from '../../model/dashboard.model';
import { ExamResultService } from './exam-result.service';

@Component({
 	selector: 'exam-result-search',
    templateUrl: './exam-result-search.component.html',
    providers: [ ExamResultService ]
})

export class ExamResultSearchComponent implements OnInit {   
	isFilter: boolean = false;
	constructor(
        private _service: ExamResultService,
        private _router: Router
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
        // this._store.deleteVo$.subscribe(res => {			
		// 	if(res === this._state.code[this._service.secCode].storage) {			
		// 		this._service.list().subscribe(res => {
		// 		});				
		// 	}			
		// });
    }       
}