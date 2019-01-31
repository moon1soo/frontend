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
	selector: 'props-filter-server',
	templateUrl: './props-filter-server.component.html'
})
export class PropsFilterServerComponent implements OnChanges, OnInit {
	@ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @Input() selectionDataCell: Model.SelectData;
    propsTitle: string = '';
    filterType: string = 'LT';
	secCode: string;
	seqIdx: string;
	seqIndex: number;

    allMode: string = 'allPages';

    dataSource: any[];
    selectedRowsData: any;
    clickTimer: any;
    lastRowCLickedId: any;

    totalCount: string;
	resultCount: string;
	hiddenMode: boolean = false;
	useYn: boolean = false;

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

			let requestFilterList = () => {
				this._service.selectFilterList({
					ctgCd: this.selectionDataCell.ctgCd,
					itemCd: this.selectionDataCell.itemCd
				}).subscribe(res => {
					this.selectedRowsData = res;
					this._service.addData(this.selectionDataCell, this.selectedRowsData);
				});
			}
            if(this.selectionDataCell.filterType === this.filterType) {
                this._service
                    .list({
                        ctgCd: this.selectionDataCell.ctgCd,
						itemCd: this.selectionDataCell.itemCd,
						filter: this.filterType,
						groupId: this.selectionDataCell.id
                    })
                    .subscribe(res => {
						// 셀 내용이 스토어에 있는지 확인. 있으면 getStorage 실행.
						if (this._store.store['finalResultStore']) {
							const store = this._store.store['finalResultStore'].filter.slice(0);
							const group = store.filter((obj) => {
								const arr = obj.split('|');
								return arr[0] === this.selectionDataCell.ctgCd && arr[1] === this.selectionDataCell.itemCd;
							});
							
							if (group[0]) {
								// this.getStorage(group[0].split('|')[2]);
							}
						}
						requestFilterList();
					});				
            }
        }
	}
	clearSearchPanel () {
        this.dataGrid.instance.clearFilter('search');
    }
	// 스토어 결과 반영
	getStorage(store: any): void {
		const item = store.split(',');

		const match = this.dataSource.filter(function(obj) {
			return ~item.indexOf(obj.CODE);
		});
		console.log('필터 관련', match);

		this._service.addData(this.selectionDataCell, match);
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
		event.component.option("loadPanel.enabled", false);
		
		if (event.selectedRowsData.length > 1000) {
			notify(this._translate.instant('renewal2017.p.over-thousand'), 'error', 3000);
			event.component.deselectAll();
		} else {
			this.selectedRowsData = event.selectedRowsData;
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

			}, 150);
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
				return this._service.addData(this.selectionDataCell, this.selectedRowsData);
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
