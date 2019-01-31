import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppState } from '../../app.state';
import { CohortListService } from './cohort-list.service';
import { DeleteModal } from '../modal/delete-modal.component';
import { RequestShareCohortModal } from '../modal/request-share-cohort-modal.component';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../app.service';

import { CohortService } from '../cohort.service';

@Component({
  selector: 'cohort-list',
  templateUrl: './cohort-list.component.html',
  providers: [ CohortListService ]
})
export class CohortListComponent implements OnInit {
  closeResult: string;

  myCohorts: any[] = [];
  allCohorts: any[] = [];

  constructor(
    private _modalService: NgbModal,
    private _service: CohortListService,
    private _translate: TranslateService,
    private _router: Router,
    private _appService: AppService,
    private _app: AppState,
    private _cohortService: CohortService
  ) {
  }

  ngOnInit() {
    this.getMyCohortList();
    this.getAllCohortList();

    this._translate.use(this._appService.langInfo);
    this._appService.language$.subscribe(res => {
      this._translate.use(res);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }

  getMyCohortList() {
    this.myCohorts = [];
    /*////////////////////////////////// TEST ////////////////////////////////
          this.myCohorts.push({
            CHT_ID: 'data.CHT_ID',
            CHT_NM: 'data.CHT_NM',
            CHT_CNTE: 'data.CHT_CNTE',
            OWNER_DEPT_NM: 'data.OWNER_DEPT_NM',
            OWNER_STF_NM: 'data.OWNER_STF_NM',
            OWNERS: ['data.OWNERS'],
            REQ_ANONYMOUS: 'Y',
            REQ_EDIT: 'N',
            REQ_DOWNLOAD: 'Y',
            LOAD_DTM: '2018-06-30',
          });
    /////////////////////////////////// TEST ///////////////////////////////*/

    this._service.myCohort().subscribe(res => {
      for (let data of res) {
        this.myCohorts.push({
          CHT_ID: data.CHT_ID,
          CHT_NM: data.CHT_NM,
          CHT_SFX: data.CHT_SFX,
          CHT_CNTE: data.CHT_CNTE,
          OWNER_DEPT_NM: data.OWNER_DEPT_NM,
          OWNER_STF_NM: data.OWNER_STF_NM,
          OWNERS: data.OWNERS,
          REQ_ANONYMOUS: data.REQ_ANONYMOUS,
          REQ_EDIT: data.REQ_EDIT,
          REQ_DOWNLOAD: data.REQ_DOWNLOAD,
          LOAD_DTM: data.LOAD_DTM.substring(0, 10),
        });
      }
    });
  }

  getAllCohortList() {
    this.allCohorts = [];
    this._service.allCohort().subscribe(res => {
      for (let data of res) {
        var iconStatus = 0;
        if( parseInt(data.WCA) > 0 ) {
          iconStatus = 1
        } else {
          if( parseInt(data.WCAR) > 0 ) {
            iconStatus = 2
          }
        }
        this.allCohorts.push({
          CHT_ID: data.CHT_ID,
          CHT_NM: data.CHT_NM,
          CHT_SFX: data.CHT_SFX,
          CHT_CNTE: data.CHT_CNTE,
          OWNER_DEPT_NM: data.OWNER_DEPT_NM,
          OWNER_STF_NM: data.OWNER_STF_NM,
          OWNERS: data.OWNERS,
          LOAD_DTM: data.LOAD_DTM.substring(0, 10),
          iconStatus: iconStatus
        });
      }
    });
  }

  deleteMyCohort(event: MouseEvent, chtId: string, chtNm: string) {
    const modalRef = this._modalService.open(DeleteModal);
    modalRef.componentInstance.data = chtNm + ' 코호트';
    modalRef.result.then((result) => {
      if (result === 'Confirm') {
        this._service.deleteMyCohort(chtId).subscribe(res => {
          if(res) {
            this.getMyCohortList();
            this.getAllCohortList();
          }
        });
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${reason}`;
    });
  }

  requestShareCohort(event: MouseEvent, chtId: string, chtNm: string) {
    const modalRef = this._modalService.open(RequestShareCohortModal);
    modalRef.componentInstance.data = {
      title: chtNm,
      content: ''
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {
        result.chtId = chtId;
        result.chtNm = chtNm;
        this._service.requestShareCohort( result ).subscribe(res => {
          if(res) {
            this.allCohorts = []
            this.getAllCohortList();
          }
        });
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${reason}`;
    });
  }

  openCohort( idx, nm, s, a, e, d ) {
    this._cohortService.setCohortViewParams( idx, nm, s, a, e, d );
    this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortView`, { skipLocationChange: true });
  }

}
