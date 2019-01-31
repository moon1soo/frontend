import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import {NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { HandleError } from '../../../../modal/handle-error.component';

@Injectable()
export class MartService {
  patientData: string = 'patientData.json';
	// storeData: string[] = [];
	headers = new Headers({
		"Accept": "text/plain;charset=UTF-8"
	});
	secCode: string =  'doctor';

	patientList: any[] = [];
	clientIdx: number = 1;

	cohortIdx: string = '';
	constructor(
		private _http: Http,
		private _modal: NgbModal,
	) {
	}

  setCohortIdx(idx) {
	  this.cohortIdx = idx;
  }

  loadPatient(): Observable<any> {
		const body = JSON.stringify({
			"CHT_ID" : this.cohortIdx
		});
		return this._http.post(`${this.patientData}`, body, { headers: this.headers })
    .map(res => {
      const response = res.json();
      this.patientList = response.result;
      return this.patientList;
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
