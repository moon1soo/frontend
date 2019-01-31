import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from '../../basicmode/dashboard.service';
import { StoreService } from '../../basicmode/store/store.service';
import { DashboardState } from '../../basicmode/dashboard.state';

@Component({
	selector: 'admin-layout-modal',
    templateUrl: './admin-modal.component.html',
    providers: [ DashboardService, StoreService, DashboardState ]
})

export class AdminModal implements OnInit {
    constructor(
        public activeModal: NgbActiveModal
    ) {

    }
    ngOnInit() {
       
    }
}