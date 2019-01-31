import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import { PathService } from './path.service';
import { StoreService } from '../../store/store.service';
import { DashboardService } from '../../dashboard.service';
import { DashboardState } from '../../dashboard.state';

import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'path-client',
	templateUrl: './path-client.component.html',
})

export class PathClientComponent implements OnInit {
	@ViewChild('accPath') acc;
  
    dataSource: any[] = [];
    selectedRowsData: Model.PathList;
    totalCount: string;

    secCode: string;
	activeId: string;
	clientIdx: number;
	condition: string[] = [];

	freeTextAction: any[];
	freeTextCondAction: any[];
	freeTextCateAction: any[];
	freeTextIdxAction: any[];
	clientForm: FormGroup = new FormGroup({});
	clientWordIdx: any = {
		idx: [0],
		index: ['Selection_0']
	};
	isLoadtable: boolean = false;
	
	clientValIdx: any = {
		idx: [0],
		grp: [0],
		freeTextCondition: ['and'],
		freeText: ['']
	}
	valueCount: any = {
		idx: [0]
	}
    constructor(
		private _fb: FormBuilder,
        private _service: PathService,
		private _store: StoreService,
		private _state: DashboardState,
        private _dashboard: DashboardService
    ) {
        this.secCode = this._service.secCode;
    }
    ngOnInit() { 
		const store = this._store.store;
		const storage = store[this._state.code[this.secCode].storage];

		this.clientForm = this._fb.group({
			'word-index-0': [''],
			'freeText-0-0': [''],
			'freeTextCondition-0-0':['']
		});
		this.watchForm();
        let receive = this._dashboard.pathologyStore$.subscribe(res => {
			res['client'].length ? this.dataSource = res['client'] : this.dataSource = [];
//			//console.log(this.dataSource);
			this.condition = res['condition'];
			setTimeout(() => {
				this.activeId = this.acc.activeIds[0];
				if(this.activeId) {
					this.clientIdx = this.acc.activeIds[0].split('-')[1];
				}
				
			}, 10);
		});	
		
		Promise.resolve(receive).then(
			() => {	
				if(storage && storage.name1) {
					this.setDynamicForm(storage, storage.name1);
				}
				
			}
		);
		

    }
    // 색인 Input 동적 구성
	setDynamicForm(storage: any, data: string[]): void {
//		//console.log('색인 INPUT 동적 구성 name');
		for(let i = 0; i < data.length; i++) {
			this.clientWordIdx.index[i] = data[i];
		}
		if (data.length > 0) {
			this.clientValIdx.idx.pop();
			this.clientValIdx.grp.pop();
			this.clientValIdx.freeTextCondition.pop();
			this.clientValIdx.freeText.pop();
			this.clientWordIdx.idx.pop();
		}
		
		for(let i = 0; i<data.length; i++) {
			this.clientWordIdx.idx.push(i);
			
			let text: FormControl = new FormControl(data[i]);
			
			this.clientForm.addControl(`word-index-${i}`, text);

			let storageFreeText = storage.freeText[i];
			let storageFreeCond = storage.freeTextCondition[i];

			if (storage.freeText[i] == '') {
//				//console.log('동적 초기화')
				let free: FormControl = new FormControl('');
				let cond: FormControl = new FormControl('');

				this.clientValIdx.grp.push(0);
				this.clientValIdx.idx.push(0);
				this.clientValIdx.freeText.push('');
				this.clientValIdx.freeTextCondition.push('and');

				this.clientForm.addControl(`freeText-${i}-0`, free);
				this.clientForm.addControl(`freeTextCondition-${i}-0`, cond);
			} else {
				var sft = storageFreeText.split(',');
				var sfc = storageFreeCond.split(',');

//				//console.log('dynamic : ' + i);
//				//console.log(sft);
//				//console.log(sfc);

				for(let j = 0; j < sft.length; j++) {
//					//console.log(sft[j]);
					let free: FormControl = new FormControl('');
					let cond: FormControl = new FormControl('');
					this.valueCount.idx[i] = j;
					this.clientValIdx.idx.push(j);
					this.clientValIdx.grp.push(i);
					this.clientValIdx.freeText.push(sft[j]);
					this.clientValIdx.freeTextCondition.push(sfc[j]);

					this.clientForm.addControl(`freeText-${i}-${j}`, free);
					this.clientForm.addControl(`freeTextCondition-${i}-${j}`, cond);
//					//console.log(this.clientValIdx)
				}
			}
		}

//		//console.log('동적 변경 후 this.clientWordIdx');

//		//console.log(this.clientWordIdx);
	}
	// 색인 변경 시 저장
	activeWordIndex(event, idx): void {
		////console.log('activWord');
		////console.log(idx);	
//		//console.log(event, idx)	;
		this._dashboard.setWordIndex([this.secCode, idx, event]);
	}
	// 그룹 삭제
	deleteClient(event: MouseEvent, idx: number) {
		event.preventDefault();
		event.stopPropagation();	
		
		this.clientForm.removeControl(`word-index-${idx}`);

		this.delGroup(idx);

		if(this.clientWordIdx.idx.length > 1) {
			this.clientWordIdx.index.splice(idx, 1);
			this.clientWordIdx.idx.splice(idx, 1);
		} else {
			this.clientWordIdx = {
				idx: [0],
				index: ['Selection_0']
			};

			let text: FormControl = new FormControl(this.clientWordIdx.index[0]);
			this.clientForm.addControl(`word-index-0`, text);
			
		}
		this._dashboard.removeClientGroup(this.secCode, idx);	
		setTimeout(() => {
			this.acc.activeIds = this.acc.panels.last.id;
			this._dashboard.setActiveTab(this.acc.panels.last.id.split('-')[1]);
		}, 10);	
		//this._service.removeClientGroup(this.secCode, idx);	
	}
    onDeleteRow(data: Model.MedicalList): void {
        this._dashboard.removeData(this.secCode, this.clientIdx, data.data);
    }
    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
		this._dashboard.setAddGrid(true);
		setTimeout(() => { this.isLoadtable = true; }, 50);
	}
	// 그리드 추가
	addGrid(event): void {	
		let text: FormControl = new FormControl('');
		let free: FormControl = new FormControl('');
		let cond: FormControl = new FormControl('');
			
//		//console.log('========addGrid==========');
		const idx = this.acc.panels.last.id.split('-');

//		//console.log('last idx# : ' + idx[1]);

		let indexof = Number(idx[1]) + 1;
		this.clientWordIdx.index.push(`Selection_${indexof}`);
		this.clientWordIdx.idx.push(indexof);
//		//console.log('make a grid# : ' + indexof);
		
		this.addGroup(indexof);
		
		this.clientValIdx.grp.push(indexof);
		this.clientValIdx.idx.push(0);
		this.clientValIdx.freeText.push('');
		this.clientValIdx.freeTextCondition.push('and');

//		//console.log(this.clientValIdx)

		this.clientForm.addControl(`word-index-${indexof}`, text);
		this.clientForm.addControl(`freeText-${indexof}-0`, free);
		this.clientForm.addControl(`freeTextCondition-${indexof}-0`, cond);
//		//console.log(this.clientForm)
		Promise.resolve(this._dashboard.addClientGrid(this.secCode))
		.then(
			() => {
				setTimeout(() => {
					this.acc.toggle(`${idx[0]}-${indexof}`);
				}, 100);
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
	
	inputFocus(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
	}

	//Value
	addValue(grpNo: number) : void {
		////console.log(this.dataSource);
		let grp = grpNo;
		let idx = this.valueCount.idx[grp] + 1;
		
		let text: FormControl = new FormControl('');
		let cond: FormControl = new FormControl('');
		this.clientValIdx.grp.push(grp);
		this.clientValIdx.idx.push(idx);
		this.clientValIdx.freeText.push('');
		this.clientValIdx.freeTextCondition.push('and');
		this.clientForm.addControl(`freeText-${grp}-${idx}`, text);
		this.clientForm.addControl(`freeTextCondition-${grp}-${idx}`, cond);
		this.valueCount.idx[grp] += 1;

		////console.log('=================addvalue()=========================');
		////console.log('this.valueCount.idx[grp] : ' + this.valueCount.idx[grp]);
		////console.log('current grp : ' + this.clientValIdx.grp);
		////console.log('current index : ' + this.clientValIdx.idx);
		////console.log('current freeTextCondition : ' + this.clientValIdx.freeTextCondition);
		////console.log('current freeText : ' + this.clientValIdx.freeText);
		////console.log('current freeText : ' + `freeText-${grp}-${idx}`);
		////console.log('current freeTextCond : ' + `freeTextCondition-${grp}-${idx}`);
	}

	addGroup(grpNo: number) {
		if (this.valueCount.idx[grpNo] == null) {
			////console.log("plus count")
			this.valueCount.idx.push(0);
			////console.log(this.valueCount.idx);
		}
	}

	delValue(grpNo: number) {
		if (this.clientValIdx.idx.length > 1) {
			this.clientValIdx.grp.splice(this.clientValIdx.grp.length - 1, 1);
			this.clientValIdx.idx.splice(this.clientValIdx.idx.length - 1, 1);
			this.clientValIdx.freeTextCondition.splice(this.clientValIdx.freeTextCondition.length - 1, 1);
			this.clientValIdx.freeText.splice(this.clientValIdx.freeText.length - 1, 1);

			////console.log('=================delvalue()=========================');
			////console.log('before index : ' + this.clientValIdx.idx);
			////console.log('before grp : ' + this.clientValIdx.grp);
			////console.log('before freeTextCondition : ' + this.clientValIdx.freeTextCondition);
			////console.log('before freeText : ' + this.clientValIdx.freeText);
			////console.log('before valueCount : ' + this.valueCount.idx[grpNo]);
			let delIdx = this.valueCount.idx[grpNo];
			
			setTimeout(() => {
				////console.log("del control : " + `freeText-${grpNo}-${delIdx}`);
				////console.log("del control : " + `freeTextCondition-${grpNo}-${delIdx}`);
				
				this.clientForm.removeControl(`freeText-${grpNo}-${delIdx}`);
				this.clientForm.removeControl(`freeTextCondition-${grpNo}-${delIdx}`);
				this.clientForm.updateValueAndValidity();
			}, 10);
			this.valueCount.idx[grpNo] -= 1;
		}
	}

	delGroup(grpNo: number) : void {
		let len = this.clientValIdx.idx.length
		this.valueCount.idx[grpNo] = 0;
		//지울 그륩 컨트롤 및 data 삭제
		for (let i = len - 1; i >= 0; i--) {	
			if (grpNo == this.clientValIdx.grp[i]) {
				////console.log("catch!! : " + "grp : " + this.clientValIdx.grp[i] + " idx : " + this.clientValIdx.idx[i])
				setTimeout(() => {
					this.clientForm.removeControl(`freeText-${grpNo}-${this.clientValIdx.idx[i]}`);
					this.clientForm.removeControl(`freeTextCondition-${grpNo}-${this.clientValIdx.idx[i]}`);
				}, 10);
				this.clientValIdx.grp.splice(i, 1);
				this.clientValIdx.idx.splice(i, 1);
				this.clientValIdx.freeText.splice(i, 1);
				this.clientValIdx.freeTextCondition.splice(i, 1);

			}	
		}

		if(this.clientValIdx.idx.length == 0) {
			////console.log('length = 1')
			this.clientValIdx = {
				idx: [0],
				grp: [0],
				freeText: [''],
				freeTextCondition: ['and']
			};
			let text: FormControl = new FormControl('');
			let cond: FormControl = new FormControl('');
			
			this.clientForm.addControl(`freeText-0-0`, text);
			this.clientForm.addControl(`freeTextCondition-0-0`, cond);
		} 
	}

	// 폼 변경 여부 관찰.
	watchForm(): void {
		
		this.clientForm.valueChanges
			.debounceTime(1000)
			.distinctUntilChanged()
			.subscribe(res => {	
				////console.log('Path-client!');	
				this.freeTextAction = [];
				this.freeTextCondAction = [];
				this.freeTextCateAction = [];
				this.freeTextIdxAction = [];
				////console.log(this.dataSource);	
				let i = 0;
				for(let key of Object.keys(res)) {
//					//console.log(key);
					const title = key.split('-')[0];
					const idx = key.split('-')[1];

					if(title === 'freeText' || title === 'freeTextCondition') {
						const head = key.split('-')[0];
						const grp = key.split('-')[1];
						const idx = key.split('-')[2];

						if(head === 'freeText') {
							if(res[key] === '') {
								for(let i = 0; i < this.clientValIdx.freeText.length; i++) {
									if(grp == this.clientValIdx.grp[i] &&
									   idx == this.clientValIdx.idx[i]) {
									   	this.freeTextAction.push(this.clientValIdx.freeText[i]);
									   }
										
								}	
							} else {
								this.freeTextAction.push(res[key]);
							}						
							this.freeTextCateAction.push(grp);
							this.freeTextIdxAction.push(idx);
						} else if(head === 'freeTextCondition') {
							if(res[key] === '') {
								this.freeTextCondAction.push('and');
							} else {
								this.freeTextCondAction.push(res[key]);
							}
						}					
					}
					i++;
				}
				this.sendData();
		});
	}

	sendData(): void {
//		//console.log('---------action 초기화 전--client--------')
//		//console.log(this.freeTextAction);
//		//console.log(this.freeTextCondAction);
//		//console.log(this.freeTextCateAction);
//		//console.log(this.freeTextIdxAction);
		const text = [], condition = [];
		const tmpFreeText = [], tmpFreeCond = [];
		for(let i = 0; i < this.freeTextAction.length; i++) {
//			//console.log(this.clientValIdx.freeText[i]);
//			//console.log(this.freeTextAction[i]);
			this.clientValIdx.freeText[i] = this.freeTextAction[i];
			this.clientValIdx.freeTextCondition[i] = this.freeTextCondAction[i];
		}

		for(let i = 0; i < this.freeTextAction.length; i++) {
			for(let j = 0; j < this.freeTextAction.length ; j++) {
				if(this.freeTextCateAction[i] == j) {
					if(text[j] == null) {
						text[j] = ''; condition[j] = '';
					}
					text[j] += this.freeTextAction[i] + ',';
					condition[j] += this.freeTextCondAction[i] + ',';
				}
			}
		}
		////console.log(text);
		////console.log(condition);
		for(let i = 0; i < text.length; i++) {
			tmpFreeText.push(text[i].substring(0,text[i].length - 1));
			tmpFreeCond.push(condition[i].substring(0,condition[i].length - 1));
		}	
		
//		//console.log('sendData after');
//		//console.log(this.freeTextAction);
//		//console.log(this.freeTextCondAction);

		const freeTextCtrl = {
			freeText: tmpFreeText,
			freeTextCondition: tmpFreeCond
		}
		PathService.etcFreeCtrl = JSON.parse(JSON.stringify(freeTextCtrl));
		this._dashboard.addDataCondition(this._service.secCode, freeTextCtrl);
//		//console.log(this.clientValIdx);	

	}
}