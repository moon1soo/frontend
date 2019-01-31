import { NgModule } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpModule, Http } from '@angular/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PerfectScrollbarModule } from 'angular2-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'angular2-perfect-scrollbar';

import { HttpClientModule, HttpClient } from '@angular/common/http';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { DxDataGridModule, DxLoadPanelModule } from 'devextreme-angular';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ClickOutsideModule } from 'ng-click-outside';

import { AddItemFilter } from './sidebar/pipe.additem';
import { OutputItemFilter } from './patientlist/pipe.outputitem';

import { DiagramRoutes } from './diagram.routing';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DiagramComponent } from './diagram.component';
import { PaperComponent } from './paper/paper.component';
import { PropsPtlistServerComponent  } from './properties/props-ptlist-server.component';
import { PropsPtlistClientComponent  } from './properties/props-ptlist-client.component';
import { PropsLtServerComponent  } from './properties/props-lt-server.component';
import { PropsLtClientComponent  } from './properties/props-lt-client.component';
import { PropsFilterServerComponent  } from './properties/props-filter-server.component';
import { PropsFilterClientComponent  } from './properties/props-filter-client.component';
import { PropsDateComponent } from './properties/props-date.component';
import { PropsAgeComponent } from './properties/props-age.component';
import { PropsCheckComponent } from './properties/props-check.component';
import { PropsRadioComponent } from './properties/props-radio.component';
import { PropsYnComponent } from './properties/props-yn.component';
import { PropsRangeComponent } from './properties/props-range.component';
import { PropsFreeTextComponent } from './properties/props-freetext.component';
import { PropsPnComponent } from './properties/props-pn.component';
import { PatientListComponent } from './patientlist/patient-list.component';
import { ResultSummaryComponent } from './patientlist/result-summary.component';
import { PopulationChart } from './patientlist/population.chart';
import { FinalResult } from './final/final-result.component';
import { ScenarioListComponent } from './scenario/scenario-list.component';
import { BasicViewComponent } from './basicview/basic-view.component';
import { DiagramDatepicker } from './diagram.datepicker';
import { AddItemComponent } from './patientlist/add-item.component';
import { DxProgressBarModule, DxTreeListModule } from 'devextreme-angular';

import { basicSharedModule } from '../sharedmodule/basic.module';
// import { SharedAdminModule } from '../basicmode/sharedmodule/share-admin.module';

import { DxChartModule } from 'devextreme-angular';

import { StompConfig, StompService } from '@stomp/ng2-stompjs';
import { stompConfig } from '../basicmode/stomp/stomp';

import { IrbApprovalModal } from './patientlist/irb-approval-modal.component';
import { DiagramState } from './diagram.state';

import { AdminModal } from './admin/admin-modal.component';
import {AdminModule} from '../admin/admin.module';
// import { AdminModule } from '../basicmode/admin/admin.module';

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: false
};

@NgModule({
    declarations: [
		ToolbarComponent,
		SidebarComponent,
		AddItemFilter,
		OutputItemFilter,
		DiagramComponent,
		PaperComponent,
		PropsPtlistServerComponent,
		PropsPtlistClientComponent,
		PropsLtServerComponent,
		PropsLtClientComponent,
		PropsFilterServerComponent,
		PropsFilterClientComponent,
		PropsDateComponent,
		PropsAgeComponent,
		PropsCheckComponent,
		PropsRadioComponent,
		PropsYnComponent,
		PropsRangeComponent,
		PropsFreeTextComponent,
		PropsPnComponent,
		PatientListComponent,
		PopulationChart,
		ResultSummaryComponent,
		FinalResult,
		ScenarioListComponent,
		BasicViewComponent,
		DiagramDatepicker,
		IrbApprovalModal,
		AdminModal,
		AddItemComponent
	],
  	imports: [
		CommonModule,
		RouterModule.forChild(DiagramRoutes),
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		HttpClientModule,
		NgbModule.forRoot(),
		PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
		SplitPaneModule,
		ClickOutsideModule,
		DxChartModule,
		basicSharedModule,
		// AdminModule,
		// SharedAdminModule,
		DxProgressBarModule,
		DxTreeListModule
      , AdminModule
  	],
	providers: [
		StompService,
		{
			provide: StompConfig,
			useValue: stompConfig
		},
		DiagramState
    ],
	entryComponents: [
		ScenarioListComponent,
		IrbApprovalModal,
		AdminModal
	]
})

export class DiagramModule {}
