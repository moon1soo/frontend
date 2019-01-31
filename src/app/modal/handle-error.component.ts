import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'handle-error-content',
	templateUrl: './handle-error.component.html'
})

export class HandleError {
	@Input() data;
	serverMsg: string;
    constructor(public _activeModal: NgbActiveModal) {
        this.serverMsg = this.data;
    }
}
