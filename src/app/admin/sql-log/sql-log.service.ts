import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';

@Injectable()
export class SqlLogService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
    });
    
    url: string = 'getSqlViewLogList.json';

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState
	) {
        this.appurl = this._app.ajaxUrl;
	}
    
    getSqlViewLogList(page: any): Observable<any> {
        const body = {'page': page, 'size': 100};

        return this._http.post(`${this.appurl}${this.url}`, JSON.stringify(body), { headers: this.headers })
            .map(res => {
                const response = res.json();
                return response;
            });
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