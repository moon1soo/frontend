import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../app.service';

@Component({
	selector: 'conf-modal',
	templateUrl: './conf-modal.component.html'
})

export class ConfModal implements OnInit {
    @Input() data: {title: string; content: string; seq: string};
    
    serverMsg: string;
    title: string;
    
    constructor(
        public activeModal: NgbActiveModal,
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
        
        this.title = this.data.title;
        this.serverMsg = this.data.content;
    }

}