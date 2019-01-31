import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { browser, element, by } from 'protractor';

import { TranslateService } from '@ngx-translate/core';

import { DiagramService } from './diagram.service';
import { DiagramFunc } from './diagram.func';
import { ItemListState } from '../item-list.state';
import { PowermodeStoreService } from './store/store.service';
import { ResultService } from './patientlist/result.service';
import { DiagramState } from './diagram.state';
import { AppService } from '../app.service';
import { ScenarioService } from './scenario/scenario.service';

import * as Model from './model/diagram.model';

declare const $: any;
import * as _ from 'lodash';
import * as backbone from 'backbone';
import * as joint from 'jointjs';
import { V, g, dia, shapes, util, layout } from 'jointjs'

@Component({
 	selector: 'diagram-layout',
	templateUrl: './diagram.component.html',
	providers: [ PowermodeStoreService, DiagramService, ResultService,  DiagramState, ScenarioService, DiagramFunc ]
})
export class DiagramComponent implements OnInit  {
	isUserEditing: boolean;
	constructor(
		private _translate: TranslateService,
		private _router: Router
	) {
		sessionStorage.setItem('currentUrl', this._router.url);		
	}
	ngOnInit(): void {
		const path = sessionStorage.getItem('currentUrl');
		// console.log(path);
		if(path && !~path.indexOf('basicmode')) {
			this._router.navigateByUrl(path, { skipLocationChange: true });
		} else {
			this._router.navigateByUrl("/tempAuth.do/powermode/scenario", { skipLocationChange: true });
		}
		// if(path && ~path.indexOf('/powermode/scenario')) {
		// 	this._router.navigateByUrl("/tempAuth.do/powermode/scenario", { skipLocationChange: true });
		// } else {
		// 	this._router.navigateByUrl("/tempAuth.do/powermode/paper", { skipLocationChange: true });
		// }
	}
	
}