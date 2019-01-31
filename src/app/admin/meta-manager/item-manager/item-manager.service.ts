import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { AppState } from '../../../app.state';
import { HandleError } from '../../../modal/handle-error.component';

@Injectable()
export class ItemManagerService {
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
	
	// 카테고리 필터 리스트 불러오기
    getCategoryList(): Observable<any> {
		const url = 'getMetaCategoryList.json';

        return this._http.get(`${this.appurl}${url}`, { headers: this.headers })
            .map(res => {
                const response = res.json();
                return response;
            });
	}

	// 항목 불러오기
    getItemList(): Observable<any> {
		const url = 'getMetaItemList.json';

        return this._http.get(`${this.appurl}${url}`, { headers: this.headers })
            .map(res => {
                const response = res.json();
                return response;
            });
	}
	

	getMetaColumnOnTableList(type: any, category: any): Observable<any> {
		const url = 'getMetaColumnOnTableList.json';
		const params = new URLSearchParams();

		params.set('type', type);
		params.set('category', category);

        return this._http.get(`${this.appurl}${url}`, { search: params, headers: this.headers })
            .map(res => {
                const response = res.json();
                return response;
            });
	}

	getDataTypeList(): Observable<any> {
		const url = 'getDataTypeList.json';

        return this._http.get(`${this.appurl}${url}`, { headers: this.headers })
            .map(res => {
                const response = res.json();
                return response;
            });
	}

	getFilterTypeList(): Observable<any> {
		const url = 'getFilterTypeList.json';

        return this._http.get(`${this.appurl}${url}`, { headers: this.headers })
            .map(res => {
                const response = res.json();
                return response;
            });
	}

	getLookUpTableTypeList(): Observable<any> {
		const url = 'getLookUpTableTypeList.json';

        return this._http.get(`${this.appurl}${url}`, { headers: this.headers })
            .map(res => {
                const response = res.json();
                return response;
            });
	}

	mergeIntoItem(data: any): Observable<any> {
		const url = 'mergeIntoItem.json';
		const body = data;

		return this._http.post(`${this.appurl}${url}`, body, { headers: this.headers })
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