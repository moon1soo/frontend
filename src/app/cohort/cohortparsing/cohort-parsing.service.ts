import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject }    from 'rxjs/Subject';
import { Http, Headers } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';
import { ReplaySubject } from "rxjs/ReplaySubject";



@Injectable()
export class CohortParsingService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});

  cohortTableData: string = 'cohortTableData.json';

  allCohorturl: string = 'getAllCohort.json';
  cohortTableList: string = 'cohortTableList.json';
  cohortSaveUrl: string = 'cohortSave.json';
  initialPatientUrl: string = 'initialPatient.json';
  countOriginalPatientUrl: string = 'countOriginalPatient.json';
  loadOriginalPatientUrl: string = 'loadOriginalPatient.json';

  selectedMartId = new ReplaySubject<string>();
  selectedMartId$ = this.selectedMartId.asObservable();
  selectedMartName: string = '';
  selectedCohort: any = {};

  martRefresh = new ReplaySubject<string>();
  martRefresh$ = this.martRefresh.asObservable();

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
	) {
        this.appurl = this._app.ajaxUrl;
	}

  emitMartRefresh( martName: string ) {
	  this.martRefresh.next( martName );
  }

  emitSelectedMartId( martId, cohort ) {
	  this.selectedCohort = cohort;
    this.selectedMartId.next(martId);
  }

  setSelectedMart( martId, martName ) {
    this.selectedMartId = martId;
    this.selectedMartName = martName;
  }

  getSelectedCohort() {
	  return this.selectedCohort;
  }

  getSelectedMartId() {
    return this.selectedMartId;
  }

  allCohort(): Observable<any> {
    const stfData = JSON.stringify({  });
    return this._http.post(`${this.appurl}${this.allCohorturl}`, stfData, { headers: this.headers })
      .map(res => {
        const response = res.json();
        response.result.forEach((key,value) => {
          if( key.CHT_ID == this.selectedCohort.CHT_ID ) {
            this.selectedCohort = key;
          }
        });
        return response.result;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  getAllTbl(): Observable<any> {
    return this._http.post(`${this.appurl}${this.cohortTableList}`, { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
		.catch((err, caught) => this.handleError(err, caught));
	}

  getTblData(tblIdx: any): Observable<any> {
    const body = {'TBL_ID': tblIdx};
    return this._http.post(`${this.appurl}${this.cohortTableData}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  cohortSave(mart: any) : Observable<any> {
    return this._http.post(`${this.appurl}${this.cohortSaveUrl}`, JSON.stringify(mart), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  initialPatient() : Observable<any> {
    return this._http.post(`${this.appurl}${this.initialPatientUrl}`, JSON.stringify(this.selectedCohort), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  countOriginalPatient() : Observable<any> {
    var body = { 'suffix': this.selectedCohort.CHT_SFX.toUpperCase() };
    return this._http.post(`${this.appurl}${this.countOriginalPatientUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  loadOriginalPatient( skip, take ) : Observable<any> {
	  var body = { 'start': skip, 'size': take, 'suffix': this.selectedCohort.CHT_SFX.toUpperCase() };
    return this._http.post(`${this.appurl}${this.loadOriginalPatientUrl}`, JSON.stringify(body), { headers: this.headers })
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
