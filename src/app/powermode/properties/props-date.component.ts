import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { DiagramService } from '../diagram.service';
import { PowermodeStoreService } from '../store/store.service';
import { ItemListState } from '../../item-list.state';
import { AppState } from 'app/app.state';

import * as Model from '../model/diagram.model';

import * as _ from 'lodash';
declare const $: any;
import * as moment from 'moment';


@Component({
 	selector: 'props-date',
	templateUrl: './props-date.component.html'
})

export class PropsDateComponent implements OnInit, OnChanges {
    @Input() selectionDataCell: Model.SelectData;

    newDt = new Date();
    dataSource: any = {
        gubun: 'range',
        refItemCd: null,
        refCtgCd: null,
        fromDt: null,
        toDt: null,
        fromNum: 0,
        toNum: 0
    };
    propsTitle: string = '';
    filterType: string = 'DATE';
    dateForm: FormGroup;
    applyClicked: boolean = false;

    storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};   
    dateRef: {name: string; value:string; refGroupId: string}[] = []; 
    
    secCode: string;

    constructor(
        private _service: DiagramService,
        private _daterangepickerOptions: DaterangepickerConfig,
        private _fb: FormBuilder,
        private _store: PowermodeStoreService,
        private _state: ItemListState,
        private _app: AppState
    ) {
        this._daterangepickerOptions.skipCSS = true;
    }
    ngOnInit() {
        this.dateForm = this._fb.group({
            'gubun': ['range'],	
			'fromDt': [''],
            'toDt': [''],
            'fromNum': [''],
            'toNum': ['']
        });
        moment.locale('kr', {
            monthsShort : `${this._app.trans.jan}_${this._app.trans.feb}_${this._app.trans.mar}_${this._app.trans.apr}_${this._app.trans.may}_${this._app.trans.jun}_${this._app.trans.jul}_${this._app.trans.aug}_${this._app.trans.sep}_${this._app.trans.oct}_${this._app.trans.nov}_${this._app.trans.dec}`.split('_'),
            monthsParseExact : true
        }); 
        setTimeout(() => {	
			$(".ranges ul li").on('click',() => {
				this.applyClicked = true;
			});
		}, 10);
        this.watchForm();
    }
    ngOnChanges(): void {
        if(this.selectionDataCell) {
            console.log('선택 박스 정보',this.selectionDataCell);
            this.propsTitle = this.selectionDataCell.itemNm;
            this.secCode = this.selectionDataCell.itemCd;

            // this.dateRef = combo;
            this._service.getGubun(this.selectionDataCell.id).subscribe(res => {
                if(res) {
                     const combo = res.map(obj => {
                        let robj = {};
                        robj['name'] = obj.itemNm;
                        robj['value'] = `${obj.itemCd}|${obj.ctgCd}|${obj.refGroupId}`;
                        return robj;
                    });
                    this.dateRef = combo;
                } else {
                    this.dateRef = [];
                }
            });
            
            this.dataSource.fromDt = '';
            this.dataSource.toDt = '';

            const store = this._store.store['groupInfoListStore'].slice(0);
            const group = store.filter((obj) => {
                return obj.groupId === this.selectionDataCell.id; 
            });
            // 선택한 셀 내용이 스토어에 있는지 확인. 있으면 getStorage 실행.
            if(group[0].item[this.selectionDataCell.index] === this.selectionDataCell.itemCd) {
                if(group[0].filter[this.selectionDataCell.index].gubun) {
                    this.getStorage(group[0].filter[this.selectionDataCell.index]);
                } else {
					this.resetDate();
				}
            } 
        }
    }
    // 스토어 결과 반영
	getStorage(store: any): void {   
        console.log('스토어 결과 반영',store);
        if(store.gubun === 'range') {
            this.dataSource = Object.assign(this.dataSource, store);
            this.storageDate = {fromDt: this.dataSource.fromDt, toDt: this.dataSource.toDt};
        } else {
            const item =  {
                gubun: `${store.refItemCd}|${store.refCtgCd}|${store.refGroupId}`,
                fromNum: Number(store.fromDt),
                toNum: Number(store.toDt)
            }
            this.dataSource = Object.assign(this.dataSource, item);
        }
	}
	// reset
	resetDate(): void {
		this.storageDate = {fromDt: null, toDt: null};
		this.dataSource.gubun = 'range';
		this.dataSource.fromDt = '';
		this.dataSource.toDt = '';
	}

    // Apply 버튼 클릭시
    selectDate(event: {fromDt: string; toDt: string}): void {
        if(this.applyClicked) {
			// event.event.target.focus();
			this.applyClicked = false;
		}	
        this.dataSource.fromDt = event.fromDt;
        this.dataSource.toDt = event.toDt;
        
        this._service.saveStore([this.selectionDataCell, {
            gubun: 'range',
            fromDt: this.dataSource.fromDt,
            toDt: this.dataSource.toDt
        }]);
    }
    // 기준일 변경시
    watchForm(): void {
        this.dateForm.valueChanges
			.debounceTime(800)
			.distinctUntilChanged()
			.subscribe(res => {
                if(res.gubun !== 'range') {                    
                    const seq = res.gubun.split('|');
                    this._service.saveStore([this.selectionDataCell, {
                        gubun: 'ref',
                        fromDt: String(res.fromNum),
                        toDt: String(res.toNum),
                        refItemCd: seq[0],
                        refCtgCd: seq[1],
                        refGroupId: seq[2]
                    }]);
                }
		});
    }
}