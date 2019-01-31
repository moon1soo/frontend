import { Component, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { AppState } from '../app.state';
import { DxFileUploaderComponent } from 'devextreme-angular';

import { Message } from '@stomp/stompjs';
import { StompService } from '@stomp/ng2-stompjs';
import { StoreService } from '../basicmode/store/store.service';
import { DashboardState } from '../basicmode/dashboard.state';
import { HandleError } from './handle-error.component';


@Component({
    selector: 'upload-patients-modal',
    templateUrl: './upload-patients-modal.component.html',
    providers: [ 
        AppService,
        StoreService,
        DashboardState
    ]
})

export class  UploadPatientsModal implements OnInit {
    @Input() data: string;
    @ViewChild(DxFileUploaderComponent) fileUploader: DxFileUploaderComponent;

    appurl: string;
    uploadUrl: string;
    workIndex: {seq: string; workIndex: string} = {
        seq: 'upload',
        workIndex: null
    };

    isUploaded: boolean = false;
    initRun: boolean = false;

    uploadPatientsResponse: {length: number; response: string;};

    constructor(
        public activeModal: NgbActiveModal,
        private _modalService: NgbModal,
        private _app: AppState,
        private _translate: TranslateService,
        private _stomp: StompService,
        private _router: Router,
        private _appService: AppService,
        private _detective: ChangeDetectorRef,
        private _store: StoreService
    ) {
        this.appurl = this._app.ajaxUrl;
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
        // if(this.data === 'powermode') {
        //     this.uploadUrl = `${this.appurl}work/execute/group/patientsUpload.json`;
        // } else {
        //     this.uploadUrl = `${this.appurl}work/execute/patientsUpload.json`;
        // }
        this.uploadUrl = `${this.appurl}work/execute/patientsUpload.json`;

        let sessionId = sessionStorage.getItem('sessionId');

        let job =
			this._stomp.subscribe(`/user/${sessionId}/work/message`)
			.map((message: Message) => {
				return message.body;
			}).subscribe((msg_body) => {

				const msg = JSON.parse(msg_body);
                const serverMessage = msg.SERVER_MESSAGE;
                console.log('이곳 소켓실행', msg);
                let workIndex;

				let allData = msg.WORK_LIST;

				if (serverMessage === 'ACTIVE' || (serverMessage === 'ALIVE' && this.initRun === false)) {

                    // 현재 실행한 잡의 인덱스를 저장
					if (msg.WORK_HISTORY) {
						const history = Object.getOwnPropertyNames(msg.WORK_HISTORY);
						workIndex = history[history.length - 1];
						// this._service.setWorkIndex = history[history.length - 1];
                        sessionStorage.setItem('workIndex', history[history.length - 1]);

                        this.initRun = true;
                        job.unsubscribe();

						// 잡 에러 발생시
						const err = msg.WORK_HISTORY[workIndex].ERROR_LIST;
						if(err && err.length) {
                            // this.jobError(err[err.length - 1]);	
                            const modalRef = this._modalService.open(HandleError);
                            modalRef.componentInstance.data = err[err.length - 1];
						}
					}

                }
                // else if (serverMessage === 'DISCONNECT' || (serverMessage === 'ALIVE' && this.initRun === true)) {
				// 	job.unsubscribe();
                // }
                else if (serverMessage === 'ALIVE') {
                    	job.unsubscribe();
                    }
			});
    }

    getStatus(e) {
        const response = JSON.parse(e.request.response);
        console.log(response);
        this.uploadPatientsResponse = {
            length: response.totalLength,
            response: response.uploadPatients
        }
        setTimeout(() => {
            this.isUploaded = true;
        }, 3000);
    }
}
