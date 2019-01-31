import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import notify from 'devextreme/ui/notify';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'az-error',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './error.component.html'
})
export class ErrorComponent {
    router: Router;
    
    constructor(
        private _router: Router, 
        private _location: Location,
        private _translate: TranslateService,
    ) {
        this.router = _router;
        notify(this._translate.instant('renewal2017.p.alert-prevent-back'), 'error', 2000);
        const path = sessionStorage.getItem('currentUrl');

        if(path) {
            console.log('에러 주소',path);
			this._router.navigateByUrl(path, { skipLocationChange: true });	
		} else {
			this._router.navigateByUrl("/tempAuth.do", { skipLocationChange: true });
		}
    }    
}