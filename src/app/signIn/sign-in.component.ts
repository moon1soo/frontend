import { Component, OnInit, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AppService } from '../app.service';

@Component({
	selector: 'sign-in',
	templateUrl: './sign-in.component.html'
})
export class SignInComponent implements OnInit {

	public constructor(
		private _router: Router,
		private _translate: TranslateService,
		private _service: AppService,
		private _modalService: NgbModal,
		private _appService: AppService
	) { 		

	}
	ngOnInit() {
    }
	
}


