import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import * as Model from '../../model/dashboard.model';
import { ExamService } from './exam.service';

@Component({
 	selector: 'exam-search',
    templateUrl: './exam-search.component.html',
    providers: [ ExamService ]
})

export class ExamSearchComponent implements OnInit {   
    isFilter: boolean = false;
	constructor(
        private _service: ExamService,
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
    }       
}