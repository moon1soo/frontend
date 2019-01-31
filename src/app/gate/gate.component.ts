import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GateService } from './gate.service';
import { StoreService } from '../basicmode/store/store.service';
import { DashboardState } from '../basicmode/dashboard.state';
import { ItemListState } from '../item-list.state';
import { AppState } from '../app.state';
import { AppService } from '../app.service';
import { AppComponent } from '../app.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'gate-html',
  templateUrl: './gate.component.html',
  providers: [
	AppService,
	GateService,
	// StoreService,
	DashboardState,
	ItemListState,
	AppComponent
  ]
})
export class GateComponent {

	stfNo: string = '';
	stfNm: string = '';
	imgPath: string = '';
	authCd: string = '';
	sessionId: string = '';
	deptCd: string = '';
	deptNm: string = '';

	warning: boolean = true;
	appurl: string;

	constructor(
		private _router: Router,
		private _translate: TranslateService,
		private _appService: AppService,
		private _service: GateService,
		// private _store: StoreService,
		private _appCom: AppComponent,
		private _app: AppState
	) {
		sessionStorage.setItem('currentUrl', this._router.url);
		this.appurl = this._app.ajaxUrl;
	}

	ngOnInit() {
		const path = sessionStorage.getItem('currentUrl');
		if(path) {
			this._router.navigateByUrl(path, { skipLocationChange: true });
		}
		
		sessionStorage.setItem('prevLink', 'gate');

		const gateConfirm = sessionStorage.getItem('gateConfirm');

		if (gateConfirm === 'Y') {
			this.warning = false;
		}

		 // 언어 변경
		 this._translate.use(this._appService.langInfo);			
		 this._appService.language$.subscribe(res => {
			 this._translate.use(res); 
			 setTimeout(() => { window.location.reload(); }, 100);
		 });
		// this._appCom.getJSON().subscribe(res => {
		// 	console.log(res);
		// 	if(res) {
				
		// 	}			
		// });	
		this._service.list().subscribe(res => {
			this.stfNo = res['STF_NO'];
			this.stfNm = res['STF_NM'];
			this.imgPath = res['IMG_PATH'];
			this.authCd = res['AUTH_CD'];
			this.sessionId = res['SESSION_ID'];
			this.deptCd = res['DEPT_CD'];
			this.deptNm = res['DEPT_NM'];
			
			this._appService.staffInfo = {name: this.stfNm, number: this.stfNo};
			sessionStorage.setItem('stfNo', this.stfNo);
			sessionStorage.setItem('stfNm', this.stfNm);
	
			
			if (this.imgPath === null) {
				sessionStorage.setItem('imgPath', 'assets/styles/images/user.jpg');
			} else {
				sessionStorage.setItem('imgPath', this.imgPath);
			}

			sessionStorage.setItem('authCd', this.authCd);
			sessionStorage.setItem('sessionId', this.sessionId);

			sessionStorage.setItem('deptCd', this.deptCd);
			sessionStorage.setItem('deptNm', this.deptNm);

			console.log('========== 사번 ==========');
			console.log(sessionStorage.getItem('stfNo'));
			console.log('========== 이름 ==========');
			console.log(sessionStorage.getItem('stfNm'));
			console.log('========== 등급 ==========');
			console.log(sessionStorage.getItem('authCd'));
			console.log('========== 세션 ==========');
			console.log(sessionStorage.getItem('sessionId'));
			console.log('========== 부서 ==========');
			console.log(sessionStorage.getItem('deptCd'), sessionStorage.getItem('deptNm'));
		});
	}

	notice(event: MouseEvent) {
		if(this.stfNo.startsWith('M2')) {
			this._router.navigateByUrl("/tempAuth.do/cohortmart", { skipLocationChange: true });
		} else {
			notify('코호트마트 서비스는 준비 중입니다', "error", 2000);
		}

	}

	confirm() {
		this.warning = false;
		sessionStorage.setItem('gateConfirm', 'Y');
	}

	citation(): void {
		const win = window;
		win.open(this.appurl + 'help/detail21.do', 'Bestcare Help', 'width=700, height=700, location=no, menubar=no, status=no, toolbar=no');
	}
}
