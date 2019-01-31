import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';
import { TranslateService } from '@ngx-translate/core';
import { ItemListState } from '../../item-list.state';
import { DiagramService } from '../diagram.service';
import { AppState } from '../../app.state';
import { PowermodeStoreService } from '../store/store.service';
import { DiagramState } from '../diagram.state';

import notify from "devextreme/ui/notify";
import * as _ from 'lodash';
declare const $: any;

import * as Model from '../model/diagram.model';

@Component({
	selector: 'props-lt-server',
	templateUrl: './props-lt-server.component.html'
})
export class PropsLtServerComponent implements OnChanges, OnInit {  
	@ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @Input() selectionDataCell: Model.SelectData;
    propsTitle: string = '';
    filterType: string = 'LT';
	secCode: string;
	seqIdx: string;
	seqIndex: number;

    // 선택할 수 있는 최대 row 갯수
    // maxRows: number = 200000000000;
	// minRows: number = 40;
	
    allMode: string = 'allPages';

	dataSource: any[];
	// columns: {dataField: string; caption: string; width: number}[] = [];
	selectedRowsData: any;
	selectedKeys: any;
    clickTimer: any;
    lastRowCLickedId: any;

    totalCount: string;
	resultCount: string;
	hiddenMode: boolean = false;
	useYn: boolean = false;
	selectedRowKeys: any[] = [];
    
	constructor(
		private _service: DiagramService,
		private _state: ItemListState,
		private _diagramState: DiagramState,
		private _globalState: AppState,
		private _store: PowermodeStoreService,
		private _translate: TranslateService
	) {
		
    }	
    ngOnInit() {
        this._service.LTStore$.subscribe(res => {
			this.dataSource = res.server;
			
			if(res.server[0] && res.server[0].CODE !== res.server[0].TEXT) {
				this.hiddenMode = true;
			}
			if(res.server[0] && res.server[0]['USEYN']) {
				this.useYn = true;
			} else {
				this.useYn = false;
			}
			this.totalCount = res['server'].length.toLocaleString();
			this.clearSearchPanel();
		});		
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
        this.dataGrid.instance.clearFilter('search');
    }
	// 스토어 결과 반영
	getStorage(store: any): void {
		// console.log(store);
		const item = store.selectCd.split('|||');
		
		const match = this.dataSource.filter((obj) => {
			return ~item.indexOf(obj.CODE);
		});
		console.log('[MATCH]', match);
		this._service.addData(this.selectionDataCell, match);
		this._service.setCondition(this.selectionDataCell, store.condition);
	}
    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
		const count = e.component.totalCount();			
        
        count === this.totalCount ? this.resultCount = '0' : this.resultCount = count.toLocaleString();
		
		if(this.dataGrid.instance) {
			this.dataGrid.instance.clearSelection();
		}
		
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
		if (event.selectedRowsData.length > 1000) {
			notify(this._translate.instant('renewal2017.p.over-thousand'), 'error', 3000);
			event.component.deselectAll();
		} else {
			let grid = event.component;
			this.selectedRowsData = event.selectedRowsData;
			this.selectedKeys = grid.getSelectedRowKeys();
		}
	}

	// 테이블 row 선택 이벤트
	addSelectData(data: any[]) {
		return this._service.addData(this.selectionDataCell, data);
	}
	// 테이블 더블클릭
	onRowClick(event: any) {
		var rows = event.component.getSelectedRowsData();
		if (this.clickTimer && this.lastRowCLickedId === event.rowIndex) {
			clearTimeout(this.clickTimer);
			this.clickTimer = null;
			this.lastRowCLickedId = event.rowIndex;
			return this.addSelectData([event.data]);
		} else {
			this.clickTimer = setTimeout(() => {
				
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
				ui.draggable.remove();
				const parent = event.target.parentNode;
				parent.classList.remove('drag-over-action');

				let rows;
				if(this.selectedRowsData.length > this._diagramState.maxAddRows) {
					rows = this.selectedRowsData.slice(0, this._diagramState.maxAddRows);
				} else {
					rows = this.selectedRowsData;
				}
				this._service.addData(this.selectionDataCell, rows);
			}
		});
	}
    onToolbarPreparing(event) {
		event.toolbarOptions.items.unshift({
            location: 'before',
            template: 'totalCount'
		});
	}
}
