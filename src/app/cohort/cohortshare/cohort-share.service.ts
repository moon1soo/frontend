import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';

@Injectable()
export class CohortShareService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});
  countRequestShareCohortUrl: string = 'countRequestShareCohort.json';
  requestShareCohortListUrl: string = 'requestShareCohortList.json';
  updateRequestShareCohortUrl: string = 'updateRequestShareCohort.json';
	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
	) {
        this.appurl = this._app.ajaxUrl;
	}

  countRequestShareCohort() : Observable<any> {
    var body = {};
    if( sessionStorage.getItem('authCd') == 'B' ) {
    } else {
      body['STF_NO'] = sessionStorage.getItem('stfNo');
    }
    return this._http.post(`${this.appurl}${this.countRequestShareCohortUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  requestShareCohortList( skip, take, sort ) : Observable<any> {
    var body = { 'start': skip, 'size': take, 'sort': sort };
    if( sessionStorage.getItem('authCd') == 'B' ) {
    } else {
      body['STF_NO'] = sessionStorage.getItem('stfNo');
    }
    return this._http.post(`${this.appurl}${this.requestShareCohortListUrl}`, JSON.stringify(body), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      })
      .catch((err, caught) => this.handleError(err, caught));
  }

  updateRequestShareCohort(param: any){
    return this._http.post(`${this.appurl}${this.updateRequestShareCohortUrl}`, JSON.stringify(param), { headers: this.headers })
      .map(res => {
        const response = res.json();
        return response;
      });
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

  getApproval() {
    return approval;
  }
}

export class Approval {
  Key: string;
  Value: string;
}

let approval: Approval[] = [{
  "Key": "Y",
  "Value": "승인"
}, {
  "Key": "N",
  "Value": "비승인"
}];
