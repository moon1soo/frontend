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
import { setTimeout } from 'timers';

interface DataSource {
	a: boolean;
	p: boolean;
	n: boolean;
}
@Component({
 	selector: 'props-pn',
	templateUrl: './props-pn.component.html'
})

export class PropsPnComponent implements OnInit, OnChanges {
    @Input() selectionDataCell: Model.SelectData;

    propsTitle: string = '';
    filterType: string = 'PN';

	pnForm: FormGroup;
	pnCtrl: DataSource = {
		a: false,
		p: false,
		n: false
	};

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
		this.pnForm = this._fb.group({
			all: [''],
			positivity: [''],
			negativity: ['']
		});
        if(this.selectionDataCell) {
			this.propsTitle = this.selectionDataCell.itemNm;

            const store = this._store.store['groupInfoListStore'].slice(0);
			const group = store.filter((obj) => {
				return obj.groupId === this.selectionDataCell.id;
			});
			if(group[0].item[this.selectionDataCell.index] === this.selectionDataCell.itemCd) {
				if(Object.keys(group[0].filter[this.selectionDataCell.index]).length > 3) {
					this.getStorage(group[0].filter[this.selectionDataCell.index]);
				}
			} 
		}
	}
	// 스토어 결과 반영
	getStorage(store: any): void {		
		if(store.pn) {
			// console.log('스토어 추적',store.pn);
			// let pnArr = JSON.parse(`[${store.pn}]`);
			for(let pn of [...store.pn]) {
				this.pnCtrl[pn] = true;
			}
		}	
	}

	// 폼 변경 여부 관찰
    watchForm(): void {
		this.pnForm.valueChanges
			.subscribe(res => {
				let pn = [];
				for(let key of Object.keys(this.pnCtrl)) {
					if(this.pnCtrl[key]) {
						pn.push(key);
					}
				}
                this._service.saveStore([this.selectionDataCell, {pn: pn.join(',')}]);
		});
	}
}