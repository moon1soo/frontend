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
 	selector: 'props-check',
	templateUrl: './props-check.component.html'
})

export class PropsCheckComponent implements OnInit, OnChanges {
    @Input() selectionDataCell: Model.SelectData;

    dataSource: DataSource[] = [];
    propsTitle: string = '';
    filterType: string = 'CHECK';

    checkForm: FormGroup = new FormGroup({});

    constructor(
        private _service: DiagramService,
        private _fb: FormBuilder,
        private _store: PowermodeStoreService
    ) {

    }
    ngOnInit() {    
        this.watchForm();
    }
    ngOnChanges(): void {
        if(this.selectionDataCell) {
            this.propsTitle = this.selectionDataCell.itemNm;
		            
            if(this.selectionDataCell.filterType === this.filterType) {
                this._service
                    .list({
                        ctgCd: this.selectionDataCell.ctgCd, 
                        itemCd: this.selectionDataCell.itemCd,
                        filter: this.filterType,
                        groupId: this.selectionDataCell.id
                    })
                    .subscribe(res => {
                        const dataset = res.map(obj => {
                            let robj = {};
                           
                            robj['ctrl'] = `ctrl-${res.findIndex(function(val) { return val === obj })}`;
                            robj['name'] = obj;
                            robj['isChecked'] = false;
                            
                            return robj;
                        });
                        this.dataSource = dataset;
                        this.makeInpGroup(dataset);

                        const store = this._store.store['groupInfoListStore'].slice(0);
						const group = store.filter((obj) => {
							return obj.groupId === this.selectionDataCell.id; 
						});
                        // 선택한 셀 내용이 스토어에 있는지 확인. 있으면 getStorage 실행.
						if(group[0].item[this.selectionDataCell.index] === this.selectionDataCell.itemCd) {
							if(group[0].filter[this.selectionDataCell.index].selectCd) {
								this.getStorage(group[0].filter[this.selectionDataCell.index]);
							}
						}
					 });
            }
        }
    }    
    // 스토어 결과 반영
	getStorage(store: any): void {
		const item = store.selectCd.split('|||');
        
        for(let data of this.dataSource) {
            if(~item.indexOf(data.name)) {
                data.isChecked = true;
            }
        }
	}
    makeInpGroup(dataset: DataSource[]): void {
        for (let data of dataset) {
            let control: FormControl = new FormControl('');
            this.checkForm.addControl(data.ctrl, control);
            
			data.isChecked = false;
		}
    }
    watchForm(): void {
		this.checkForm.valueChanges
			.debounceTime(800)
			.distinctUntilChanged()
			.subscribe(res => {
                console.log('체크박스',res);
                let param = [];
                const arr = Object.keys(res).filter((key) => {
                    return res[key] === true;
                });
                for(let data of this.dataSource) {
                    if(~arr.indexOf(data.ctrl)) {
                        param.push(data.name);
                    }
                }
                this._service.saveStore([this.selectionDataCell, param]);
		});
	}
}