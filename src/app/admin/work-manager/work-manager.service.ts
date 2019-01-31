import {Injectable} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Http, Headers} from '@angular/http';
import {AppState} from '../../app.state';
import {HandleError} from '../../modal/handle-error.component';
import {Observable} from 'rxjs/Observable';
import {StompConfig, StompService} from "@stomp/ng2-stompjs";
import {Subject} from "rxjs/Subject";

@Injectable()
export class WorkManagerService {
  appurl: string;
  headers = new Headers({
    'Accept': 'text/plain;charset=UTF-8'
  });

  private url = {
    server : 'work/manager/server.json',
    serverDetail : '/api/work/manager/serverDetail.json',
    destroy : '/api/work/manager/destroy.json',
    cancel : '/api/work/manager/cancel.json'
  };

  constructor (
    private _http: Http,
    private _modal: NgbModal,
    private _app: AppState
  ) {
    this.appurl = this._app.ajaxUrl;
  }

  getServerList(): Observable<any> {
    const body = {};
    return this._http.post(`${this.appurl}${this.url.server}`, JSON.stringify(body), {headers: this.headers})
      .map(res => {
        const response = res.json();
        return response;
      }).catch((err, caught) => this.handleError(err, caught));
  }

  private $serverDetail(host: string): Observable<any> {
    const body = {};
    return this._http.post(`${this.appurl}${host}${this.url.serverDetail}`, JSON.stringify(body), {headers: this.headers})
      .map(res => {
        const response = res.json();
        return response;
      }).catch((err, caught) => this.handleError(err, caught));
  }

  destroyWorkGroup(host: string, name: string): Observable<any> {
    const param = {'name': name};
    return this._http.post(`${this.appurl}${host}${this.url.destroy}`, {}, {headers: this.headers, params: param})
      .map(res => {
      const response = res.json();
      return response;
    });
  }

  cancelWork(host: string, workName: string, workIndex: string): Observable<any> {
    const param = {'workName': workName, 'workIndex': workIndex};

    return this._http.post(`${this.appurl}${host}${this.url.cancel}`, {}, {headers: this.headers, params: param})
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

    console.error('An error occurred.', error);
    return Observable.throw(error.message || error);
  }
}
