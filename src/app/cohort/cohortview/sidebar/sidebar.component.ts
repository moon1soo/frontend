import { Component, Output, EventEmitter, OnInit, Input, Renderer } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { CohortViewService } from '../cohort-view.service';

import { AppState } from '../../../app.state';
import { CohortService } from "../../cohort.service";
import { RelatedDownloadModal } from "../../modal/related-download-modal.component";


@Component({
	selector: 'sidebar-layout',
	templateUrl: './sidebar.component.html',
  styleUrls: [ './sidebar.component.css' ],

})
export class SidebarComponent implements OnInit {
	@Output() toggle = new EventEmitter();
	closeResult: string;
	appurl: string;
	adminYn: boolean = false;
  cohortName: string;

  tbls: any[] = [];

  idx:string = '';

  excelUrl: any;
  exFileName: string;
  exFilePath: string;

  constructor(
		private _app: AppState,
		private _router: Router,
		private _modalService: NgbModal,
    public _service: CohortViewService,
    private _cohortService: CohortService
	) {
		this.appurl = this._app.ajaxUrl;
    this.excelUrl = `${this._app.ajaxUrl}excelDownLoad.do`;
		this.idx = this._cohortService.getCohortIdx();
		this.cohortName = this._cohortService.getCohortName();
	}
	ngOnInit() {
    this.getTbl();
	}

	toggleMenu() {
    this.toggle.emit();
	}

  isRelatedDownload() {
    if( this._cohortService.getDownloadRights() == true && this.cohortName.indexOf('Syapse') < 0)
      return true;
    else
      return false;
  }

  initialActive() {
    for( var i=0; i<this.tbls.length;i++) {
      this.tbls[i].done = false;
    }
  }

  getTbl() {
    this._service.getTbl(this.idx).subscribe(res => {
      if( this.cohortName.indexOf('Syapse') < 0 && this._cohortService.getAnonymousRights()==false) {
        this.tbls.push({
          TBL_ID: '0'
          ,PRC_NM: 'Patient'
          ,PRC_CNTE: 'Patient'
          ,TBL_SFX: this._cohortService.getCohortSfx()
          ,done: false
        });
      }
      for (let data of res.result) {
        this.tbls.push({
          TBL_ID: data.TBL_ID
          ,PRC_NM: data.PRC_NM
          ,PRC_CNTE: data.PRC_CNTE
          ,TBL_SFX: data.TBL_SFX
          ,done: false
        });
      }
      if( this.tbls.length > 0 ) {
        this.tbls[0].done = true;
        if( this.tbls[0].TBL_ID == '0' ) {
          this._service.setCohortTableSfx(this.tbls[0].TBL_SFX);
          this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortView/patientview`, { skipLocationChange: true });
        } else {
          this._service.setCohortTableIdx(this.tbls[0].TBL_ID);
          this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortView/tblView/`, {skipLocationChange: true});
        }
      }
    });
  }

  openTable(i, tblId) {
    this.initialActive();
    if(this.tbls[i])
      this.tbls[i]['done']=!this.tbls[i]['done'];
    if( tblId == '0' ) {
      this._service.setCohortTableSfx(this.tbls[0].TBL_SFX);
      this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortView/patientview`, { skipLocationChange: true });
    } else {
      this._service.setCohortTableIdx(tblId);
      this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortView/tblView/`, { skipLocationChange: true });
    }

  }

  excelDownload(): void {
    const elem = document.getElementById('btn-submit-related-excel');
    setTimeout(() => {
      let event = document.createEvent('Event');
      event.initEvent('click', true, true);
      elem.dispatchEvent(event);
    }, 10);
  }

  relatedDownload() {
    const modalRef = this._modalService.open(RelatedDownloadModal, {
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {seq: 'cohortTables', mode: 'cohort', url:'cohortTablesExcelDownload.json', stfNo: sessionStorage.getItem('stfNo'), anonymous: this._cohortService.getAnonymousRights(),tbls:this.tbls };
    modalRef.result.then((result) => {
      if (result.path && result.name) {
        this.exFilePath = result.path;
        this.exFileName = result.name;
        this.excelDownload();
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${reason}`;
    });
  }

}
