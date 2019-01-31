import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent, DxLoadPanelModule, DxPopupModule } from 'devextreme-angular';
import { DxTextBoxModule, DxBoxModule } from 'devextreme-angular';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { ItemManagerService } from './item-manager.service';
import { AppState } from '../../../app.state';

declare const $: any;

@Component({
 	selector: 'item-manager',
    templateUrl: './item-manager.component.html',
    providers: [ ItemManagerService ]
})

export class ItemManagerComponent implements OnInit {
    @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @ViewChild('popupGrid') popupGrid: DxDataGridComponent;
    @Output() select = new EventEmitter();
    
    loading: boolean = true;
    popupLoading: boolean = true;

    ynLookup: any[] = [
        { ID: 'Y', Name: 'Y' },
        { ID: 'N', Name: 'N' },
    ];

    typeLookup: any[] = [
        { ID: 'C', Name: '공통' },
        { ID: 'P', Name: '파워모드' },
        { ID: 'A', Name: 'Output Items' },
        { ID: 'D', Name: '개발모드' },
        { ID: 'N', Name: '사용안함' },
    ];

    dataLookup: any[];
    filterLookup: any[];

    dataSource: any[] = [];
    popupSource: any[] = [];
    filterSource: any[] = [];
    detailSource: any[] = [];

    allMode: string = 'allPages';
    checkBoxesMode: string = 'onClick';

    popupVisible: boolean = false;
    
    rowData: any;
    rowIndex: any;

    clickTimer: any;
	lastRowCLickedId: any;

    selectedData: any;
    mode: any;

    showDetail: boolean = false;

    addible: boolean = false;

	constructor(
		private _service: ItemManagerService,
		private _app: AppState
	) {
        
	}
	ngOnInit() {
        // Metadata Item List 불러오기
        this.loadData();
        
        // Datatype List 불러오기
        this.loadDatatype();

        // Filter Type  List 불러오기
        this.loadFiltertype();
    }
    onContentReady(e) {
        e.component.option("loadPanel.enabled", false);
    }

    onEditorPreparing(e) {
        if (e.parentType === 'dataRow'
            && (e.dataField === 'itemCd' || e.dataField === 'mskColNm' || e.dataField === 'ltTabNm'
                || e.dataField === 'itemColNm' || e.dataField === 'filterItemColNm' || e.dataField === 'useItemColCd')) {
            e.editorOptions.disabled = true;

            if (e.dataField === 'itemColNm' || e.dataField === 'filterItemColNm' || e.dataField === 'useItemColCd') {
                let type = '';

                if (e.dataField === 'itemColNm') {
                    this.mode = 'itemColNm';
                    type = 'P';
                } else if (e.dataField === 'filterItemColNm') {
                    this.mode = 'filterItemColNm';
                    type = 'A';
                } else if (e.dataField === 'useItemColCd') {
                    this.mode = 'useItemColCd';
                    type = 'P';
                }

                const category = e.row.values[1];

                this.dataSource.forEach((item, idx) => {
                    if (item === e.row.data) {
                        this.rowIndex = idx;
                    }
                });

                if (typeof this.rowIndex === 'undefined') {
                    this.rowIndex = this.dataSource.length;
                }

                console.log('rowIndex', this.rowIndex);

                this._service.getMetaColumnOnTableList(type, category).subscribe(res => {
                    this.dataGrid.noDataText = this._app.tableText.load;

                    setTimeout(() => {
                        this.popupLoading = false;
                        this.dataGrid.noDataText = this._app.tableText.noData;
                    }, 800);

                    this.popupSource = res.allList;
                    this.popupVisible = true;
                });
            } else if (e.dataField === 'ltTabNm') {
                this.mode = 'ltTabNm';

                this.dataSource.forEach((item, idx) => {
                    if (item === e.row.data) {
                        this.rowIndex = idx;
                    }
                });

                this._service.getLookUpTableTypeList().subscribe(res => {
                    this.dataGrid.noDataText = this._app.tableText.load;

                    setTimeout(() => {
                        this.popupLoading = false;
                        this.dataGrid.noDataText = this._app.tableText.noData;
                    }, 800);

                    this.popupSource = res.allList;
                    this.popupVisible = true;
                });
            }

            this.dataGrid.instance.closeEditCell();
        }
    }

    onSelectionChanged(e) {
        if (this.mode === 'ltTabNm') {
            const idx = e.component.getRowIndexByKey(e.component.getSelectedRowKeys()[0]);

            if (idx > -1) {
                this.detailSource = this.popupSource[idx]['list'];
                this.popupGrid.height = 195;
                this.showDetail = true;
            }
        } else {
            this.popupGrid.height = 445;
        }
    }

    onRowClick(e) {
        const row = e.component.getSelectedRowsData();

        if (this.clickTimer && this.lastRowCLickedId === e.rowIndex) {
            clearTimeout(this.clickTimer);
            this.clickTimer = null;
            this.lastRowCLickedId = e.rowIndex;
            if (row.length > 0) {
                if (this.mode === 'itemColNm') {
                    this.dataSource[this.rowIndex].itemColNm = row[0]['columnName'];
                    this.dataSource[this.rowIndex].itemCd = row[0]['itemCd'];
                } else if (this.mode === 'filterItemColNm') {
                    this.dataSource[this.rowIndex].filterItemColNm = row[0]['columnName'];
                } else if (this.mode === 'useItemColCd') {
                    this.dataSource[this.rowIndex].useItemColCd = row[0]['columnName'];
                } else if (this.mode === 'ltTabNm') {
                    this.dataSource[this.rowIndex].ltTabNm = row[0]['code'];
                    this.showDetail = false;
                }

                e.component.deselectAll();
                this.popupVisible = false;
            }
        } else {
            this.clickTimer = setTimeout(() => {
            }, 150);
        }

        this.lastRowCLickedId = e.rowIndex;
    }

    onToolbarPreparing(e) {
        this._service.getCategoryList().subscribe(res => {
            this.filterSource = [];
            this.filterSource.push('All');

            res.allList.forEach((item) => {
                this.filterSource.push(item.ctgCd);
            });
        });

        e.toolbarOptions.items.unshift(
            {
                location: 'before',
                template: 'filterBox'
            },
            {
                location: 'after',
                template: 'buttonBox'
            });
    }

    selectFilter(e) {
        if (e.value === 'All') {
            this.addible = false;
            this.dataGrid.instance.clearFilter();

        } else {
            this.addible = true;
            this.dataGrid.instance.filter(['ctgCd', '=', e.value]);
        }
    }

	loadData() {
        this._service.getItemList().subscribe(res => {
			setTimeout(() => {
				this.loading = false;
				this.dataGrid.noDataText = this._app.tableText.noData;
			}, 800);

            this.dataSource = res.allList;
        });
    }

    loadDatatype() {
        this.dataLookup = [];

        this._service.getDataTypeList().subscribe(res => {
            res.allList.forEach((item) => {
                this.dataLookup.push({
                    ID: item.code,
                    Name: item.text
                });
            });
        });
    }

    loadFiltertype() {
        this.filterLookup = [];

        this._service.getFilterTypeList().subscribe(res => {
            res.allList.forEach((item) => {
                this.filterLookup.push({
                    ID: item.code,
                    Name: item.text
                });
            });
        });
    }

    saveData() {
        this._service.mergeIntoItem(this.dataSource).subscribe();
    }

    addData() {
        this.dataGrid.instance.addRow();
    }
}
