import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { DxDataGridModule, DxDataGridComponent, DxTreeListModule, DxTreeListComponent } from 'devextreme-angular';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { StoreService } from '../../store/store.service';
import { DashboardFunc } from '../../dashboard.func';
import { ConcernService } from './concern.service';
import { DashboardService } from '../../dashboard.service';
import { DashboardState } from 'app/basicmode/dashboard.state';

import * as Model from '../../model/dashboard.model';
import 'devextreme/integration/jquery';

declare const $: any;

@Component({
 	selector: 'concern-server',
	templateUrl: './concern-server.component.html'
})

export class ConcernServerComponent implements OnInit {
	@ViewChild(DxTreeListComponent) treeList: DxTreeListComponent;
	dataSource: Model.ConcernList[] = [];

	totalCount: string;
	resultCount: string;
	allMode: string = 'allPages'; 	
	loading: boolean = true;

	secCode: string;
	clientIdx: number = 0;

	clickTimer: any;
	lastRowCLickedId: any;

	addData: any[] = [];
	patientData: any[] = [];

	selectedRowsData: Model.ConcernList;
	selectedKeys: number[];
	selectedPatient: any;
	// recursiveSelectionEnabled = false;

	uploadPatient: Number = null;

	constructor(
		private _fb: FormBuilder,
		private _service: ConcernService,
		private _func: DashboardFunc,
		private _state: DashboardState,
		private _dashboard: DashboardService,
		private _store: StoreService
	) {
		this.secCode = this._service.secCode;
	}
	ngOnInit() {
		this._dashboard.concernPatientStore$.subscribe(res => {
			this.dataSource = res.server;
			this.totalCount = res.server.length.toLocaleString();

			// 클라이언트 데이터가 전부 삭제되면 체크되어있는 항목 해제
			// if (res['client'].length && res['client'][0].length === 0) {
			// 	this.treeList.instance.deselectAll();
			// }

			setTimeout(() => { this.loading = false; }, 300);
		});

		this._store.deleteVo$.subscribe(res => {
			// 해당 스토어가 삭제되면 체크되어있는 항목 해제
			if (res === 'concernPatientStore') {
				this.treeList.instance.deselectAll();
			}
		});
	}
	// 테이블 row 선택 이벤트
	onSelectionChanged(event: any): void {
		this.selectedRowsData = this.treeList.instance.getSelectedRowsData();
		this.selectedKeys = this.treeList.instance.getSelectedRowKeys(true);
		this.selectedPatient = [];

		for (const key of this.selectedKeys) {
			const patient = this.treeList.instance.getNodeByKey(key).data;
			if(patient.fldrYn === 'N') {
				this.selectedPatient.push(patient);
			}
		}
		// console.log('선택 환자 목록',this.selectedPatient.length);
	}
	
	// 선택한 항목 적용
	// apply() {
	// 	const exist = [];
	// 	const patients = [];

	// 	const store = this._store.store;
	// 	const storage = store.concernPatientStore;

	// 	if (storage) {
	// 		const select = storage.select1;

	// 		if (select && select.length) {
	// 			for (const sel of select) {
	// 				exist.push(sel);
	// 			}
	// 		}
	// 	}

	// 	const existStr = exist.join(',');

	// 	const keys = this.treeList.instance.getSelectedRowKeys(true);

	// 	for (const key of keys) {
	// 		const patient = this.treeList.instance.getNodeByKey(key).data;

	// 		if (existStr.indexOf(patient.allPtNo) < 0) {
	// 			patients.push(patient);
	// 		}
	// 	}

	// 	this.addSelectData(patients);
	// }

	// 테이블 더블클릭
	onRowClick(event: any) {
		if (this.clickTimer && this.lastRowCLickedId === event.rowIndex) {
			clearTimeout(this.clickTimer);
			this.clickTimer = null;
			this.lastRowCLickedId = event.rowIndex;
			// return this.addSelectData(this.selectedPatient);
		} else {
			this.clickTimer = setTimeout(function() {

			}, 250);
		}
		this.lastRowCLickedId = event.rowIndex;
	}
	
	// 테이블 row 선택 이벤트
	addSelectData(data: Model.ConcernList[]) {
		return this._dashboard.addData(this.secCode, 0, data);
	}

	// 빈 폴더 검사하여 hidden
	onNodesInitialized(e: any) {		
		e.root.children.forEach(node => {
			if(!node.hasChildren) {
				node.visible = false;
			} else {
				let me = node;
				if(me) {
					let isParentFolder = (elem) => {
						const arr = elem.children.filter(obj => {		
							return (obj.hasChildren && obj.data.fldrYn === 'Y') || obj.data.fldrYn === 'N'
						});
						return arr;
					}
					let circu = (elem) => {			
						let isChild = isParentFolder(elem);	
						elem.children.forEach((child) => {
							if(!child.hasChildren) {
								child.data.fldrYn === 'Y' ? child.visible = false : child.visible = true;
							} else {
								me = child;
								circu(child);
							}
						});

						if(!isChild.length || !elem.hasChildren) {
							// console.log('빈 폴더 목록',isChild, elem);
							elem.visible = false;
							
							if(elem.children.length) {
								elem.children = []; elem.hasChildren = false;

								if(elem.parent) {
									let deleteEmpty = (parent) => {
										let isParent = isParentFolder(parent);										 
										if(!isParent.length) {
											parent.visible = false;
											parent.children = []; parent.hasChildren = false;
										}
										if(parent.parent) {
											deleteEmpty(parent.parent);
										}
									};
									deleteEmpty(elem.parent);
								}								
							}							
						}						
					} 
					circu(me);
					// console.log('트리 루트', e.root);
				} else {
					return false;
				}
			}
		});
	}

	onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
		const count = e.component.totalCount();

		this._func.tblDraggable();
		this.droppableGrid();
		
		count === this.totalCount ? this.resultCount = '0' : this.resultCount = count.toLocaleString();
		this.loadStorage();
	}

	// 그리드 drop 후 데이터 추가 처리
	droppableGrid(): void {
		$('.gridSelect').droppable({
			tolerance: "pointer",
			over: (event, ui) => {
				const parent = event.target.parentNode;
				parent.classList.add('drag-over-action');
			},
			out: ( event, ui ) => {
				const parent = event.target.parentNode;
				parent.classList.remove('drag-over-action');
			},
			drop: ( event, ui ) => {
				const parent = event.target.parentNode;
				parent.classList.remove('drag-over-action');
				// ui.draggable.remove();
				return this._dashboard.addData(this.secCode, 0, this.selectedPatient);
			}
		});
	}

	// 스토어에 저장된 값 불러오기
	loadStorage() {
		// const store = this._store.store;
		// const storage = store.concernPatientStore;

		// if (storage) {
		// 	const select = storage.select1;

		// 	if (select && select.length) {
				
		// 		this.treeList.instance.selectAll();
		// 		const keys = this.treeList.instance.getSelectedRowKeys(true);
		// 		const data = [];
		// 		for (const key of keys) {
		// 			const temp = this.treeList.instance.getNodeByKey(key).data;
		// 			data.push(temp);
		// 		}
				
		// 		const arr = select[0].split(',');
		// 		const add = [];

		// 		for (let item of arr) {
		// 			item = item.replace(/'/g, '');

		// 			for (const dt of data) {
		// 				if (dt['allPtNo'] === item) {
		// 					add.push(dt);
		// 				}
		// 			}
		// 		}
		// 		this._dashboard.removeClientGroup('concernPatient', 0);
		// 		this.addSelectData(add);
		// 		this.treeList.instance.deselectAll();
		// 	}
		// } else {
		// 	this.treeList.instance.deselectAll();
		// }
	}

	onToolbarPreparing(event) {
		event.toolbarOptions.items.unshift({
            location: 'before',
            template: 'totalCount'
		});
	}

}
