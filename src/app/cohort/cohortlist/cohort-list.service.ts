import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../app.state';

import { HandleError } from '../../modal/handle-error.component';

import * as Model from '../model/cohort.model';

@Injectable()
export class CohortListService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});
	myCohorturl: string = 'getMyCohort.json';
	allCohorturl: string = 'getAllCohort.json';
	requestShareCohorturl: string = 'requestShareCohort.json';
  deleteMyCohorturl: string = 'deleteMyCohort.json';

	myServerData: Model.myCohort[] = [];
	myServerClone: Model.myCohort[] = [];

	allServerData: Model.allCohort[] = [];
	allServerClone: Model.allCohort[] = [];

	stfNo = sessionStorage.getItem('stfNo');

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
	) {
        this.appurl = this._app.ajaxUrl;
	}

	// My Cohort
	myCohort(): Observable<any> {
    	const stfData = JSON.stringify({ 'STF_NO': this.stfNo });
    	return this._http.post(`${this.appurl}${this.myCohorturl}`, stfData, { headers: this.headers })
      		.map(res => {
				const response = res.json();
				this.myServerData = response.result;
				this.myServerClone = response.result.slice(0);
        return this.myServerData;
		})
		.catch((err, caught) => this.handleError(err, caught));
	}

	// All Cohort
	allCohort(): Observable<any> {
		const stfData = JSON.stringify({ 'STF_NO': this.stfNo });
    	return this._http.post(`${this.appurl}${this.allCohorturl}`, stfData, { headers: this.headers })
      		.map(res => {
				const response = res.json();
				this.allServerData = response.result;
				this.allServerClone = response.result.slice(0);
        return this.allServerData;
		})
		.catch((err, caught) => this.handleError(err, caught));
	}

	// request Share Cohort
	requestShareCohort( params: any ): Observable<any> {
//  requestShareCohort(cohortNo: string, reasonCnte: string, editAuthority: string, downloadAuthority: string): Observable<any> {
    const param = JSON.stringify({
                                          "CHT_ID": params.chtId
                                        , "CHT_NM": params.chtNm
                                        , "STF_NO": this.stfNo
                                        , "REQ_CNTE": params.reasonCnte
                                        , "REQ_ANONYMOUS": params.anonymous
                                        , "REQ_EDIT": params.editAuthority
                                        , "REQ_DOWNLOAD": params.downloadAuthority
                                      });
		return this._http.post(`${this.appurl}${this.requestShareCohorturl}`, param, { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// delete My Cohort
	deleteMyCohort(idx: string): Observable<any> {
		const body = JSON.stringify({ "CHT_ID": idx,'STF_NO': this.stfNo  });
		return this._http.post(`${this.appurl}${this.deleteMyCohorturl}`, body, { headers: this.headers })
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
