import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import { FormDetailService } from './form-detail.service';
import { StoreService } from '../../store/store.service';
import { DashboardService } from '../../dashboard.service';
import { DashboardState } from 'app/basicmode/dashboard.state';

import * as Model from '../../model/dashboard.model';
import { access } from 'fs';

@Component({
 	selector: 'form-detail-client',
	templateUrl: './form-detail-client.component.html'
})

export class FormDetailClientComponent implements OnInit {
	@ViewChild('accDetailForm') acc;
	@ViewChild('freetext') freetextPop: any;
	@ViewChild('range') rangePop: any;

    dataSource: any[] = [];
    selectedRowsData: Model.FormDetailList;
    totalCount: string;

    secCode: string;
	activeId: string;
	clientIdx: number;
	condition: string[] = [];

	fConditionForm: FormGroup = new FormGroup({});;
	formCtrlSet: {start: string; end: string;}[] = [];
	freeTextCtrl: {freeText: string[]; freeTextCondition: string[]; seq: number[]}[] = [{
		freeText: [],
		freeTextCondition: [],
		seq: []
	}];
	rangeDtStAction: any = [];
	rangeDtEdAction: any = [];
	freeTextAction: any = [];
	freeTextCondAction: any = [];
	consitionSelect: any = [];
	singleType: string[] = ['rangeDtSt', 'rangeDtEd'];
	multipleType: string[] = ['freeText', 'freeTextCondition'];
	dataset: any = {};

	oldData: any;

	clientWordIdx: any = {
		idx: [0],
		index: ['Selection_0']
	};
	isLoadtable: boolean = false;

    constructor(
		private _fb: FormBuilder,
        private _service: FormDetailService,
		private _store: StoreService,
		private _state: DashboardState,
        private _dashboard: DashboardService
    ) {
		this.secCode = this._service.secCode;
		this.consitionSelect = this._state.condition;
    }
    ngOnInit() {		
		const store = this._store.store;
		const storage = store[this._state.code[this.secCode].storage];		

		this.fConditionForm = this._fb.group({
			'word-index-0': ['']
		});	

        let receive = this._dashboard.formDetailStore$.subscribe(res => {
			res['client'].length ? this.dataSource = res['client'].slice(0) : this.dataSource = [[]];
			this.condition = res['condition'];
			this.formCtrlSet = [];
			this.freeTextCtrl = [];

			// 조건 설정 폼 초기 생성
			Array.from(res['client']).forEach((obj, index) => {
				this.formCtrlSet.push({
					start: res['rangeDtSt'] ? res['rangeDtSt'][index] : [''],
					end: res['rangeDtEd'] ? res['rangeDtEd'][index] : ['']
				});
			});

			Array.from(res['client']).forEach((obj, index) => {
				this.freeTextCtrl.push({
					freeText: (res['freeText'] && res['freeText'][index]) ? res['freeText'][index].split(',') : [''],
					freeTextCondition: (res['freeTextCondition'] && res['freeTextCondition'][index]) ? res['freeTextCondition'][index].split(',') : ['and'],
					seq: [0]
				});
				if(res['freeText'] && res['freeText'][index]) {
					this.freeTextCtrl[index].seq = [];
					const arr = res['freeText'][index].split(',');
					Array.from(arr).forEach((obj, idx) => {
						this.freeTextCtrl[index].seq.push(idx);
					});
				}
			});

			setTimeout(() => {
				this.activeId = this.acc.activeIds[0];
				if(this.activeId) {
					this.clientIdx = this.acc.activeIds[0].split('-')[1];
				}
				this.watchForm();
			}, 10);

			if(this.dataSource.length && this.oldData !== res) {
				this.setDynamicForm(res);
			}
			this.oldData = res;
		});

		Promise.resolve(receive).then(
			() => {				
				if(storage && storage.name1) {
					this.setDynamicFormIndex(storage.name1);
				}
			}
		);
	}
	// 색인 Input 동적 구성
	setDynamicFormIndex(data: string[]): void {
		this.clientWordIdx.index = data;
		this.clientWordIdx.idx = [0];

		for(let i = 1; i<data.length; i++) {
			this.clientWordIdx.idx.push(i);
			let text: FormControl = new FormControl(data[i]);
			this.fConditionForm.addControl(`word-index-${i}`, text);
		}
	}
	// 색인 변경 시 저장
	activeWordIndex(event, idx): void {
		this._dashboard.setWordIndex([this.secCode, idx, event]);
	}
	// 조건설정 폼 동적 생성
	setDynamicForm(res: any) {
		let group: any = {};

		for(let key of Object.keys(this.fConditionForm.controls)) {			
			if(!~key.indexOf('word-index')) {
				this.fConditionForm.removeControl(String(key));					
			}
		}
		this.fConditionForm.updateValueAndValidity();

		Array.from(res['client']).forEach((obj, index) => {
			const st = (res.rangeDtSt && res.rangeDtSt[index]) ? res.rangeDtSt[index] : '';
			const ed = (res.rangeDtEd && res.rangeDtEd[index]) ? res.rangeDtEd[index] : '';

			const ftxt = (res.freeText && res.freeText[index]) ? res.freeText[index].split(',') : [''];
			const fcond = (res.freeTextCondition && res.freeTextCondition[index]) ? res.freeTextCondition[index].split(',') : ['and'];

			let start: FormControl = new FormControl(st);
			let end: FormControl = new FormControl(ed);

			let freetext = ftxt.map((obj,index) => {
				let robj = {};
				robj['title'] = index;
				robj['FormControl'] = new FormControl(obj);
				return robj;
			});
			let freecontrol = fcond.map((obj,index) => {
				let robj = {};
				robj['title'] = index;
				robj['FormControl'] = new FormControl(obj);
				return robj;
			});

			this.fConditionForm.addControl(`rangeDtSt-${index}`, start);
			this.fConditionForm.addControl(`rangeDtEd-${index}`, end);

			freetext.forEach((obj, idx) => {
				this.fConditionForm.addControl(`freeText-${index}-${obj.title}`, obj.FormControl);
			});
			freecontrol.forEach((obj, idx) => {
				this.fConditionForm.addControl(`freeTextCondition-${index}-${obj.title}`, obj.FormControl);
			});
			this.fConditionForm.updateValueAndValidity();
		});
		console.log('폼 생성 결과',this.fConditionForm.controls);
	}
	// freetext 추가
	addFreeText(event: any): void {
		const [e, idx, i] = event;
		const target = this.freeTextCtrl[idx];
		const txt = new FormControl(''),
			condition = new FormControl('and');

		target.freeText.push('');
		target.freeTextCondition.push('and');
		target.seq.push(target.freeText.length-1);
		this.fConditionForm.addControl(`freeText-${idx}-${target.freeText.length-1}`, txt);
		this.fConditionForm.addControl(`freeTextCondition-${idx}-${target.freeText.length-1}`, condition);
	}
	// freetext control 삭제
	delFreeText(event): void {
		const [e, idx, i, seq] = event;
		const target = this.freeTextCtrl[idx];

		setTimeout(() => {
			this.fConditionForm.removeControl(`freeText-${idx}-${seq}`);
			this.fConditionForm.removeControl(`freeTextCondition-${idx}-${seq}`);
			this.fConditionForm.updateValueAndValidity();
			// this.removeControl([idx, i]);
			target.freeText.splice(i, 1);
			target.freeTextCondition.splice(i, 1);
			target.seq.splice(i, 1);
		}, 100);
	}
	// freetext 배열 삭제
	removeControl(event) {
		const [idx, i] = event;
		const target = this.freeTextCtrl[idx];
		setTimeout(() => {
			target.freeText.splice(i, 1);
			target.freeTextCondition.splice(i, 1);
			target.seq.splice(i, 1);
		}, 10);
	}
	// 폼 변경여부 관찰
	watchForm(): void {
		this.fConditionForm.valueChanges
			// .debounceTime(800)
			.subscribe(res => {
				// console.log(res);
				const arr = [];
				const clone = this.freeTextCtrl.slice(0);
				this.rangeDtStAction = [];
				this.rangeDtEdAction = [];
				this.freeTextAction = [];
				this.freeTextCondAction = [];

				for(let key of Object.keys(res)) {
					const title = key.split('-')[0];
					if(~this.singleType.indexOf(title)) {
						const head = key.split('-')[0];
						const idx = key.split('-')[1];

						if(head === 'rangeDtSt') {
							res[key] ? this.rangeDtStAction.push(res[key]) : this.rangeDtStAction.push('');
							// this.rangeDtStAction.push(res[key]);
						} else if(head === 'rangeDtEd') {
							res[key] ? this.rangeDtEdAction.push(res[key]) : this.rangeDtEdAction.push('');
							// this.rangeDtEdAction.push(res[key]);
						}
					} else if(~this.multipleType.indexOf(title)) {
						const head = key.split('-')[0];
						const idx = key.split('-')[1];
						if(!~arr.indexOf(idx)) {
							arr.push(idx);
							this.freeTextAction[idx] = [];
							this.freeTextCondAction[idx] = [];
						}
						if(head === 'freeText') {
							this.freeTextAction[idx].push(res[key]);
						} else if(head === 'freeTextCondition') {
							this.freeTextCondAction[idx].push(res[key]);
						}
					}
				};
		});
	 }

	// 조건설정 데이터 스토어에 적용
	sendData(event): void {
		const rangeSt = this.rangeDtStAction.slice(0),
			rangeEd = this.rangeDtEdAction.slice(0),
			text = [], 
			condition = [];

		if(this.freeTextAction) {
			for(let data of this.freeTextAction) {
				text.push(data.join(','));
			}
			for(let data of this.freeTextCondAction) {
				condition.push(data.join(','));
			}
		}
		this.dataset['rangeDtSt'] = rangeSt;
		this.dataset['rangeDtEd'] = rangeEd;
		this.dataset['freeText'] = text;
		this.dataset['freeTextCondition'] = condition;
		// console.log(this.dataset);
		setTimeout(() => {
			return this._dashboard.addDataCondition(this._service.secCode, this.dataset);
		}, 10);
	}
	// 그룹 삭제
	deleteClient(event: MouseEvent, idx: number) {
		event.preventDefault();
		event.stopPropagation();		

		this.freeTextCtrl.splice(idx, 1);
		this.formCtrlSet.splice(idx, 1);
		
		this.deleteClinentAction(idx);
		this._dashboard.removeClientGroup(this.secCode, idx);
		setTimeout(() => {
			this.acc.activeIds = this.acc.panels.last.id;
			this._dashboard.setActiveTab(this.acc.panels.last.id.split('-')[1]);
		}, 10);
	}
	// 행 삭제
	onDeleteRow(data: Model.MedicalList): void {		
		if(!this.dataSource[this.clientIdx].length) {
			this.deleteClinentAction(this.clientIdx);
		}
		this._dashboard.removeData(this.secCode, this.clientIdx, data.data);
	}
	// 그룹 삭제시 색인도 삭제
	deleteClinentAction(idx: number) {
		this.fConditionForm.removeControl(`word-index-${idx}`);
		if(this.clientWordIdx.idx.length > 1) {
			this.clientWordIdx.index.splice(idx, 1);
			this.clientWordIdx.idx.splice(idx, 1);
		} else {
			this.clientWordIdx = {
				idx: [0],
				index: ['Selection_0']
			};
			let text: FormControl = new FormControl(this.clientWordIdx.index[0]);
			this.fConditionForm.addControl(`word-index-0`, text);
		}		
	}

    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
		this._dashboard.setAddGrid(true);
		setTimeout(() => { this.isLoadtable = true; }, 50);
	}
	// 그리드 추가
	addGrid(event): void {
		let text: FormControl = new FormControl('');
		const idx = this.acc.panels.last.id.split('-');
		let indexof = Number(idx[1]) + 1;
		this.clientWordIdx.index.push(`Selection_${indexof}`);
		this.clientWordIdx.idx.push(indexof);
		this.fConditionForm.addControl(`word-index-${indexof}`, text);

		Promise.resolve(this._dashboard.addClientGrid(this.secCode))
		.then(
			() => {
				const idx = this.acc.panels.last.id.split('-');
				setTimeout(() => {
					this.acc.toggle(`${idx[0]}-${Number(idx[1])+1}`);
				}, 10);
			}
		);
	}
	// 아코디언 메뉴 변경
	beforeChange(event: NgbPanelChangeEvent) {
		const idx = event.panelId.split('-')[1];
		this.activeId = event.panelId;
		this.clientIdx = Number(idx);
		this._dashboard.setActiveTab(idx);
	}
	// 포함/제외
	activeBtn(event: any, idx: number, seq: string): void {
		event.preventDefault();
		event.stopPropagation();

		this._dashboard.setCondition(this.secCode, idx, seq);
	}
	inputFocus(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
	}
}