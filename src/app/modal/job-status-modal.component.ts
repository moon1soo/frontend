import { Component, OnInit, Input, Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { StompService, StompConfig } from '@stomp/ng2-stompjs';
import { stompConfig } from '../basicmode/stomp/stomp';
import { JobStatusModalService } from './job-status-modal.service';
import { StoreService } from '../basicmode/store/store.service';
import { Message } from '@stomp/stompjs';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { HandleError } from './handle-error.component';


@Component({
    selector: 'job-status-modal',
    templateUrl: './job-status-modal.component.html',
    providers: [
        JobStatusModalService,
        StoreService
    ]
})

export class JobStatusModal implements OnInit {

    message: string;
    ready: boolean;

    showCreate: boolean;
    activeCreate: boolean;

    constructor(
        private http: Http,
        private modalService: NgbModal,
        private _stomp: StompService,
        private _service: JobStatusModalService,
        private _detective: ChangeDetectorRef,
        public activeModal: NgbActiveModal
    ) {

    }

    ngOnInit() {
        this.ready = false;
        this.showCreate = false;
        this.activeCreate = false;
        this.message = 'alert-1';

        this.getJobStatus();
    }

    getJobStatus(): void {
        const job = this._stomp.subscribe('/user/' + sessionStorage.getItem('stfNo') + '/work/message')
            .map((message: Message) => {
                return message.body;
            }).subscribe((msg_body) => {
                const data = JSON.parse(msg_body);

                if (data.length < 1 && this.showCreate === true) {

                    this.ready = true;
                    this.activeCreate = true;
                    this.message = 'alert-3';
                    console.log(this.message, data);
                    job.unsubscribe();

                }

                this._detective.detectChanges();
            });
    }

    cancelJob() {
        this.message = 'alert-2';
        this._service.cancelJob().subscribe();
        this.showCreate = true;
        this._detective.detectChanges();
    }
}
