import { Injectable, OnInit } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { Http,Response } from '@angular/http';
import { HttpModule }      from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { InitService } from './init.service';
import { HandleError } from './modal/handle-error.component';

@Injectable()
export class AppState {

    ajaxUrl: string = this._init.getHost().host;
    socketUrl: string = this._init.getHost().socket;

    tableText= {
        load: 'Loading',
        noData: 'No data'
    };
    trans: any = {
		checkAll: null,
		uncheckAll: null,
		checkedPlural: null,
		searchEmptyResult: null,
        searchNoRenderText: null,
        allSelected: null,
        oldYear: null,
        oldMonth: null,
        day: null,
        week: null,
        pactEmergency: null,
        pactIn: null,
        pactOut: null,
        jan: null,
        feb: null,
        mar: null,
        apr: null,
        may: null,
        jun: null,
        jul: null,
        aug: null,
        sep: null,
        oct: null,
        nov: null,
        dec: null,
        next: null,
        apply: null,
        cancel: null,
        category: null,
        noRisk: null,
        lowRisk: null,
        highRisk: null,
        plusRisk: null,
        minusRisk: null,
        group1: null,
        group2: null,
        group3: null,
        group4: null,
        group5: null,
        group6: null
    };
    txt: any = {
		checkAll: 'renewal2017.button.all', //전체
		uncheckAll: 'renewal2017.button.uncheck-all',  //선택해제
		checkedPlural: 'renewal2017.button.checked-plural',//개 선택
		searchEmptyResult: 'renewal2017.p.search-empty-result',
        searchNoRenderText: 'renewal2017.p.search-no-render-text',
        allSelected: 'renewal2017.button.check-all', //전체 선택
        oldYear: 'renewal2017.date.old-year', //세,
        oldMonth: 'renewal2017.date.old-month', //개월
        day: 'renewal2017.date.day', //일,
        week: 'renewal2017.date.week', //주
        pactEmergency: 'research.pact.emergency', //응급
        pactIn: 'research.pact.in', //입원
        pactOut: 'research.pact.out', //외래
        month: 'renewal2017.date.month',
        jan: 'renewal2017.date.January',
        feb: 'renewal2017.date.Febuary',
        mar: 'renewal2017.date.March',
        apr: 'renewal2017.date.April',
        may: 'renewal2017.date.May',
        jun: 'renewal2017.date.June',
        jul: 'renewal2017.date.July',
        aug: 'renewal2017.date.August',
        sep: 'renewal2017.date.September',
        oct: 'renewal2017.date.October',
        nov: 'renewal2017.date.November',
        dec: 'renewal2017.date.December',
        next: 'renewal2017.label.next',
        apply: 'renewal2017.button.apply',
        cancel: 'renewal2017.button.cancel',
        category: 'renewal2017.nurs.assessment.common.group.title',
        noRisk: 'renewal2017.nurs.assessment.common.category.no',
        lowRisk: 'renewal2017.nurs.assessment.common.category.mid',
        highRisk: 'renewal2017.nurs.assessment.common.category.high',
        plusRisk: 'renewal2017.nurs.assessment.common.category.plus',
        minusRisk: 'renewal2017.nurs.assessment.common.category.minus',
        group1: 'renewal2017.nurs.assessment.common.group.1',
        group2: 'renewal2017.nurs.assessment.common.group.2',
        group3: 'renewal2017.nurs.assessment.common.group.3',
        group4: 'renewal2017.nurs.assessment.common.group.4',
        group5: 'renewal2017.nurs.assessment.common.group.5',
        group6: 'renewal2017.nurs.assessment.common.group.6'
    };
    // 날짜 형식 관리
    defaultStartDay = {year: 2015, month: 4, day: 23};
    today = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};    
    lastDate = {year: new Date().getFullYear()-110, month: new Date().getMonth() + 1, day: new Date().getDate()};    
    defaultStartDayStr = this.dateConvertStr(this.defaultStartDay);
    todayStr = this.dateConvertStr(this.today);    

    constructor(
        private _http: Http,
        private _translate: TranslateService,
        private _modal: NgbModal,
        private _init: InitService
     ) {        
        setTimeout(() => {
            for(let key of Object.keys(this.txt)) {
                if(this.txt[key]) {
                    this._translate.get(this.txt[key]).subscribe(res => {
                        this.trans[key] = res;
                    });
                }
            }
        }, 10);
    }    
   
    dateConvertStr(date: {year: number; month: number; day: number}): string {
        return `${date['year']}-${date['month'] < 10 ? '0'+date['month'] : date['month']}-${date['day'] < 10 ? '0'+date['day'] : date['day']}`;
    }
    dateConvertNgb(date: string): {year: number; month: number; day: number} {
        const str = date.split('-');
        return {year: Number(str[0]), month: Number(str[1]), day: Number(str[2])};
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
