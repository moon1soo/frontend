import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers } from '@angular/http';

import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';

import { AppState } from '../../../app.state';
//import * as Model from '../model/syapse.model';

import 'rxjs/add/operator/toPromise';
import CustomStore from 'devextreme/data/custom_store';
import {HandleError} from '../../../modal/handle-error.component';


@Injectable()
export class PatientViewService {

  appUrl: string;
  cohortPatientDataUrl: string = 'cohortPatientData.json';
  cohortPatientDataCntUrl: string = 'cohortPatientDataCnt.json';
  deleteCohortPatientUrl: string = 'deleteCohortPatient.json';
  headers = new Headers({
    "Accept": "text/plain;charset=UTF-8"
  });

  constructor(private _http: Http,
              private _modal: NgbModal,
              private _app: AppState) {
    this.appUrl = this._app.ajaxUrl;
  }

  cohortPatientDataCnt( tblNm: any ): Observable<any> {
    const body = {'tblNm': tblNm };
    return this._http.post(`${this.appUrl}${this.cohortPatientDataCntUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  cohortPatientData( tblNm, skip, take, anonymous, sort ) : Observable<any> {
    var body = { 'tblNm': tblNm, 'start': skip, 'size': take, 'anonymous': anonymous, 'sort': sort };
    return this._http.post(`${this.appUrl}${this.cohortPatientDataUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  deleteCohortPatient( chtId, tblNm, ptNo ) : Observable<any> {
    var body = { 'CHT_ID': chtId, 'tblNm': tblNm, 'PT_NO': ptNo };
    return this._http.post(`${this.appUrl}${this.deleteCohortPatientUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

	// ajax 에러시 예외 처리
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
