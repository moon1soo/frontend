import { Injectable } from "@angular/core";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';

@Injectable()
export class RelatedDownloadModalService {

	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
    });

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState,
	) {
		this.appurl = this._app.ajaxUrl;
	}

	// 엑셀 생성
	executeExcel(url, stfNo, tblLst: any, tblNm, startDate, endDate, anonymous
//                 {seq: string; mode: string; stfNo: string; tblNm:string, idx: string; startDate: string; endDate: string; anonymous: any; confirm: string; modified: string; url: string;}
                 ): Observable<any> {
    var params = { stfNo: stfNo, tblLst: tblLst, tblNm: tblNm
      , startDate: startDate, endDate: endDate
      , anonymous: anonymous
//      , confirm: data.confirm, modified:data.modified
    };

		return this._http.post(`${this.appurl}${url}`, JSON.stringify(params), { headers: this.headers })
			.map(res => {
				const response = res.json();
        		return response;
			})
			.catch((err, caught) => this.handleError(err, caught));
	}

	// ajax 에러시 예외 처리
	private handleError(error: Response | any, caught: any) {

	  console.log(error);
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
