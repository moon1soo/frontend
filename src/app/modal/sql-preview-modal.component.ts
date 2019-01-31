import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { HandleError } from './handle-error.component';
import 'codemirror/mode/go/go'

@Component({
	selector: 'sql-preview-modal',
	templateUrl: './sql-preview-modal.component.html'
})

export class SqlPreviewModal implements OnInit {
    @Input() data: any;   
    config: any;

    constructor(
        private http: Http,
		private modalService: NgbModal,
        public activeModal: NgbActiveModal
    ) {
        this.config = { lineNumbers: true, mode: 'text/x-mysql', lineWrapping: true };
    }

    ngOnInit() {
        
	}	
}
