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
	freeText: string[]; 
	freeTextCondition: string[];
}
@Component({
 	selector: 'props-freetext',
	templateUrl: './props-freetext.component.html'
})

export class PropsFreeTextComponent implements OnInit, OnChanges {
    @Input() selectionDataCell: Model.SelectData;

    propsTitle: string = '';
    filterType: string = 'FREETEXT';

	freetextForm: FormGroup = new FormGroup({});
	freeTextCtrl: DataSource = {
		freeText: [''],
		freeTextCondition: ['and']
	};

    constructor(
        private _service: DiagramService,
        private _fb: FormBuilder,
        private _store: PowermodeStoreService
    ) {

    }
    ngOnInit() {
        	
    }
    ngOnChanges(): void {		
		this.freetextForm = this._fb.group({
			'freeText-0': [''],
			'freeTextCondition-0': ['and']
		});	
        if(this.selectionDataCell) {			
			this.propsTitle = this.selectionDataCell.itemNm;
			
            const store = this._store.store['groupInfoListStore'].slice(0);
			const group = store.filter((obj) => {
				return obj.groupId === this.selectionDataCell.id;
			});
			// 선택한 셀 내용이 스토어에 있는지 확인. 있으면 getStorage 실행.
			if(group[0].item[this.selectionDataCell.index] === this.selectionDataCell.itemCd) {
				if(Object.keys(group[0].filter[this.selectionDataCell.index]).length > 3) {					
					this.getStorage(group[0].filter[this.selectionDataCell.index]);
				} else {
					this.setDynamicForm();
				}
			} else {
				this.setDynamicForm();
			}
		}
	}
	// 스토어 결과 반영
	getStorage(store: any): void {
		this.freeTextCtrl = store;
		this.setDynamicForm();
	}

	setDynamicForm(): void {
		if(this.freeTextCtrl.freeTextCondition) {
			let idx = this.freeTextCtrl.freeTextCondition.length;
			
			for(let i = 0; i<idx; i++) {
				let text: FormControl = new FormControl('');
				let condition: FormControl = new FormControl('');
				this.freetextForm.addControl(`freeText-${i}`, text);
				this.freetextForm.addControl(`freeTextCondition-${i}`, condition);
			}
		}
		setTimeout(() => {
			this.watchForm();	
		}, 10);
			
	}
	addCondition(): void {
		let text: FormControl = new FormControl('');
		let condition: FormControl = new FormControl('and');

		this.freeTextCtrl.freeText.push('');
		this.freeTextCtrl.freeTextCondition.push('and');

		this.freetextForm.addControl(`freeText-${this.freeTextCtrl.freeText.length - 1}`, text);
		this.freetextForm.addControl(`freeTextCondition-${this.freeTextCtrl.freeTextCondition.length - 1}`, condition);
	}
	delCondition(): void {
		let text: FormControl = new FormControl('');
		let condition: FormControl = new FormControl('and');

		this.freeTextCtrl.freeText.splice(this.freeTextCtrl.freeText.length - 1, 1);
		this.freeTextCtrl.freeTextCondition.splice(this.freeTextCtrl.freeTextCondition.length - 1, 1);

		this.freetextForm.removeControl(`freeText-${this.freeTextCtrl.freeText.length}`);
		this.freetextForm.removeControl(`freeTextCondition-${this.freeTextCtrl.freeTextCondition.length}`);
		this.freetextForm.updateValueAndValidity();
	}    
	// 폼 변경 여부 관찰
    watchForm(): void { 
		// console.log('왓치');
		this.freetextForm.valueChanges
			.debounceTime(800)
			.distinctUntilChanged()
			.subscribe(res => {
				this.freeTextCtrl.freeText = [];
				this.freeTextCtrl.freeTextCondition = [];
				for(let key of Object.keys(res)) {
					if(~key.indexOf('freeText-')) {
						this.freeTextCtrl.freeText.push(res[key]);
					}
					if(~key.indexOf('freeTextCondition-')) {
						this.freeTextCtrl.freeTextCondition.push(res[key]);
					}
				}
				// console.log(this.freeTextCtrl);
                this._service.saveStore([this.selectionDataCell, this.freeTextCtrl]);
		});
	}
}