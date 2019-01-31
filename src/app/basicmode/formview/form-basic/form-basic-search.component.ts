import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import * as Model from '../../model/dashboard.model';
import { FormBasicService } from './form-basic.service';
import { DashboardService } from '../../dashboard.service';

@Component({
 	selector: 'form-basic-search',
    templateUrl: './form-basic-search.component.html',
    providers: [ FormBasicService ]
})

export class FormBasicSearchComponent implements OnInit {   
    isFilter: boolean = false;
	constructor(
        private _service: FormBasicService,
        private _router: Router
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
    }      
}