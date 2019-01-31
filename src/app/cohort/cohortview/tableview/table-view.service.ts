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
export class TableViewService {

  appUrl: string;
  cohortTableData: string = 'cohortTableData.json';
  cohortTableDataCntUrl: string = 'cohortTableDataCnt.json';
  cohortTableDataUpdate: string = 'cohortTableDataUpdate.json';
  headers = new Headers({
    "Accept": "text/plain;charset=UTF-8"
  });

  constructor(private _http: Http,
              private _modal: NgbModal,
              private _app: AppState) {
    this.appUrl = this._app.ajaxUrl;
  }

  getTblDataCnt( tblIdx: any, startDate:any, endDate:any, anonymous:any, confirm:any, modified:any ): Observable<any> {
    const body = {'TBL_ID': tblIdx, 'startDate':startDate, 'endDate':endDate, 'anonymous':anonymous, 'confirm':confirm, 'modified':modified };
    return this._http.post(`${this.appUrl}${this.cohortTableDataCntUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

/*
  getTblData(tblIdx: any, page: any, size: any, startDate:any, endDate:any): Observable<any> {
    const body = {'TBL_ID': tblIdx, 'page':page, 'size':size, 'startDate':startDate, 'endDate':endDate};
    return this._http.post(`${this.appUrl}${this.cohortTableData}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }
*/

  updateColumns(tblNm: String, columns: string, col_id: any ): Observable<any> {
    const body = { 'tblNm': tblNm, 'columns': columns, 'COL_ID': col_id };
    return this._http.post(`${this.appUrl}${this.cohortTableDataUpdate}`, JSON.stringify(body), { headers: this.headers })
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
