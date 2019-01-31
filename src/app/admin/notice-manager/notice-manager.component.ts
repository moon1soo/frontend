import { Component, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { NoticeManagerService } from './notice-manager.service';
import { AppService } from '../../app.service';

declare const $: any;

@Component({
 	selector: 'notice-manager',
    templateUrl: './notice-manager.component.html',
    providers: [ NoticeManagerService ]
})

export class NoticeManagerComponent implements OnInit {
    
    message: string;
    yn: string;

    ynList: any[] = ['Y', 'N'];

	constructor(
        private _translate: TranslateService,
        private _service: NoticeManagerService,
        private _appService: AppService
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

        // 현재 설정된 공지사항 불러오기
        this._service.getNotificationMsg().subscribe(res => {
            this.message = res.msg;
            this.yn = res.useYn;
        });
    }

    // 변경된 사항 저장하기
    onSave() {
        this._service.getNotificationInsert(this.message, this.yn).subscribe(res => {
            if (res && res.result === 'success') {
                this._translate.get('renewal2017.p.change-notification').subscribe(resp => {
                    alert(resp);
                });
            }
        });
    }
}
