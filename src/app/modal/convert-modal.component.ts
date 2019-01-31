import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../app.service';
import { StoreService } from '../basicmode/store/store.service';
import { ConvertModalService } from './convert-modal.service';

@Component({
	selector: 'convert-modal',
    templateUrl: './convert-modal.component.html',
    providers: [
        ConvertModalService,
        StoreService
    ]
})

export class ConvertModal implements OnInit {    
    
    constructor(
        public activeModal: NgbActiveModal,
        private _translate: TranslateService,
        private _appService: AppService,
        private _localService: ConvertModalService
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

    pressConfirm() {
        const workIndex = sessionStorage.getItem('workIndex');

        if (workIndex != null) {
            this._localService.cancelJob().subscribe();
        }

        this.activeModal.close('Confirm');
    }
};
