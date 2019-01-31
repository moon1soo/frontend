import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { Observable } from 'rxjs/Observable';

import { StoreService } from './store/store.service';
import { DashboardService } from './dashboard.service';
import { AppState } from 'app/app.state';

declare const $: any;
import * as moment from 'moment';

@Component({
 	selector: 'dashboard-datepicker',
	templateUrl: './dashboard.datepicker.html'
})

export class DashboardDatepicker implements OnInit, OnChanges {
    @Output() secDate = new EventEmitter();
    @Input('storageDate') storageDate: {fromDt: string; toDt: string};
    @ViewChild(DaterangePickerComponent)
    public picker: DaterangePickerComponent;

    newDt = new Date();
    dataSource: any = {
        fromDt: null,
        toDt: null     
    };
    displayDate: string;
	daterange: any = {};
	applyClicked: boolean = false;
    transTxt = {
        OCS: `OCS ${this._app.trans.next}`,
        EMR: `EMR ${this._app.trans.next}`,
        HIS: `HIS ${this._app.trans.next}`
    };
    options: any = {
        showDropdowns: true,
        linkedCalendars: false,
        locale: { 
            format: 'YYYY-MM-DD',
            separator: ' ~ ',
            applyLabel: this._app.trans.apply,
            cancelLabel: this._app.trans.cancel
        },
        alwaysShowCalendars: true,
        autoApply: false,
        buttonClasses: 'btn btn-md',
        opens: 'right',
        ranges: {
            OCS: ['2000-1-1', moment()],
            EMR: ['2004-10-15', moment()],
            HIS: ['2016-11-19', moment()]
        },
        showCustomRangeLabel: false,
        autoUpdateInput: false,
        maxDate: moment().endOf("day"),
        // startDate:  moment().subtract(1, 'year').startOf("day"),
        startDate: moment().subtract(1, 'year').subtract(1, 'days'),
        endDate: moment().subtract(1, 'days')
    };

    constructor(
        private _daterangepickerOptions: DaterangepickerConfig,
        private _fb: FormBuilder,
        private _store: StoreService,
        private _app: AppState
    ) {
		this._daterangepickerOptions.skipCSS = true;
		 
    }
    ngOnInit() {
        moment.locale('kr', {
            monthsShort : `${this._app.trans.jan}_${this._app.trans.feb}_${this._app.trans.mar}_${this._app.trans.apr}_${this._app.trans.may}_${this._app.trans.jun}_${this._app.trans.jul}_${this._app.trans.aug}_${this._app.trans.sep}_${this._app.trans.oct}_${this._app.trans.nov}_${this._app.trans.dec}`.split('_'),
            monthsParseExact : true
		});
		setTimeout(() => {	
			$(".ranges ul li").on('click',() => {
				this.applyClicked = true;
			});
		}, 10);
    }
    ngOnChanges() {	

        if(this.storageDate.fromDt && this.storageDate.toDt) {
            setTimeout(() => {
                this.updateDateRange(this.storageDate.fromDt, this.storageDate.toDt);
            }, 100);
        } 
        this.dataSource.fromDt = this.storageDate.fromDt;
        this.dataSource.toDt = this.storageDate.toDt;
        if(this.dataSource.fromDt && this.dataSource.toDt) {
            this.displayDate = `${this.storageDate.fromDt} ~ ${this.storageDate.toDt}`;
        } else if (!this.dataSource.fromDt && !this.dataSource.toDt) this.displayDate = null;
    }
    updateDateRange(from: any, to: any) {
		
        if(this.picker.datePicker) {            
            this.picker.datePicker.setStartDate(from);
            this.picker.datePicker.setEndDate(to);
        }
    }
    // datepicker 선택시
    selectedDate(value: any, datepicker?: any) {
        console.log('셀렉트데이터',value);
		// console.log(value, datepicker);
        this.dataSource.fromDt = value.start.format('YYYY-MM-DD');
        this.dataSource.toDt = value.end.format('YYYY-MM-DD');
        const start = value.start.format('YYYY-MM-DD');
        const end = value.end.format('YYYY-MM-DD');
        this.secDate.emit({
            fromDt: start,
            toDt: end
        });
		this.updateDateRange(start, end);
		// this.applyClicked = true;
        // this.displayDate = `${start} ~ ${end}`; 
    }    
    applyDaterangepicker(event: any, datepicker?: any) {
		console.log(event.picker.startDate);
		if(this.applyClicked) {
			event.event.target.focus();
			this.applyClicked = false;
        }		
        this.selectedDate({start: event.picker.startDate, end: event.picker.endDate, label: null});
        // this.displayDate = `${event.picker.startDate.format('YYYY-MM-DD')} ~ ${event.picker.endDate.format('YYYY-MM-DD')}`; 
    }    
}