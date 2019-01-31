import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { DiagramService } from '../diagram.service';
import { PowermodeStoreService } from '../store/store.service';

import * as _ from 'lodash';
import * as Model from '../model/diagram.model';

@Component({
 	selector: 'props-lt-client',
	templateUrl: './props-lt-client.component.html'
})

export class PropsLtClientComponent implements OnInit, OnChanges {
    @Input() selectionDataCell: Model.SelectData;

    dataSource: any = [];
	filterType: string;
	propsTitle: string = '';

    selectedRowsData: any;
    totalCount: string;

	activeId: string;
	clientIdx: number;
	condition: string;
	columns: {dataField: string; caption: string; width: number}[] = [];
	hiddenMode: boolean = false;
	useYn: boolean = false;

	isLoadtable: boolean = false;

    constructor(
		private _service: DiagramService,
		private _store: PowermodeStoreService
    ) {

    }
    ngOnInit() {
		this._service.LTStore$.subscribe(res => {        
			res['client'].length ? this.dataSource = res['client'] : this.dataSource = [];

			if(res.server[0] && res.server[0].CODE !== res.server[0].TEXT) {
				this.hiddenMode = true;
			}
			if(res.server[0] && res.server[0]['USEYN']) {
				this.useYn = true;
			} else {
				this.useYn = false;
			}
			this.condition = res['condition'];
            this.totalCount = res['client'].length.toLocaleString();
        });
    }
    ngOnChanges(): void {
		if(this.selectionDataCell) {
			this.propsTitle = this.selectionDataCell.itemNm;
		}
	}

    onDeleteRow(data: any): void {
        this._service.removeData(this.selectionDataCell, data.data);
	}
	// 그룹 삭제
	deleteClient(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		this._service.removeClientGroup(this.selectionDataCell);
	}
    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
		setTimeout(() => { this.isLoadtable = true; }, 50);
	}
	// 포함/제외
	activeBtn(event: any, seq: string): void {
		event.preventDefault();
		event.stopPropagation();

		this._service.setCondition(this.selectionDataCell, seq);
	}
}