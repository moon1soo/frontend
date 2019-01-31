import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent, DxTreeListModule, DxTreeListComponent } from 'devextreme-angular';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { ItemListState } from '../../item-list.state';
import { DiagramService } from '../diagram.service';
import { AppState } from '../../app.state';
import { PowermodeStoreService } from '../store/store.service';
import { UploadPatientsModal } from '../../modal/upload-patients-modal.component';

import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';
import notify from 'devextreme/ui/notify';
declare const $: any;

import * as Model from '../model/diagram.model';

@Component({
	selector: 'props-ptlist-server',
	templateUrl: './props-ptlist-server.component.html'
})
export class PropsPtlistServerComponent implements OnChanges, OnInit {
	@ViewChild(DxTreeListComponent) treeList: DxTreeListComponent;
	@Input() selectionDataCell: Model.SelectData;

	closeResult: string;

    propsTitle: string = '';
    filterType: string = 'PTLIST';
	secCode: string;
	seqIdx: string;
	seqIndex: number;

	dataSource: any[];
	selectedRowsData: any;
	selectedKeys: number[];
	selectedPatient: any;
    clickTimer: any;
    lastRowCLickedId: any;

    totalCount: string;
	resultCount: string;
	hiddenMode: boolean = false;
	useYn: boolean = false;

	allMode: string = 'allPages';

	constructor(
		private _translate: TranslateService,
		private _modalService: NgbModal,
		private _service: DiagramService,
        private _state: ItemListState,
		private _globalState: AppState,
		private _store: PowermodeStoreService
	) {

    }
    ngOnInit() {
        this._service.LTStore$.subscribe(res => {
			this.dataSource = res.server;

			this.totalCount = res.server.length.toLocaleString();
			this.clearSearchPanel();
		});
    }
	ngOnChanges(): void {
        if(this.selectionDataCell) {
            this.propsTitle = this.selectionDataCell.itemNm;

            if(this.selectionDataCell.filterType === this.filterType) {
                this._service
                    .listPtInfo()
                    .subscribe(res => {
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
	clearSearchPanel () {
        this.treeList.instance.clearFilter('search');
    }
	// 스토어 결과 반영
	getStorage(store: any): void {
		const item = store.selectCd.split('|||');

		const match = this.dataSource.filter((obj) => {
			return ~item.indexOf(obj.ptNo);
		});

		this._service.addpatientData({
			cell: this.selectionDataCell,
			rows: match
		});
		this._service.setCondition(this.selectionDataCell, store.condition);
	}
    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);

		// jQuery
		$('.power-props-tbl tbody').draggable({
			appendTo: ".gridSelect",
			delay: 150,
			revert: 0,
			helper: function() {
				return $("<div></div>").append($(this).find('.dx-selection').clone());
			},
			start: function(event, ui) {
				let helper = $(ui.helper);
				if(helper.find('.dx-selection').length > 1) {
					helper.addClass("draggable-tr");
				} else {
					helper.addClass("draggable-tr-one");
				}
			}
		}).disableSelection();

		this.droppableGrid();
	}

    // 테이블 row 선택 이벤트
	onSelectionChanged(event) {
		this.selectedRowsData = this.treeList.instance.getSelectedRowsData();
		this.selectedKeys = this.treeList.instance.getSelectedRowKeys(true);
		this.selectedPatient = [];

		for (const key of this.selectedKeys) {
			const patient = this.treeList.instance.getNodeByKey(key).data;
			if(patient.fldrYn === 'N') {
				this.selectedPatient.push(patient);
			}
		}
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
	// 테이블 row 선택 이벤트
	addSelectData(data: any[]) {
		return this._service.addpatientData({
			cell: this.selectionDataCell,
			rows: data
		});
	}
	// 테이블 더블클릭
	onRowClick(event: any) {
		if (this.clickTimer && this.lastRowCLickedId === event.rowIndex) {
			clearTimeout(this.clickTimer);
			this.clickTimer = null;
			this.lastRowCLickedId = event.rowIndex;
		} else {
			this.clickTimer = setTimeout(function() {

			}, 250);
		}
		this.lastRowCLickedId = event.rowIndex;
    }
    // 그리드 drop 후 데이터 추가 처리
	droppableGrid(): void {
		$('.gridSelect').droppable({
			tolerance: 'pointer',
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
				this._service.addpatientData({
					cell: this.selectionDataCell,
					rows: this.selectedPatient
				});
			}
		});
	}
    onToolbarPreparing(event) {
		event.toolbarOptions.items.unshift({
            location: 'before',
            template: 'totalCount'
		});
	}

	// Upload Patients
	uploadPatients(): void {
		const modalRef = this._modalService.open(UploadPatientsModal, {
			size: 'lg'
		});
		modalRef.componentInstance.data = 'powermode';
		modalRef.result.then((result) => {
			const store = this._store.store;

			if (result && result !== 'no') {
				if(result.length < 100000) {
					store.basicStore.uploadPatients = result.response;
					this._store.setStore = store;
					
					this._store.setUpdateStore({
						index: this.selectionDataCell.index,
						id: this.selectionDataCell.id.split('_')[1],
						filterType: this.selectionDataCell.filterType,
						ctgCd: this.selectionDataCell.ctgCd,
						itemCd: this.selectionDataCell.itemCd,
						data: {
							category: this.selectionDataCell.ctgCd,
							item: this.selectionDataCell.itemCd,
							uploadPatients: result.response,
							groupId: `group_${this.selectionDataCell.id.split('_')[1]}`
						}
					});
				} else {
					notify(this._translate.instant('renewal2017.p.alert-limit-upload'), 'error', 2000);
				}
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}
}
