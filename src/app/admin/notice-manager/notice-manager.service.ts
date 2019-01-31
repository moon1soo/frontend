import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';

@Injectable()
export class NoticeManagerService {
	appurl: string;
	headers = new Headers({
		'Accept': 'text/plain;charset=UTF-8'
    });

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState
	) {
        this.appurl = this._app.ajaxUrl;
	}
    
    // 공지사항 조회
    getNotificationMsg(): Observable<any> {
        const url = 'getNotificationMsg.json';

        return this._http.get(`${this.appurl}${url}`, { headers: this.headers })
            .map(res => {
                const response = res.json();
                return response;
            })
            .catch((err, caught) => this.handleError(err, caught));
	}
    
    // 공지사항 업데이트
	getNotificationInsert(annmCnte: string, useYn: string): Observable<any> {
        const url = 'getNotificationInsert.json';
        const body = { annmCnte: annmCnte, useYn: useYn };

		return this._http.post(`${this.appurl}${url}`, body, { headers: this.headers })
			.map(res => {
				const response = res.json();
				return response;
            })
            .catch((err, caught) => this.handleError(err, caught));
	}

	// ajax 에러시 예외 처리
	private handleError(error: Response | any, caught: any) {
		
		const reg = /essage<\/b> \d+/g;
		const tempMessage = reg.exec(error._body)[0];
		const message = tempMessage.replace('essage</b> ', '');

		if (message === '000') {
			window.location.replace('index.do');
		}
		const modalRef = this._modal.open(HandleError);
		modalRef.componentInstance.data = message;

		console.error('An error occurred', error);
		return Observable.throw(error.message || error);
	}
}