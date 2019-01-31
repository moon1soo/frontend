import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import {
	Router,
	Event as RouterEvent,
	NavigationStart,
	NavigationEnd,
	NavigationCancel,
	NavigationError
  } from '@angular/router'
import { TranslateService } from '@ngx-translate/core';
import { StoreService } from './store/store.service';
import { DashboardService } from './dashboard.service';
import { AppService } from '../app.service';

import * as Type from './model/dashboard.model';

@Component({
 	selector: 'dashboard-layout',
	templateUrl: './dashboard.component.html',
	providers: [ StoreService, DashboardService ]
})
export class DashboardComponent implements AfterViewInit  {
	isMenuCollapsed: boolean = false;
	loading: boolean = false;
	secondaryHeight: number;
	message: string;
	isCondition: boolean = true;

	constructor(
		private _translate: TranslateService,
		private _service: DashboardService,
		private _router: Router,
		private _appService: AppService
	) {
		_translate.addLangs(["en", "ko"]);
		_translate.setDefaultLang('en');

		// let browserLang = _translate.getBrowserLang();
		// _translate.use('ko');
		sessionStorage.setItem('currentUrl', this._router.url);

		this.loading = true;
		this._service.message$.subscribe(res => {
			this.message = res;
		});
	}
	ngOnInit(): void {
		const path = sessionStorage.getItem('currentUrl');
		// console.log('베이직모드');
		console.log(path);
		if(path && !~path.indexOf('powermode')) {
			if(path === '/tempAuth.do/basicmode') {
				this._router.navigateByUrl("/tempAuth.do/basicmode/scenario", { skipLocationChange: true });
			} else {
				this._router.navigateByUrl(path, { skipLocationChange: true });
			}
		} else {
			this._router.navigateByUrl("/tempAuth.do/basicmode/scenario", { skipLocationChange: true });
		}

		// 언어 변경
		this._translate.use(this._appService.langInfo);
		this._appService.language$.subscribe(res => {
			this._translate.use(res);
			setTimeout(() => {
				window.location.reload();
			}, 100);
		});

		setTimeout(() => {
			this.resizeWin();
		});
		window.onresize = () => {
			this.resizeWin();
		};
	}
	resizeWin(): void {
		// 상하단 리사이즈 크기 세팅
		const win = window.innerHeight;
		const workflow = (document.querySelector('.card-workflow-body') as HTMLElement);
		if(workflow) {
			const header = (document.querySelector('.az-navbar') as HTMLElement).offsetHeight;
			const workflowHeight = workflow.offsetHeight;
			this.secondaryHeight = Number(win) - header - workflowHeight;
		}
	}
	ngAfterViewInit() {
        this._router.events
            .subscribe((event) => {
                if(event instanceof NavigationStart) {
                    this.loading = true;
                }
                else if (
                    event instanceof NavigationEnd ||
                    event instanceof NavigationCancel
				) {

                }
            });
    }
	toggelMenu(): void {
		this.isMenuCollapsed = !this.isMenuCollapsed;
	}
	routing(event) : void {
		console.log(event);
		switch(event) {
			case 'condition': this.isCondition = true; break;
			case 'result': this.isCondition = false; break;
		}
	}
}
