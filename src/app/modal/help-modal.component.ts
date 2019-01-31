import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { HandleError } from './handle-error.component';

@Component({
    selector: 'help-modal',
    templateUrl: './help-modal.component.html'
})

export class HelpModal implements OnInit {
    @Input() data: any;
    config: any;

    constructor(
        private http: Http,
        private modalService: NgbModal,
        public activeModal: NgbActiveModal
    ) {

    }

    ngOnInit() {

    }
}
