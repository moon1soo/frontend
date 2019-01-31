import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../app.state';
import { HandleError } from '../../modal/handle-error.component';

@Injectable()
export class IrbOverviewService {
	appurl: string;
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
    });

	constructor(
		private _http: Http,
		private _modal: NgbModal,
		private _app: AppState
	) {
        this.appurl = this._app.ajaxUrl;
    }
    
    // Top 10 List
    getTop10List(year: any, month: any, criteria: any): Observable<any> {
		const url = `getTop10List.json`;
		const param = `?year=${year}&month=${month}&criteria=${criteria}`;

        return this._http.get(`${this.appurl}${url}${param}`, { headers: this.headers })
            .map(res => {
                const response = res.json();
                return response;
            }).catch((err, caught) => this.handleError(err, caught));
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