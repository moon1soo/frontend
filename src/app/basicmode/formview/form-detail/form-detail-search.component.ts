import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import * as Model from '../../model/dashboard.model';
import { FormDetailService } from './form-detail.service';

@Component({
 	selector: 'form-detail-search',
    templateUrl: './form-detail-search.component.html',
    providers: [ FormDetailService ]
})

export class FormDetailSearchComponent implements OnInit {   
	isFilter: boolean = false;
	constructor(
        private _service: FormDetailService,
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