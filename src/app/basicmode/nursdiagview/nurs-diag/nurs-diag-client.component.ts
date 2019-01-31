import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import { NursDiagService } from './nurs-diag.service';
import { StoreService } from '../../store/store.service';
import { DashboardService } from '../../dashboard.service';
import { DashboardState } from '../../dashboard.state';

import * as Model from '../../model/dashboard.model';

@Component({
 	selector: 'nurs-diag-client',
	templateUrl: './nurs-diag-client.component.html'
})

export class NursDiagClientComponent implements OnInit {
	@ViewChild('accNursDiag') acc;
    
    dataSource: any[] = [];
    selectedRowsData: Model.NursDiag;
    totalCount: string;

    secCode: string;
	activeId: string;
	clientIdx: number;
	condition: string[] = [];
	
	clientForm: FormGroup = new FormGroup({});
	clientWordIdx: any = {
		idx: [0],
		index: ['Selection_0']
	};
	isLoadtable: boolean = false;

    constructor(
		private _fb: FormBuilder,
        private _service: NursDiagService,
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
			'word-index-0': ['']
		});	
		
        let receive = this._dashboard.nursDiagStore$.subscribe(res => {			
			res['client'].length ? this.dataSource = res['client'].slice(0) : this.dataSource = [[]];
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
					this.setDynamicForm(storage.name1);
				}
			}
		);              
    }
    // 색인 Input 동적 구성
	setDynamicForm(data: string[]): void {
		this.clientWordIdx.index = data;
		this.clientWordIdx.idx = [0];

		for(let i = 1; i<data.length; i++) {
			this.clientWordIdx.idx.push(i);
			let text: FormControl = new FormControl(data[i]);
			this.clientForm.addControl(`word-index-${i}`, text);
		}
	}
	// 색인 변경 시 저장
	activeWordIndex(event, idx): void {				
		this._dashboard.setWordIndex([this.secCode, idx, event]);
	}
	// 그룹 삭제
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
		this.clientForm.removeControl(`word-index-${idx}`);
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
		this.clientForm.addControl(`word-index-${indexof}`, text);
		Promise.resolve(this._dashboard.addClientGrid(this.secCode))
		.then(
			() => {
				setTimeout(() => {
					this.acc.toggle(`${idx[0]}-${indexof}`);					
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