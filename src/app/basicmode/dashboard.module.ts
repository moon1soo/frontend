import { NgModule } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpModule, Http } from '@angular/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DxDataGridModule, DxFileUploaderModule, DxLoadPanelModule, DxToastModule } from 'devextreme-angular';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

import { PerfectScrollbarModule } from 'angular2-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'angular2-perfect-scrollbar';

import { sharedHospitalModule } from './sharedmodule/share-hospital.module';

import { DashboardRoutes } from './dashboard.routing';
import { DashboardComponent } from './dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { DashboardState } from './dashboard.state';
import { DashboardFunc } from './dashboard.func';
import { ItemListState } from '../item-list.state';

import { ConditionLayoutComponent } from './layout/condition/condition-layout.component';
import { ResultLayoutComponent } from './layout/result/result-layout.component';

import { BasicViewComponent } from './basicview/basic-view.component';

import { HospitalViewComponent } from './hospitalview/hospital-view.component';
import { HospitalSearchComponent } from './basicview/hospital/hospital-search.component';
// import { RefreshModal } from './workflow/refresh-modal.component';
import { ScenarioListComponent } from './scenario/scenario-list.component';
// import { UploadPatientsModal } from './scenario/upload-patients-modal.component';
// import { DashboardDatepicker } from './dashboard.datepicker';

import { basicSharedModule } from '../sharedmodule/basic.module';
import { StompConfig, StompService } from '@stomp/ng2-stompjs';
import { stompConfig } from './stomp/stomp';
import {AdminModule} from '../admin/admin.module';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: true
};

@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(DashboardRoutes),
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		HttpClientModule,
		NgbModule.forRoot(),
		SplitPaneModule,
		// MultiselectDropdownModule,
		sharedHospitalModule,
		basicSharedModule,
		PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG)
		// DxLoadPanelModule
	  , AdminModule,
	  	DxToastModule
  	],
  	declarations: [
		DashboardComponent,
		ToolbarComponent,
		SidebarComponent,
		ResultLayoutComponent,
		BasicViewComponent,
		HospitalViewComponent,
		HospitalSearchComponent,
		WorkflowComponent,
		ConditionLayoutComponent,
		ScenarioListComponent,
		// UploadPatientsModal
		// DashboardDatepicker
	],
	providers: [ DashboardState, DashboardFunc, ItemListState,
		StompService,
		{
			provide: StompConfig,
			useValue: stompConfig
		}
	],
	entryComponents: [
		// UploadPatientsModal
	]
})

export class DashboardModule {}
