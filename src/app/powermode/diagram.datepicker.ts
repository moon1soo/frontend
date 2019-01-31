import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';

import { PowermodeStoreService } from './store/store.service';
import { DiagramService } from './diagram.service';
import { AppState } from 'app/app.state';

declare const $: any;
import * as moment from 'moment';

@Component({
 	selector: 'diagram-datepicker',
	templateUrl: './diagram.datepicker.html'
})

export class DiagramDatepicker implements OnInit, OnChanges {
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
        startDate: moment().subtract(1, 'year').subtract(1, 'days'),
        endDate: moment().subtract(1, 'days')
    };

    constructor(
        private _daterangepickerOptions: DaterangepickerConfig,
        private _fb: FormBuilder,
        private _store: PowermodeStoreService,
        private _app: AppState,
        private _translate: TranslateService
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
        // console.log(this.storageDate);
        this.dataSource.fromDt = this.storageDate.fromDt;
        this.dataSource.toDt = this.storageDate.toDt;
        if(this.dataSource.fromDt && this.dataSource.toDt) {
            this.displayDate = `${this.storageDate.fromDt} ~ ${this.storageDate.toDt}`;
        }
    }
    updateDateRange(from: any, to: any) {
        if(this.picker.datePicker) {            
            this.picker.datePicker.setStartDate(from);
            this.picker.datePicker.setEndDate(to);
        }
    }
    // datepicker 선택시
    selectedDate(value: any) {
        this.dataSource.fromDt = value.start.format('YYYY-MM-DD');
        this.dataSource.toDt = value.end.format('YYYY-MM-DD');
        const start = value.start.format('YYYY-MM-DD');
        const end = value.end.format('YYYY-MM-DD');
        this.secDate.emit({
            fromDt: start,
            toDt: end
        });
        this.updateDateRange(start, end);
    }    
    applyDaterangepicker(event: any) {
        if(this.applyClicked) {
			event.event.target.focus();
			this.applyClicked = false;
		}
        this.displayDate = `${event.picker.startDate.format('YYYY-MM-DD')} ~ ${event.picker.endDate.format('YYYY-MM-DD')}`; 
    }    
}