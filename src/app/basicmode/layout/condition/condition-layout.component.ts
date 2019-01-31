import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardFunc } from '../../dashboard.func';
import { DashboardComponent } from '../../dashboard.component';

import { DxToastModule } from 'devextreme-angular';

@Component({
 	selector: 'condition-layout',
	  templateUrl: './condition-layout.component.html'
})
export class ConditionLayoutComponent {

	isOverThousand: boolean = false;

	constructor(
		private _router: Router,
		private _func: DashboardFunc,
		private _comp: DashboardComponent
	) {
		// New Query 선택시 Side Bar 축소
		this._comp.isMenuCollapsed = true;
		sessionStorage.setItem('currentUrl', this._router.url);
	}
	ngOnInit(): void {
		const path = sessionStorage.getItem('currentUrl');
		// localStorage.setItem()

		if(path && path !== '/tempAuth.do/basicmode/condition') {
			this._router.navigateByUrl(path, { skipLocationChange: true });
		} else {
			this._router.navigateByUrl("/tempAuth.do/basicmode/condition/concernView", { skipLocationChange: true });
		}
		// 현재위치 저장
		this._func.getCurUrl('condition');
		sessionStorage.setItem('prevLink', 'condition');
		
		// for (var key in localStorage){
		// 	console.log(key)
		// }
		// localStorage['split-pane']
		console.log(localStorage.getItem('split-pane'));
	}
}