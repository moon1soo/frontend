import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent, DxLoadPanelModule, DxTabsModule } from 'devextreme-angular';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { MetaManagerService } from './meta-manager.service';
import { AppState } from '../../app.state';

declare const $: any;

@Component({
 	selector: 'meta-manager',
    templateUrl: './meta-manager.component.html',
    providers: [ MetaManagerService ]
})

export class MetaManagerComponent implements OnInit {

    tabs: any[] = [
        { id: 0, text: 'Category'},
        { id: 1, text: 'Item'},
    ];

    tabContent: string;
    selectedIndex: number;

	constructor(
		private _service: MetaManagerService,
		private _app: AppState
	) {
        this.tabContent = this.tabs[0].content;
        this.selectedIndex = this.tabs[0].id;
	}
	ngOnInit() {

    }

    onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
    }

    selectTab(e) {
        this.tabContent = this.tabs[e.itemIndex].content;
        this.selectedIndex = e.itemIndex;
    }

}
