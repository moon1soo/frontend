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
export class MartViewService {

  appUrl: string;
  parsingSubjectOriginalCnt: string = 'parsingSubjectOriginalCnt.json';
  parsingSubjectOriginalData: string = 'parsingSubjectOriginalData.json';
  regexpCategory: string = 'regexpCategory.json';
  regexps: string = 'regexps.json';
  headers = new Headers({
    "Accept": "text/plain;charset=UTF-8"
  });

  constructor(private _http: Http,
              private _modal: NgbModal,
              private _app: AppState) {
    this.appUrl = this._app.ajaxUrl;
  }

  getMartInfo() {

  }
  getParsingSubjectOriginalCnt(tblIdx: any, startDate:any, endDate:any): Observable<any> {
    const body = {'TBL_ID': tblIdx, 'startDate':startDate, 'endDate':endDate};
    return this._http.post(`${this.appUrl}${this.parsingSubjectOriginalCnt}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  getParsingSubjectOriginalData(tblIdx: any, page: any, size: any, startDate:any, endDate:any): Observable<any> {
    const body = {'TBL_ID': tblIdx, 'page':page, 'size':size, 'startDate':startDate, 'endDate':endDate};
    return this._http.post(`${this.appUrl}${this.parsingSubjectOriginalData}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  getRegexpCategory(): Observable<any> {
    const body = {};
    return this._http.post(`${this.appUrl}${this.regexpCategory}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  getRegexps(val): Observable<any> {
    const body = {'CTG_CD':val};
    return this._http.post(`${this.appUrl}${this.regexps}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  // ajax 에러시 예외 처리
  private handleError(error: Response | any, caught: any) {
    const modalRef = this._modal.open(HandleError);
    modalRef.componentInstance.data = error;

    console.error('An error occurred', error);
    return Observable.throw(error.message || error);
  }

}
