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
import {RegularExpressionComponent} from "./regular-expression.component";


@Injectable()
export class RegularExpressionService {

  appUrl: string;
  regexpCategoryUrl: string = 'regexpCategory.json';
  regexpsUrl: string = 'regexps.json';

  insertRegexpCategoryUrl: string = 'insertRegexpCategory.json';
  updateRegexpCategoryUrl: string = 'updateRegexpCategory.json';
  deleteRegexpCategoryUrl: string = 'deleteRegexpCategory.json';
  insertRegexpsUrl: string = 'insertRegexps.json';
  updateRegexpsUrl: string = 'updateRegexps.json';
  saveRegexpUrl: string = 'saveRegexp.json';
  deleteRegexpsUrl: string = 'deleteRegexps.json';

  headers = new Headers({
    "Accept": "text/plain;charset=UTF-8"
  });

  constructor(private _http: Http,
              private _modal: NgbModal,
              private _app: AppState) {
    this.appUrl = this._app.ajaxUrl;
  }

  getRegexpCategory(): Observable<any> {
    const body = {};
    return this._http.post(`${this.appUrl}${this.regexpCategoryUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  getRegexps(val): Observable<any> {
    const body = {'CTG_CD':val};
    return this._http.post(`${this.appUrl}${this.regexpsUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  insertRegexpCategory(params): Observable<any> {
    const body = {'CTG_NM':params.CTG_NM,'CTG_CNTE':params.CTG_CNTE};
    return this._http.post(`${this.appUrl}${this.insertRegexpCategoryUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  updateRegexpCategory(params): Observable<any> {
    const body = {'CTG_CD':params.CTG_CD,'CTG_NM':params.CTG_NM,'CTG_CNTE':params.CTG_CNTE};
    return this._http.post(`${this.appUrl}${this.updateRegexpCategoryUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  deleteRegexpCategory(params): Observable<any> {
    const body = {'CTG_CD':params.CTG_CD};
    return this._http.post(`${this.appUrl}${this.deleteRegexpCategoryUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  insertRegexps(params): Observable<any> {
    const body = { 'CTG_CD':params.CTG_CD, 'RGEP_NM':params.RGEP_NM, 'RGEP_DATA':params.RGEP_DATA, 'RGEP_CNTE':params.RGEP_CNTE };
    return this._http.post(`${this.appUrl}${this.insertRegexpsUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  updateRegexps(params): Observable<any> {
    const body = { 'RGEP_CD':params.RGEP_CD, 'RGEP_NM':params.RGEP_NM, 'RGEP_DATA':params.RGEP_DATA, 'RGEP_CNTE':params.RGEP_CNTE };
    return this._http.post(`${this.appUrl}${this.updateRegexpsUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  saveRegexp(params,rgepData): Observable<any> {
    const body = { 'RGEP_CD':params.RGEP_CD, 'RGEP_DATA':rgepData };
    return this._http.post(`${this.appUrl}${this.saveRegexpUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  deleteRegexps(params): Observable<any> {
    const body = { 'CTG_CD':params.CTG_CD, 'RGEP_CD':params.RGEP_CD };
    return this._http.post(`${this.appUrl}${this.deleteRegexpsUrl}`, JSON.stringify(body), { headers: this.headers })
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
