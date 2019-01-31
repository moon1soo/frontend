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
}
@Component({
 	selector: 'props-radio',
	templateUrl: './props-radio.component.html'
})

export class PropsRadioComponent implements OnInit, OnChanges {
    @Input() selectionDataCell: Model.SelectData;

    dataSource: {data: DataSource[]; isRadio: string} = {
        data: [],
        isRadio: null
    };
    propsTitle: string = '';
    filterType: string = 'RADIO';

    radioForm: FormGroup = new FormGroup({});

    constructor(
        private _service: DiagramService,
        private _fb: FormBuilder,
        private _store: PowermodeStoreService
    ) {

    }
    ngOnInit() {    
        this.radioForm = this._fb.group({
			'radioCtrl': ['', Validators.compose([Validators.required])]
        });
        setTimeout(() => {
            this.watchForm();
        }, 10);        
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
                            
                            return robj;
                        });                        
                        this.dataSource.data = dataset;           

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
        // console.log(this.dataSource);
    }    
    // 스토어 결과 반영
	getStorage(store: any): void {
		const item = store.selectCd;
        
        this.dataSource.isRadio = item;
	}

    changeVal(event: string) {
        this.dataSource.isRadio = event;
    }
    
    watchForm(): void {
		this.radioForm.valueChanges
			.debounceTime(800)
			.distinctUntilChanged()
			.subscribe(res => {
                // console.log(res);
                if(res.radioCtrl) {
                    this._service.saveStore([this.selectionDataCell, res.radioCtrl]);
                }                
		});
	}
}