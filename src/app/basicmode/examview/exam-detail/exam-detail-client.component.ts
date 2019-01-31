import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import { ExamDetailService } from './exam-detail.service';
import { StoreService } from '../../store/store.service';
import { DashboardService } from '../../dashboard.service';
import { DashboardState } from 'app/basicmode/dashboard.state';

import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'exam-detail-client',
	templateUrl: './exam-detail-client.component.html'
})

export class ExamDetailClientComponent implements OnInit {
	@ViewChild('accDetailExam') acc;
	@ViewChild('freetext') freetextPop: any;
	@ViewChild('range') rangePop: any;
	@ViewChild('PN') PNPop: any;
    
    dataSource: any[] = [];
    selectedRowsData: Model.ExamList;
    totalCount: string;
    resultCount: string;

    secCode: string;
	activeId: string;
	clientIdx: number;
	condition: string[] = [];
	
	examDetailConditionForm: FormGroup = new FormGroup({});;
	formCtrlSet: {start: string; end: string;}[] = [];
	PNCtrl: {data: string}[] = [];
	freeTextCtrl: {freeText: string[]; freeTextCondition: string[]; seq: number[]}[] = [{
		freeText: [],
		freeTextCondition: [],
		seq: []
	}];
	freeTextAction: any = [];
	freeTextCondAction: any = [];
	singleType: string[] = ['rangeDtSt', 'rangeDtEd', 'pn1'];
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
        private _service: ExamDetailService,
        private _store: StoreService,
		private _dashboard: DashboardService,
		private _state: DashboardState
    ) {
		this.secCode = this._service.secCode;
    }
    ngOnInit() {
		// this.watchForm();
		const store = this._store.store;
		const storage = store[this._state.code[this.secCode].storage];		

		this.examDetailConditionForm = this._fb.group({
			'word-index-0': ['']
		});	

        let receive = this._dashboard.examDetailStore$.subscribe(res => {
			setTimeout(() => {
				res['client'].length ? this.dataSource = res['client'].slice(0) : this.dataSource = [[]];
				this.condition = res['condition'];
				this.formCtrlSet = [];
				this.PNCtrl = [];
				this.freeTextCtrl = [];

				// 조건 설정 폼 초기 생성
				Array.from(res['client']).forEach((obj, index) => {
					this.formCtrlSet.push({
						start: res['rangeDtSt'][index],
						end: res['rangeDtEd'][index]
					});
				});
				Array.from(res['client']).forEach((obj, index) => {
					this.PNCtrl.push({
						data: res['pn1'][index]
					});
				});
				Array.from(res['client']).forEach((obj, index) => {
					this.freeTextCtrl.push({
						freeText: res['freeText'][index] ? res['freeText'][index].split(',') : [''],
						freeTextCondition: res['freeTextCondition'][index] ? res['freeTextCondition'][index].split(',') : ['and'],
						seq: [0]
					});
					if(res['freeText'][index]) {
						this.freeTextCtrl[index].seq = [];
						const arr = res['freeText'][index].split(',');
						Array.from(arr).forEach((obj, idx) => {
							this.freeTextCtrl[index].seq.push(idx);
						});
					}
				});

				this.activeId = this.acc.activeIds[0];
				if(this.activeId) {
					this.clientIdx = this.acc.activeIds[0].split('-')[1];
				}
				if(this.dataSource.length && this.oldData !== res) {
					this.setDynamicForm(res);
				}
				this.oldData = res;
			}, 10);				
		}); 

		Promise.resolve(receive).then(
			() => {				
				if(storage && storage.name1) {
					this.setDynamicFormIndex(storage.name1);
				}
			}
		);	
		setTimeout(() => {
			this.watchForm();
		}, 10);
	}
	// 색인 Input 동적 구성
	setDynamicFormIndex(data: string[]): void {
		this.clientWordIdx.index = data;
		for(let i = 1; i<data.length; i++) {
			let text: FormControl = new FormControl(data[i]);
			this.examDetailConditionForm.addControl(`word-index-${i}`, text);
		}
	}
	// 색인 변경 시 저장
	activeWordIndex(event, idx): void {
		this._dashboard.setWordIndex([this.secCode, idx, event]);
	}
	// 조건설정 폼 동적 생성
	setDynamicForm(res: any) {
		let group: any = {};

		Array.from(res['client']).forEach((obj, index) => {
			const st = res.rangeDtSt[index] ? res.rangeDtSt[index] : '';
			const ed = res.rangeDtEd[index] ? res.rangeDtEd[index] : '';
			const pn = res.pn1[index] ? res.pn1[index] : '';

			const ftxt = res.freeText[index] ? res.freeText[index].split(',') : [''];
			const fcond = res.freeTextCondition[index] ? res.freeTextCondition[index].split(',') : ['and'];

			let start: FormControl = new FormControl(st);
			let end: FormControl = new FormControl(ed);
			let pnctrl: FormControl = new FormControl(pn);

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

			this.examDetailConditionForm.addControl(`rangeDtSt-${index}`, start);
			this.examDetailConditionForm.addControl(`rangeDtEd-${index}`, end);
			this.examDetailConditionForm.addControl(`pn1-${index}`, pnctrl);

			freetext.forEach((obj, idx) => {
				this.examDetailConditionForm.addControl(`freeText-${index}-${obj.title}`, obj.FormControl);
			});
			freecontrol.forEach((obj, idx) => {
				this.examDetailConditionForm.addControl(`freeTextCondition-${index}-${obj.title}`, obj.FormControl);
			});
		});
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
		this.examDetailConditionForm.addControl(`freeText-${idx}-${target.freeText.length-1}`, txt);
		this.examDetailConditionForm.addControl(`freeTextCondition-${idx}-${target.freeText.length-1}`, condition);
	}
	// freetext control 삭제
	delFreeText(event): void {
		const [e, idx, i, seq] = event;
		const target = this.freeTextCtrl[idx];

		setTimeout(() => {
			this.examDetailConditionForm.removeControl(`freeText-${idx}-${seq}`);
			this.examDetailConditionForm.removeControl(`freeTextCondition-${idx}-${seq}`);
			this.examDetailConditionForm.updateValueAndValidity();
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
		this.examDetailConditionForm.valueChanges
			.debounceTime(800)
			.subscribe(res => {
				console.log(res);
				const arr = [];
				const clone = this.freeTextCtrl.slice(0);
				this.freeTextAction = [];
				this.freeTextCondAction = [];

				for(let key of Object.keys(res)) {
					const title = key.split('-')[0];
					if(~this.singleType.indexOf(title)) {
						const idx = key.split('-')[1],
							i = key.split('-')[2];
						if(!this.dataset[title]) {
							this.dataset[title] = [];
						}
						if(res[key]) {
							this.dataset[title][idx] = res[key];
						} else {
							this.dataset[title][idx] = '';
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
		const text = [], condition = [];
		if(this.freeTextAction) {
			for(let data of this.freeTextAction) {
				text.push(data.join(','));
			}
			for(let data of this.freeTextCondAction) {
				condition.push(data.join(','));
			}
		}
		this.dataset['freeText'] = text;
		this.dataset['freeTextCondition'] = condition;
		setTimeout(() => {
			return this._dashboard.addDataCondition(this._service.secCode, this.dataset);
		}, 10);
	}

	// 그룹 삭제
	deleteClient(event: MouseEvent, idx: number) {
		event.preventDefault();
		event.stopPropagation();		
		
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
		this.examDetailConditionForm.removeControl(`word-index-${idx}`);
		if(this.clientWordIdx.idx.length > 1) {
			this.clientWordIdx.index.splice(idx, 1);
			this.clientWordIdx.idx.splice(idx, 1);
		} else {
			this.clientWordIdx = {
				idx: [0],
				index: ['Selection_0']
			};
			let text: FormControl = new FormControl(this.clientWordIdx.index[0]);
			this.examDetailConditionForm.addControl(`word-index-0`, text);
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
		this.examDetailConditionForm.addControl(`word-index-${indexof}`, text);
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