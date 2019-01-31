import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../app.service';

@Component({
	selector: 'no-irb-modal',
    templateUrl: './no-irb-modal.component.html',
    providers: [ AppService ]
})

export class NoIrbModal implements OnInit {
    @Input() data: any;

    constructor(
        public _activeModal: NgbActiveModal,
        private _translate: TranslateService,
        private _appService: AppService
    ) {

    }
    ngOnInit() {
        // 언어 변경
        this._translate.use(this._appService.langInfo);
        this._appService.language$.subscribe(res => {
            this._translate.use(res); 
            setTimeout(() => { window.location.reload(); }, 100);
        });
    }
}