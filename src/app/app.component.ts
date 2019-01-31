import { Component, OnInit, NgZone, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Http,Response } from '@angular/http';
import { Router, NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';

import { AppService } from './app.service';
import { AppState } from './app.state';
import { AppFunc } from './app.func';
import { HandleError } from './modal/handle-error.component';

@Component({
	selector: 'app-root',
	template:`<router-outlet></router-outlet>`,
	providers: [ AppService, AppState, AppFunc ]
})
export class AppComponent implements OnInit {
	title = 'Clinical Data Warehouse';
	receiveTheme: string;
	public constructor(
		private _titleService: Title,
		private _router: Router,
		private _zone: NgZone,
		private _service: AppService,
		private _state: AppState,
		private _http: Http,
        private _modal: NgbModal,
		public translate: TranslateService
	) {
		translate.addLangs(["en","ko"]);
		translate.setDefaultLang('en');

		translate.use('en');
		// let browserLang = translate.getBrowserLang();
		// translate.use(browserLang.match(/ko|en/) ? browserLang : 'ko');

		// this.getJSON().subscribe(data => {
        //     console.log(data.host);
		// 	this._state.ajaxUrl = data.host;
		// 	this._state.socketUrl = data.socket;
		// 	sessionStorage.setItem('socketUrl', JSON.stringify(data.socket))
		// }, error => { console.log(error) });
	}
	ngOnInit() {
		const theme = localStorage.getItem('theme');
		const language = localStorage.getItem('language');


		if(theme) {
			this.switchTheme(theme);
		} else {
			this.switchTheme('light');
		}
		if(language) {
			this.translate.use(language);
		}
		this._service.switchTheme$.subscribe(res => {
			this.switchTheme(res);
		});
		this._service.language$.subscribe(res => {
			this.translate.use(res);
		});6

		const path = sessionStorage.getItem('currentUrl');
		if(path) {
			this._router.navigateByUrl(path, { skipLocationChange: true });
		} else {
			this._router.navigateByUrl("/tempAuth.do/gate", { skipLocationChange: true });
		}
	}

	switchTheme(theme: string) {
		const body = document.querySelector('body');
		switch(theme) {
			case 'light':
				require("style-loader!./../assets/styles/app.scss");
				break;
			case 'dark':
				require("style-loader!./../assets/styles/app.dark.scss");
				break;
			default:
				require("style-loader!./../assets/styles/app.scss");
		}

		localStorage.setItem('theme', theme);
	}
}


