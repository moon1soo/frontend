import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { AppState } from '../../app.state';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import notify from 'devextreme/ui/notify';
import { CohortService } from '../cohort.service';


import {
  Router,
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'toolbar-layout',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input('itemList') itemList: {dataSource: any; categoryGroup: string[]};

  manageVisible: boolean = false;
  shareVisible: boolean = false;
  parsingVisible: boolean = false;

  constructor(
    private _globals: AppState,
    private _modalService: NgbModal,
    private _router: Router,
    private _translate: TranslateService,
    private _app: AppState,
    private _cohortService: CohortService
  ) {

  }
  ngOnInit() {
    const authCd = sessionStorage.getItem('authCd');
    if( authCd == 'A' ) {
      this.manageVisible = true;
      this.shareVisible = true;
      this.parsingVisible = true;
    } else {
      this._cohortService.isCohortMartOwner().subscribe(res => {
        if( res && res.data && parseInt(res.data)>0) {
          this.shareVisible = true;
        }
      });
    }
/*
    if (sessionStorage.getItem('authCd') === 'A' || sessionStorage.getItem('authCd') === 'R') {
      this.adminYn = true;
      this.adminYn = false;
    }
*/
  }

}
