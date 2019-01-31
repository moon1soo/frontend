import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { DashboardFunc } from '../../dashboard.func';
import { StoreService } from '../../store/store.service';

@Component({
 	selector: 'result-layout',
	  templateUrl: './result-layout.component.html'
})
export class ResultLayoutComponent {   
	// @ViewChild('workflow') workflow;
	initPatient: string = 'patient';

	constructor(
		private _fb: FormBuilder,
		private _router: Router,
		private _func: DashboardFunc,
		private _translate: TranslateService,
		private _store: StoreService
	) {			
		sessionStorage.setItem('currentUrl', this._router.url);		
		
	}
	ngOnInit(): void {
		this.initPatient = this._store.store.basicStore.select.split(',')[0];
		this._store.storeVo$.subscribe(res => {
			if(this._store.store.basicStore.select) {
				this.initPatient = this._store.store.basicStore.select.split(',')[0];
			}			
		});

		const path = sessionStorage.getItem('currentUrl');		

		if(path && path !== '/tempAuth.do/basicmode/result/interim') {
			this._router.navigateByUrl(path, { skipLocationChange: true });
		} else {
			this._router.navigateByUrl(`/tempAuth.do/basicmode/result/interim/${this.initPatient}`, { skipLocationChange: true });	
		}

		// 현재위치 저장
		this._func.getCurUrl('interim');
		sessionStorage.setItem('prevLink', 'interim');
	}

}