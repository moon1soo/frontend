import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { FeeService } from './fee.service';

@Component({
 	selector: 'fee-search',
	templateUrl: './fee-search.component.html',
	providers: [ FeeService ]
})

export class FeeSearchComponent implements OnInit {
	isFilter: boolean = false;
	constructor(
		private _service: FeeService,
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