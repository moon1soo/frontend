import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DxDataGridModule, DxDataGridComponent, DxLoadPanelModule, DxChartComponent } from 'devextreme-angular';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { TranslateService } from '@ngx-translate/core';
import { IrbOverviewService } from './irb-overview.service';
import { AppState } from '../../app.state';

declare const $: any;

@Component({
 	selector: 'irb-overview',
    templateUrl: './irb-overview.component.html',
    providers: [ IrbOverviewService ]
})

export class IrbOverviewComponent implements OnInit {
    @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
    @ViewChild(DxChartComponent) dxChart: DxDataGridComponent;
    @Output() select = new EventEmitter();
    
    loading: boolean = true;

    downloadGrid: any[] = [];
    downloadChart: any[] = [];

    searchGrid: any[] = [];
    searchChart: any[] = [];

    period: string;
    periodGroup: any[] = [];

    criteria: string;
    criteriaGroup: any[] = [];

	constructor(
		private _service: IrbOverviewService,
        private _app: AppState,
        private _translate: TranslateService,
	) {
	}
	ngOnInit() {
        this.criteria = 'month';

        this._translate.get('renewal2017.irb-overview.criteria.month').subscribe(res => {
            this.criteriaGroup.push({
                text: res,
                value: 'month'
            });
        });

        this._translate.get('renewal2017.irb-overview.criteria.year').subscribe(res => {
            this.criteriaGroup.push({
                text: res,
                value: 'year'
            });
        });

        const currentDate = new Date();

        let firstDt = '2018-04';
        const lastDt = currentDate.getMonth().toString().length === 1
            ? currentDate.getFullYear() + '-0' + String(currentDate.getMonth() + 1)
            : currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1);

        this.period = lastDt;
        this.periodGroup.push(firstDt);

        while (firstDt !== lastDt) {
            const date = firstDt.split('-');

            let yyyy = date[0];
            let mm = date[1];

            if (mm !== '12') {
                mm = String(Number(mm) + 1);
            } else {
                yyyy = String(Number(yyyy) + 1);
                mm = '01';
            }

            if (mm.length === 1) {
                mm = '0' + mm;
            }

            const tempDt = yyyy + '-' + mm;
            firstDt = tempDt;

            this.periodGroup.push(firstDt);
        }

        const year = String(currentDate.getFullYear());
        let month = String(currentDate.getMonth() + 1);

        if (month.length === 1) {
            month = '0' + month;
        }

        // 초기 화면은 당월 기준으로 데이터 로드
        this.getTop10List(year, month, 'month');
    }
    onContentReady(e) {
        e.component.option("loadPanel.enabled", false);
    }

    getTop10List(year: any, month: any, criteria: any) {
        this._service.getTop10List(year, month, criteria).subscribe(res => {
            // IRB Excel Download Top 10 List
            this.downloadGrid = res.download;
            this.downloadChart = [];

            for (const item of this.downloadGrid) {
                this.downloadChart.push({
                    name: item.stfNm,
                    count: Number(item.count)
                });

                item.count = this.addComma(item.count);
            }

            // Patients Search Top 10 List
            this.searchGrid = res.search;
            this.searchChart = [];

            for (const item of this.searchGrid) {
                this.searchChart.push({
                    name: item.stfNm,
                    count: Number(item.count)
                });

                item.count = this.addComma(item.count);
            }

            setTimeout(() => {
                this.loading = false;
            });
        });
    }


    // 카운트에 Comma 붙이기
	addComma(nm) {
		return nm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
	onToolbarPreparing(event) {
		event.toolbarOptions.items.unshift({
            location: 'before',
            template: 'totalCount'
		});
    }
    
    onValueChanged(event) {
        const value = this.period.split('-');

        const year = value[0];
        const month = value[1];

        this.getTop10List(year, month, this.criteria);
    }
}
