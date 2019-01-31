import { Component, OnInit, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AppService } from '../app.service';
import { StoreService } from '../basicmode/store/store.service';
import { DashboardState } from '../basicmode/dashboard.state';
import { SettingComponentService } from './setting.service';

@Component({
	selector: 'setting-window',
	templateUrl: './setting-component.html',
	providers: [ SettingComponentService, StoreService, DashboardState ]
})
export class SettingComponent implements OnInit {

	closeResult: string; 

	stfNm = '';
	darkMode: boolean = false;
	language: boolean = false;
	imgPath: string = '';
	deptNm: string = '';

	public constructor(
		private _router: Router,
		private _translate: TranslateService,
		private _service: AppService,
		private _localService: SettingComponentService,
		private _modalService: NgbModal,
		private _appService: AppService
	) { 		
		this.imgPath = sessionStorage.getItem('imgPath');
	}
	ngOnInit() {
		this.stfNm = sessionStorage.getItem('stfNm');
		this.deptNm = sessionStorage.getItem('deptNm');
		const theme = localStorage.getItem('theme');
		const lang = localStorage.getItem('language');

		// 언어 변경
        this._translate.use(this._appService.langInfo);
        this._appService.language$.subscribe(res => {
			this._translate.use(res); 
			setTimeout(() => { window.location.reload(); }, 100);
		});
		const body = document.querySelector('body');
		if(theme) {
			switch(theme) {
				case 'light': 
					this.darkMode = false;
					body.classList.remove('dark-mode');
					break;
				case 'dark': 
					this.darkMode = true;
					body.classList.add('dark-mode');
					break;
				default: 
					this.darkMode = false;
					body.classList.remove('dark-mode');
			}
		}
		if(lang) {
			switch(lang) {
				case 'en': 
					this.language = true;					
					break;
				case 'ko': 
					this.language = false;
					break;
				default: 
					this.language = true;
			}
		}
	}	
	// i18n
	translate(event): void {
		if(event) {
			this._service.setLang('en');
			localStorage.setItem('language', 'en');
		} else {
			this._service.setLang('ko');
			localStorage.setItem('language', 'ko');
		}
		
	}

	selDarkMode(event) {		
		if(event) {
			this._service.setTheme('dark');
		} else {
			this._service.setTheme('light');
		}
		setTimeout(() => {
			window.location.reload();
		}, 10);		
	}

	clearSession() {
		console.log('로그아웃하여 브라우저 세션을 삭제합니다.');
		sessionStorage.clear();
		console.log('브라우저 세션이 삭제되었습니다.');
	}
}


