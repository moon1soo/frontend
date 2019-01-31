import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject }    from 'rxjs/Subject';
import { Http, Headers } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';
import {ReplaySubject} from "rxjs/ReplaySubject";



@Injectable()
export class CohortViewService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});

  cohortTableList: string = 'cohortTableList.json';
  cohortTableData: string = 'cohortTableData.json';

  editRights: boolean = false;
  downloadRights: boolean = false;

  //  cohortTableIdx: string = '';
  private cohortTableIdx = new ReplaySubject<string>();
  cohortTableIdx$ = this.cohortTableIdx.asObservable();

  private cohortTableSfx = new ReplaySubject<string>();
  cohortTableSfx$ = this.cohortTableSfx.asObservable();

  constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
	) {
        this.appurl = this._app.ajaxUrl;
	}

  setCohortTableIdx( idx ) {
    this.cohortTableIdx.next(idx);
  }

  setCohortTableSfx( idx ) {
    this.cohortTableSfx.next(idx);
  }

  getTbl(chtNo: any): Observable<any> {
    const body = {'CHT_ID': chtNo};
    return this._http.post(`${this.appurl}${this.cohortTableList}`, JSON.stringify(body), { headers: this.headers })
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
