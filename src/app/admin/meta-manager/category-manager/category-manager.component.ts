import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent, DxLoadPanelModule, DxPopupModule } from 'devextreme-angular';
import { DxTextBoxModule, DxBoxModule } from 'devextreme-angular';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { CategoryManagerService } from './category-manager.service';
import { AppState } from '../../../app.state';
import ArrayStore from 'devextreme/data/array_store';

declare const $: any;

@Component({
    selector: 'category-manager',
    templateUrl: './category-manager.component.html',
    providers: [ CategoryManagerService ]
})

export class CategoryManagerComponent implements OnInit {
    @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @ViewChild('editGrid') editGrid: DxDataGridComponent;
    @Output() select = new EventEmitter();

    loading: boolean = true;
    tableLoading: boolean = true;

    ynLookup: any[] = [
        { ID: 'Y', Name: 'Y' },
        { ID: 'N', Name: 'N' },
    ];

    fixedSource: any[] = [];
    editableSource: any[] = [];
    tableSource: any[] = [];

    allMode: string = 'allPages';
    checkBoxesMode: string = 'onClick';

    popupVisible: boolean = false;
    sortVisible: boolean = false;

    rowData: any;
    rowIndex: any;

    ynPattern: any = /[YN]/;

    clickTimer: any;
    lastRowCLickedId: any;

    selectedData: any;
    mode: any;

    activeSave: boolean = false;

    constructor(
        private _service: CategoryManagerService,
        private _app: AppState
    ) {
    }
	ngOnInit() {
        // Metadata Category List 불러오기
        this.loadData();
    }
    onContentReady(e) {
        e.component.option("loadPanel.enabled", false);
    }

    onContentReadyForFixed(e) {
        e.component.option("loadPanel.enabled", false);
        
        e.component.option('disabled', true);
    }
    
    onContentReadyForTable(e) {
        e.component.option("loadPanel.enabled", false);
    }

    onEditorPreparing(e) {
        if (e.parentType === 'dataRow'
            && (e.dataField === 'ctgCd' || e.dataField === 'tabNm' || e.dataField === 'tabNmPower')) {
            e.editorOptions.disabled = true;

            if (e.dataField === 'tabNm' || e.dataField === 'tabNmPower') {

                if (e.dataField === 'tabNm') {
                    this.mode = 'tabNm';
                } else if (e.dataField === 'tabNmPower') {
                    this.mode = 'tabNmPower';
                }

                this.rowIndex = e.row.rowIndex;
                this._service.getTableList().subscribe(res => {
                    this.dataGrid.noDataText = this._app.tableText.load;

                    setTimeout(() => {
                        this.tableLoading = false;
                        this.dataGrid.noDataText = this._app.tableText.noData;
                    }, 800);

                    this.tableSource = res.allList;
                    this.popupVisible = true;
                });
            }

            this.editGrid.instance.closeEditCell();
        }
    }

    onRowClick(e) {
        const row = e.component.getSelectedRowsData();

        if (this.clickTimer && this.lastRowCLickedId === e.rowIndex) {
            clearTimeout(this.clickTimer);
            this.clickTimer = null;
            this.lastRowCLickedId = e.rowIndex;

            if (row.length > 0) {

                if (this.mode === 'tabNm') {
                    this.editableSource[this.rowIndex].tabNm = row[0]['tableName'];
                } else if (this.mode === 'tabNmPower') {
                    this.editableSource[this.rowIndex].tabNmPower = row[0]['tableName'];
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

    loadData() {
        this._service.getCategoryList().subscribe(res => {
            setTimeout(() => {
                this.loading = false;
                this.dataGrid.noDataText = this._app.tableText.noData;
            }, 800);

            this.fixedSource = [];
            this.editableSource = [];

            res.allList.forEach((item, idx) => {
                if (idx < 2) {
                    this.fixedSource.push(item);
                } else {
                    item.setSeq = Number(item.setSeq);
                    this.editableSource.push(item);
                }
            });
        });
    }

    saveData() {
        this._service.mergeIntoCategory(this.editableSource).subscribe();
    }
}
