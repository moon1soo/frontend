import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../app.state';

import { AppService } from '../app.service';
import { TranslateService } from '@ngx-translate/core';
// import { DashboardService } from '../dashboard.service';
import { DiagramService } from '../powermode/diagram.service';
import { DiagramState } from '../powermode/diagram.state';
import { PowermodeStoreService } from '../powermode/store/store.service';

@Component({
    selector: 'admin-log',
    templateUrl: './admin.component.html',
    providers: [ 
        DiagramService,
        PowermodeStoreService,
        DiagramState
    ]
})

export class AdminComponent implements OnInit {

    isPowermode: boolean = false;

    constructor(
        private _app: AppState,
        private _router: Router,
        private _translate: TranslateService,
        private _appService: AppService,
        private _diagramService: DiagramService
        // private _service: DashboardService
    ) {
    }

    ngOnInit() {
        // sessionStorage.setItem('currentUrl', this._router.url);
        // console.log(this._router);
        if(~this._router.url.indexOf('powermode')) {
            this.isPowermode = true;
        } else {
            this.isPowermode = false;
        }
		// 언어 변경
        this._translate.use(this._appService.langInfo);
        this._appService.language$.subscribe(res => {
            this._translate.use(res);
            setTimeout(() => {
                window.location.reload();
            }, 100);
        });

		// 하단 설명 변경
		// this._translate.get('renewal2017.p.message-admin').subscribe(res => {
		// 	this._service.setMessage(res);
		// });        
    }

    onClose() {
        if (this.isPowermode) {
            this._router.navigateByUrl("/tempAuth.do/powermode/paper", { skipLocationChange: true });

            this._diagramService.setStateWork({ mode: 'edit' });
        } else {
            this._router.navigateByUrl("/tempAuth.do/basicmode/condition", { skipLocationChange: true });
        }
    }
}
