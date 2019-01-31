import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject }    from 'rxjs/Subject';
import { Http, Headers } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';
import { ReplaySubject } from "rxjs/ReplaySubject";



@Injectable()
export class CohortManageService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});

  cohortTableData: string = 'cohortTableData.json';

  allCohorturl: string = 'getAllCohort.json';
  cohortTableList: string = 'cohortTableList.json';

  loadMartOwnerUrl: String = 'loadMartOwner.json';
  loadApprovedStaffUrl: String = 'loadApprovedStaff.json';
  addMartOwnerUrl: String = 'addMartOwner.json';
  deleteMartOwnerUrl: String = 'deleteMartOwner.json';

  cohortSaveUrl: string = 'cohortSave.json';
  initialPatientUrl: string = 'initialPatient.json';
  countOriginalPatientUrl: string = 'countOriginalPatient.json';
  loadOriginalPatientUrl: string = 'loadOriginalPatient.json';
  loadMartTablesUrl: string = 'loadMartTables.json';

  loadMartTableGroupUrl: string = 'loadMartTableGroup.json';
  addMartTableGroupUrl: string = 'addMartTableGroup.json';
  updateMartTableGroupUrl: string = 'updateMartTableGroup.json';
  deleteMartTableGroupUrl: string = 'deleteMartTableGroup.json';

  loadMartTableColumnUrl: string = 'loadMartTableColumn.json';
  addMartTableColumnUrl: string = 'addMartTableColumn.json';
  updateMartTableColumnUrl: string = 'updateMartTableColumn.json';
  deleteMartTableColumnUrl: string = 'deleteMartTableColumn.json';
  tableColumnRegExsUrl: string = 'tableColumnRegExs.json';
  deleteTableColumnRegExUrl: string = 'deleteTableColumnRegEx.json';
  addTableColumnRegExUrl: string = 'addTableColumnRegEx.json';

  regexpCategoryUrl: string = 'regexpCategory.json';
  regexpsUrl: string = 'regexps.json';

  countSourceDataUrl: string = 'countSourceData.json';
  loadSourceDataUrl: string = 'loadSourceData.json';
  addMartTableUrl: string = 'addMartTable.json';
  deleteMartTableUrl: string = 'deleteMartTable.json';
  updateMartTableUrl: string = 'updateMartTable.json';

  sourceDataInitializeUrl: string = 'sourceDataInitialize.json';

  private tabRefresh = new Subject<number>();
  tabRefreshIdx = 0;
  tabRefresh$ = this.tabRefresh.asObservable();

  selectedMartId = new ReplaySubject<string>();
  selectedMartId$ = this.selectedMartId.asObservable();
  selectedMartName: string = '';
  selectedCohort: any = {};

  martRefresh = new ReplaySubject<string>();
  martRefresh$ = this.martRefresh.asObservable();

  tableId: string = '';
  selectedTableId = new ReplaySubject<string>();
  selectedTableId$ = this.selectedTableId.asObservable();

  sourceDataId: string = '';
  selectedSourceDataId = new ReplaySubject<string>();
  selectedSourceDataId$ = this.selectedSourceDataId.asObservable();

  tableSfx: string = '';
  sourceDataSql: string = '';

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
	) {
        this.appurl = this._app.ajaxUrl;
	}

  emittabRefresh() {
    this.tabRefresh.next(this.tabRefreshIdx++);
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

  loadMartOwner(): Observable<any> {
    var body = { "CHT_ID": this.selectedCohort.CHT_ID };
    return this._http.post(`${this.appurl}${this.loadMartOwnerUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  loadApprovedStaff(): Observable<any> {
    return this._http.get(`${this.appurl}${this.loadApprovedStaffUrl}`)
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  addMartOwner(data): Observable<any> {
    return this._http.post(`${this.appurl}${this.addMartOwnerUrl}`, JSON.stringify(data), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  deleteMartOwner(data):  Observable<any> {
    return this._http.post(`${this.appurl}${this.deleteMartOwnerUrl}`, JSON.stringify(data), { headers: this.headers })
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

  loadMartTables() : Observable<any> {
    var body = { "CHT_ID": this.selectedCohort.CHT_ID };
    return this._http.post(`${this.appurl}${this.loadMartTablesUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  emitSelectedTableId( tableId,tableSfx ) {
	  this.tableId = tableId;
	  this.tableSfx = tableSfx;
    this.selectedTableId.next( tableId );
  }

  getTableSfx():string {
	  return this.tableSfx;
  }
  /*
    addMartTable(data): Promise<any> {
      data.CHT_ID = this.selectedCohort.CHT_ID
      return this._http.post(`${this.appurl}${this.addMartTableUrl}`, JSON.stringify(data), { headers: this.headers })
        .toPromise()
        .then(response => {
          return response.json();
        })
        .catch(error => { throw 'Data Loading Error' });
      return new Promise( (resolve,reject) => {
        console.log('promise arrived');
        this._http.post(`${this.appurl}${this.addMartTableUrl}`, JSON.stringify(data), { headers: this.headers })
          .toPromise()
          .then (res => {
            const response = res.json();
            resolve(response);
          })
      });
  }
      */

  addMartTable(data): Promise<any> {
    return this._http.post(`${this.appurl}${this.addMartTableUrl}`, JSON.stringify(data), { headers: this.headers })
      .toPromise()
      .then(res => {
        const response = res.json();
//        return response;
        return Promise.resolve(response);
      });
  }

  updateMartTable(data):  Observable<any> {
    return this._http.post(`${this.appurl}${this.updateMartTableUrl}`, JSON.stringify(data), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  deleteMartTable(data):  Observable<any> {
    return this._http.post(`${this.appurl}${this.deleteMartTableUrl}`, JSON.stringify(data), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  loadMartTableGroups() : Observable<any> {
    var body = { "CHT_ID": this.selectedCohort.CHT_ID, "TBL_ID": this.tableId };
    return this._http.post(`${this.appurl}${this.loadMartTableGroupUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  loadMartTableGroup(tableId, tableSfx) : Observable<any> {
    var body = { "TBL_ID": tableId, 'tableName': 'FT_COH_PSO_' + tableSfx };
    return this._http.post(`${this.appurl}${this.loadMartTableGroupUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  addMartTableGroup(data): Observable<any> {
    return this._http.post(`${this.appurl}${this.addMartTableGroupUrl}`, JSON.stringify(data), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  updateMartTableGroup(data): Observable<any> {
    return this._http.post(`${this.appurl}${this.updateMartTableGroupUrl}`, JSON.stringify(data), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  deleteMartTableGroup(data):  Observable<any> {
    return this._http.post(`${this.appurl}${this.deleteMartTableGroupUrl}`, JSON.stringify(data), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  loadMartTableColumn() : Observable<any> {
    var body = { "CHT_ID": this.selectedCohort.CHT_ID, "TBL_ID": this.tableId };
    return this._http.post(`${this.appurl}${this.loadMartTableColumnUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  addMartTableColumn(data): Observable<any> {
    return this._http.post(`${this.appurl}${this.addMartTableColumnUrl}`, JSON.stringify(data), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  updateMartTableColumn(data): Observable<any> {
    return this._http.post(`${this.appurl}${this.updateMartTableColumnUrl}`, JSON.stringify(data), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  deleteMartTableColumn(data):  Observable<any> {
    return this._http.post(`${this.appurl}${this.deleteMartTableColumnUrl}`, JSON.stringify(data), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  tableColumnRegExs(col_id):  Observable<any> {
    var body = { 'COL_ID': col_id };
    return this._http.post(`${this.appurl}${this.tableColumnRegExsUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  deleteTableColumnRegEx(regexp):  Observable<any> {
    var body = { 'RGEP_ID': regexp };
    return this._http.post(`${this.appurl}${this.deleteTableColumnRegExUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  addTableColumnRegEx(col_id,regexp):  Observable<any> {
    var body = { 'COL_ID':col_id, 'RGEP_CD': regexp };
    return this._http.post(`${this.appurl}${this.addTableColumnRegExUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  getRegexpCategory(): Observable<any> {
    const body = {};
    return this._http.post(`${this.appurl}${this.regexpCategoryUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  getRegexps(val): Observable<any> {
    const body = {'CTG_CD':val};
    return this._http.post(`${this.appurl}${this.regexpsUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }


  emitSelectedSourceDataId( sourceDataId, tableSfx, sql ) {
	  this.sourceDataId = sourceDataId;
	  this.tableSfx = tableSfx;
    this.sourceDataSql = sql;
	  this.selectedSourceDataId.next( sourceDataId );
  }

  getSourceDataSql(): string {
    return this.sourceDataSql;
  }

  countSourceData(sql) : Observable<any> {
    var body = { 'TBL_ID': this.sourceDataId, 'sql': sql };
    return this._http.post(`${this.appurl}${this.countSourceDataUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  loadSourceData( skip, take, sql ) : Observable<any> {
    var body = { 'start': skip, 'size': take, 'sql': sql };
    return this._http.post(`${this.appurl}${this.loadSourceDataUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  sourceDataInitialize(sql): Observable<any> {
    var body = { 'TBL_ID': this.sourceDataId, 'TBL_SFX': this.tableSfx, 'sql': sql };
    return this._http.post(`${this.appurl}${this.sourceDataInitializeUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }
/*
  updateSourceDataSql() : Observable<any> {
    var body = { 'TBL_ID': this.sourceDataId, 'sql': this.sourceDataSql };
    return this._http.post(`${this.appurl}${this.updateSourceDataSqlUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }
*/

  // ajax 에러시 예외 처리
	private handleError(error: Response | any, caught: any) {
		const modalRef = this._modal.open(HandleError);
		modalRef.componentInstance.data = error;

		console.error('An error occurred', error);
		return Observable.throw(error.message || error);
	}
}
