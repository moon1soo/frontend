import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AppState} from '../../app.state';
import {Observable} from 'rxjs/Observable';
import {HandleError} from '../../modal/handle-error.component';

@Injectable()
export class UserTableManagerService {
  appurl: string;
  headers = new Headers({
    'Accept': 'text/plain;charset=UTF-8'
  });

  url = {
    list : 'getUserTableList.json',
    drop : 'dropUserTableList.json'
  };

  constructor(
    private _http: Http,
    private _modal: NgbModal,
    private _app: AppState
  ) {
    this.appurl = this._app.ajaxUrl;
  }

  getUserTableList(page: number): Observable<any> {
    const body = {'page': page, 'displayCount': 500};
    return this._http.post(`${this.appurl}${this.url.list}`, JSON.stringify(body), { headers: this.headers})
      .map(res => {
        const response = res.json();
        return response;
      });
  }

  dropUserTable(selectedRows: any): Observable<any>{
    const body = {tableCondition: []};
    for(let selectedElement of selectedRows){
      body.tableCondition.push(selectedElement.tableName);
    }

    return this._http.post(`${this.appurl}${this.url.drop}`, JSON.stringify(body), { headers: this.headers})
      .map(res => {
        const response = res.json();
        return response;
      });
      // .catch((err, caught) => this.handleError(err, caught));
  }

}
