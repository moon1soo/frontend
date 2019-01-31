import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { AppState } from 'app/app.state';
import { CustomValidators } from 'ng2-validation';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

declare const $: any;
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
 	selector: 'daterangepicker',
	templateUrl: './daterangepicker.html'
})

export class DateRangePicker implements OnInit, OnChanges {
    @Output() secDate = new EventEmitter();
    @Input('storageDate') storageDate: {fromDt: string; toDt: string};
    @Input('secCode') secCode: string;

    datepickerForm: FormGroup;
    today: any = moment().subtract(1, 'days').format('YYYY-MM-DD');

    newDt = new Date();
    dataSource: any = {
        fromDt: undefined,
        toDt: undefined
    };

    defaultFromDt: any = moment().subtract(1, 'years').subtract(1, 'days').format('YYYY-MM-DD');
    // defaultTodt: any = moment().subtract(1, 'days').format('YYYY-MM-DD');
    defaultTodt: any = '9999-12-31';

    constructor(
        private _app: AppState,
        private _fb: FormBuilder
    ) {

    }
    ngOnInit() {
        this.datepickerForm = this._fb.group({
			'startDate': ['', CustomValidators.date],
			'endDate': ['', CustomValidators.date]
        });
        // let dateFrom: FormControl = new FormControl('', CustomValidators.date);
      $.fn.datepicker.dd = 1;
        $.fn.datepicker.dates['en'] = {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            today: "Today",
            clear: "Clear",
            format: "mm/dd/yyyy",
            titleFormat: "MM yyyy",
            weekStart: 0
        };
        $.fn.datepicker.dates['kr'] = {
            days: ["일", "월", "화", "수", "목", "금", "토"],
            daysShort: ["일", "월", "화", "수", "목", "금", "토"],
            daysMin: ["일", "월", "화", "수", "목", "금", "토"],
            months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            monthsShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            today: "Today",
            clear: "Clear",
            format: "yyyy-mm-dd",
            titleFormat: "yyyy MM",
            weekStart: 0
        };
        setTimeout(() => {
            this.loadCalendar();
            this.watchForm();
        }, 10);
        // const calendar = $(`#${this.secCode}`).find('.daterangepicker-sm');

        // $(`#${this.secCode}`).find('.datepicker-input').on('focus', function(event) {
        //     $(this).closest('.input-daterange').find('.daterangepicker-sm').show();
        // });
        // $(`#${this.secCode}`).find('.datepickerStart').on('change', (event) => {
        //     this.updateDatepicker($(this).val());
        // })
    }
    ngOnChanges() {
        if(this.storageDate) {
            this.dataSource.fromDt = this.storageDate.fromDt;
            this.dataSource.toDt = this.storageDate.toDt;
        }
    }
    loadCalendar() {
        const calendar = $(`#${this.secCode}`).find('.daterangepicker-sm');
        const start = $(`#${this.secCode}`).find('.datepickerStart');
        const end = $(`#${this.secCode}`).find('.datepickerEnd');

		let changeDate = (option) => {
            let {from, to} = option;
            from ? this.dataSource.fromDt = String(from) : false;
            to ? this.dataSource.toDt = String(to) : false;
        };
        calendar.datepicker({
            language: "kr",
            // todayHighlight: true,
            endDate: this.defaultTodt,
            inputs: $(`#${this.secCode}`).find('.datepickerStart, .datepickerEnd')
            // inputs: $(`#${this.secCode}`).find('.datepickerStart')
        });
        if(this.storageDate) {
            start.datepicker('setDate', this.storageDate.fromDt);
            end.datepicker('setDate', this.storageDate.toDt);
        } else {
            start.datepicker('update', this.defaultFromDt);
            end.datepicker('update', this.defaultTodt);
        }

        calendar.find('.datepicker-plugin').each(function(event) {
            $(this).on('changeDate', (event) => {
                switch ($(this).data('role')) {
                    case 'from':
                        changeDate({from: $(this).datepicker('getFormattedDate'), to: null});
                        break;
                    case 'to':
                        changeDate({from: null, to: $(this).datepicker('getFormattedDate')});
                        break;
                }
            });
        });
        // 포맷 자동완성
        $('.datepicker-input').keyup(function(e){
            // var key = String.fromCharCode(event.keyCode);
            // if(!(Number(key) >= 0 && Number(key) <= 9)) {
            //     $(this).val($(this).val().substr(0, $(this).val().length-1));
            // }

            // let value = $(this).val();
            // if(value.length == 4 || value.length == 7){
            //     $(this).val($(this).val() + '-');
            // }
            let num_arr = [
                97, 98, 99, 100, 101, 102, 103, 104, 105, 96,
                48, 49, 50, 51, 52, 53, 54, 55, 56, 57
            ]

            let key_code = ( e.which ) ? e.which : e.keyCode;
            if( num_arr.indexOf( Number( key_code ) ) != -1 ){

            let value = $(this).val();
            if(value.length == 4 || value.length == 7){
                $(this).val($(this).val() + '-');
            }

            }
        });
    }
    showDatepicker(event: MouseEvent): void {
        $(`#${this.secCode}`).find('.daterangepicker-sm').show();
    }
    hideDatepicker(event: MouseEvent): void {
        const target = $(`#${this.secCode}`).find('.daterangepicker-sm');
        if(target.css('display') === 'block') {
            // this.saveDate();
            target.hide();
        }
    }
    // backspace 방지
    // preventBack(event: any): void {
    //     if(event.keycode === 8) {
    //         event.preventDefault();
    //     }
    // }

    applyDaterangepicker(seq: string) {
        const ranges = {
            OCS: '2000-1-1',
            EMR: '2004-10-15',
            HIS: '2016-11-19'
        };
        $(`#${this.secCode}`).find('.datepickerStart').datepicker('setDate', ranges[seq]);
        $(`#${this.secCode}`).find('.datepickerEnd').datepicker('setDate', this.defaultTodt);
    }

    // 폼 변경 여부 관찰.
	watchForm(): void {
		this.datepickerForm.valueChanges
			.debounceTime(2000)
			.distinctUntilChanged()
			.subscribe(res => {
				for(let key of Object.keys(res)) {
					if(key === 'startDate') {
                        $(`#${this.secCode}`).find('.datepickerStart').datepicker('setDate', res.startDate);
					} else {
						$(`#${this.secCode}`).find('.datepickerEnd').datepicker('setDate', res.endDate);
					}
				}
				this.secDate.emit(this.dataSource);
		});
	}
}
