import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AppState} from '../../app.state';
import {Observable} from 'rxjs/Observable';
import {HandleError} from '../../modal/handle-error.component';

@Injectable()
export class ErrorLogService {
  appurl: string;
  headers = new Headers({
    'Accept': 'text/plain;charset=UTF-8'
  });

  url: any = {list : 'getErrorViewLogList.json', detail : 'getErrorViewLogDetail.json'};

  constructor(
    private _http: Http,
    private _modal: NgbModal,
    private _app: AppState
  ) {
    this.appurl = this._app.ajaxUrl;
  }

  getErrorLogList(page: number): Observable<any> {
    const body = {'page': page, 'displayCount': 100};
    return this._http.post(`${this.appurl}${this.url.list}`, JSON.stringify(body), { headers: this.headers})
      .map(res => {
        const response = res.json();
        return response;
      });
  }

  getErrorLogDetail(errLogId: string): Observable<any> {
    const param = {'errLogId' : errLogId};
    return this._http.post(`${this.appurl}${this.url.detail}`, JSON.stringify(param), { headers: this.headers})
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
