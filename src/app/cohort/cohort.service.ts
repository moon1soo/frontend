import { Injectable } from "@angular/core";
import { Subject }    from 'rxjs/Subject';
import { Http, Headers } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../app.state';
import { HandleError } from '../modal/handle-error.component';
import {Observable} from "rxjs/Observable";



@Injectable()
export class CohortService {
  appurl: string;
  headers = new Headers({
    "Accept": "text/plain;charset=UTF-8"
  });


  isCohortMartOwnerUrl: string = 'isCohortMartOwner.json';

  cohortIdx: string = '';
  cohortName: string = '';
  cohortSfx: string = '';
  anonymousRights: boolean = false;
  editRights: boolean = false;
  downloadRights: boolean = false;

  cohortTableIdx: string = '';


  constructor(
    private _http: Http,
    private _modal: NgbModal,
    private _app: AppState,
  ) {
    this.appurl = this._app.ajaxUrl;
  }

  setCohortViewParams( idx, nm, s, a, e, d ) {
    this.cohortIdx = idx
    this.cohortName = nm;
    this.cohortSfx = s;
    this.anonymousRights = a=='Y'?true:false;
    this.editRights = e=='Y'?true:false;
    this.downloadRights = d=='Y'?true:false;
  }

  getCohortIdx() {
    return this.cohortIdx;
  }

  getCohortName() {
    return this.cohortName;
  }

  getCohortSfx() {
    return this.cohortSfx;
  }

  setCohortTableViewParams( idx ) {
    this.cohortTableIdx = idx;
  }

  getCohortViewTableidx() {
    return this.cohortTableIdx;
  }

  getAnonymousRights() {
    return this.anonymousRights;
  }
  getEditRights() {
    return this.editRights;
  }

  getDownloadRights() {
    return this.downloadRights;
  }

  isCohortMartOwner(): Observable<any> {
    const body = {'STF_NO': sessionStorage.getItem('stfNo')};
    return this._http.post(`${this.appurl}${this.isCohortMartOwnerUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }
  private handleError(error: Response | any, caught: any) {

    const headers = error.headers;
    let errorLogId = 'UNKNOWN';

    headers.forEach((value, key) => {
      if (key.toUpperCase() === 'ERRORLOGID') {
        errorLogId = value;
      }
    });

    if (errorLogId[0] === '000') {
      console.log('세션이 만료되었습니다.');
      window.location.replace('index.do');
    } else {
      const modalRef = this._modal.open(HandleError);
      modalRef.componentInstance.data = errorLogId;
    }

    console.error('An error occurred', error);
    return Observable.throw(error.message || error);
  }

}
