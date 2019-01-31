import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { DiagramService } from '../diagram.service';
import { PowermodeStoreService } from '../store/store.service';

import * as _ from 'lodash';

import * as Model from '../model/diagram.model';

interface DataSource {
    ctrl: string; 
    name: string; 
    isChecked: boolean
}
@Component({
 	selector: 'props-range',
	templateUrl: './props-range.component.html'
})

export class PropsRangeComponent implements OnInit, OnChanges {
    @Input() selectionDataCell: Model.SelectData;

    propsTitle: string = '';
    filterType: string = 'RANGE';

    rangeForm: FormGroup;
    dataSource: any = {
        fromDt: null,
        toDt: null
    }

    constructor(
        private _service: DiagramService,
        private _fb: FormBuilder,
        private _store: PowermodeStoreService
    ) {

    }
    ngOnInit() {
        this.rangeForm = this._fb.group({			
			'fromDt': [],
			'toDt': []
		});
        
        this.watchForm();
    }
    ngOnChanges(): void {
        if(this.selectionDataCell) {
            this.propsTitle = this.selectionDataCell.itemNm;
            const store = this._store.store['groupInfoListStore'].slice(0);
            const group = store.filter((obj) => {
                return obj.groupId === this.selectionDataCell.id; 
            });
            // 선택한 셀 내용이 스토어에 있는지 확인. 있으면 getStorage 실행.
            if(group[0].item[this.selectionDataCell.index] === this.selectionDataCell.itemCd) {
                if(group[0].filter[this.selectionDataCell.index].fromDt 
                    || group[0].filter[this.selectionDataCell.index].toDt) {
                    this.getStorage(group[0].filter[this.selectionDataCell.index]);
                }
            }
        }
    }    
    // 스토어 결과 반영
	getStorage(store: any): void {
        const item =  {
            fromDt: Number(store.fromDt),
            toDt: Number(store.toDt)
        }
        this.dataSource = item;
	}
   
    watchForm(): void {
		this.rangeForm.valueChanges
			.debounceTime(800)
			.distinctUntilChanged()
			.subscribe(res => {
                this._service.saveStore([this.selectionDataCell, res]);
		});
	}
}