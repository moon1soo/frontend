import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../app.service';
import { SharedListService } from './shared-list.service';

@Component({
    selector: 'share-list-modal',
    templateUrl: './share-list-modal.component.html',
    providers: [
        AppService,
        SharedListService
     ]
})

export class ShareListModal implements OnInit {
    @Input() data: string;
    dataSource: any;

    constructor(
        public activeModal: NgbActiveModal,
        private _translate: TranslateService,
        private _appService: AppService,
        private _service: SharedListService
    ) {
    }
    ngOnInit() {
        // 언어 변경
		this._translate.use(this._appService.langInfo);
		this._appService.language$.subscribe(res => {
            this._translate.use(res);
            setTimeout(() => {
				window.location.reload();
			}, 100);
        });

        this._service.list(this.data).subscribe(res => {
            this.dataSource = res.result;
        });
    }

    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
	}
}
