import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent, DxLoadPanelModule } from 'devextreme-angular';

import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { AppService } from "../../app.service";
import { AppState } from '../../app.state';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';


import { CohortManageService } from './cohort-manage.service';
// import { DeleteModal } from '../../modal/delete-modal.component';
import {TableViewComponent} from "./tableview/table-view.component";

@Component({
    selector: 'cohort-manage',
    templateUrl: './cohort-manage.component.html',
    styleUrls: [ './cohort-manage.component.css' ],
  providers: [
    CohortManageService
  ]
})
export class CohortManageComponent implements OnInit {

  @Output() select = new EventEmitter();
  isMenuCollapsed: boolean = true;

  idx: string;


  selectApvTxt : string;
  constructor(
      private _modalService: NgbModal,
      public _service: CohortManageService,
      private _translate: TranslateService,
      private _router: Router,
      private _appService: AppService,
      private _app: AppState,
      private router: ActivatedRoute
  ) {}
  ngOnInit() {
/*
    const vouter = document.querySelector('.v-outer') as HTMLElement;
    vouter.style.maxWidth = '50%';
    vouter.style.minWidth = '15%';
*/
    this.router.params.subscribe( params => { this.idx = params.idx; });

    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._translate.use(this._appService.langInfo);
    this._appService.language$.subscribe(res => {
      this._translate.use(res);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

}
