import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { Http, Response } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { HandleError } from './modal/handle-error.component';

@Injectable()
export class AppService {
    
	staffInfo: {name: string; number: string};
    langInfo: string;
    convertStoreVo: any;
    workIndex: any;

    private switchTheme = new Subject<any>();
    private language = new Subject<string>();
    private switchStore = new Subject<any>();

    private _initBaseUrl: any;
    
    switchTheme$ = this.switchTheme.asObservable();
    language$ = this.language.asObservable();    
    switchStore$ = this.switchStore.asObservable();
    
    constructor(
        public translate: TranslateService,
        private _http: Http,
        private _modal: NgbModal
	) {
		if(localStorage.getItem('language')) {
            this.langInfo = localStorage.getItem('language');
        } else {
            this.langInfo = 'ko';
            // let browserLang = translate.getBrowserLang();
            // browserLang.match(/ko|en/) ? this.langInfo = browserLang : this.langInfo = 'ko';
		}		
    }   

    get convertStore(): any {
        return this.convertStoreVo;
    }
    get wordIndex(): any {
        return this.workIndex;
    }
    set setConvertStore(data: any) {
        this.convertStoreVo = data;
    }
    set setWorkIndex(data: any) {
        this.workIndex = data;
    }
   
    setTheme(theme: string) {
        this.switchTheme.next(theme);
    }
    setLang(lang: string) {
        this.langInfo = lang;
        this.language.next(lang);
    }
    setSwitchStore(store: any) {
        const select = store.basicStore.select.split(',');
        const newSelect = [];
        
        // for(let i=0; i<select.length; i++) {
        //     newSelect.push(`group_c${i+3}`);
        // }
        // store.basicStore.select = newSelect.join(',');
        // for(let i=0; i<store.groupInfoListStore.length; i++) {
        //     store.groupInfoListStore[i].groupId = newSelect[i];
        // }         
        this.convertStoreVo = store;
        sessionStorage.setItem('powermodeStore', JSON.stringify(store));  
        this.switchStore.next(store);
    }
    
    setReloadPaper() {
        
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