import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { RouterModule } from '@angular/router';

import {NgbModule, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome'
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CodemirrorModule } from 'ng2-codemirror';
// import { CookieService, CookieOptions } from 'angular2-cookie/core';
import { DxDataGridModule, DxProgressBarModule, DxFileUploaderModule, DxLoadPanelModule } from 'devextreme-angular';

import { AppState } from './app.state';

import { AppRoutes } from './app.routing';
import { AppComponent } from './app.component';
import { ErrorComponent } from './session/error/error.component';
import { HandleError } from './modal/handle-error.component';
import { ConfModal } from './modal/conf-modal.component';
import { JobStatusModal } from './modal/job-status-modal.component';
import { ExcelDownloadModal } from './modal/excel-download-modal.component';
import { SqlPreviewModal } from './modal/sql-preview-modal.component';
import { SaveQueryModal } from './modal/save-query-modal.component';
import { ConvertModal } from './modal/convert-modal.component';
import { HelpModal } from './modal/help-modal.component';
import { RefreshModal } from "./modal/refresh-modal.component";
import { NoIrbModal } from "./modal/no-irb-modal.component";
import { DeleteScenarioModal } from './modal/delete-scenario-modal.component';
import { ShareListModal } from './modal/share-list-modal.component';
import { UploadPatientsModal } from './modal/upload-patients-modal.component';
import { TransposeModal } from './modal/transpose-modal.component';
import { IrbApprovalModal } from './basicmode/interimresult/irb-approval-modal.component';

import { GateComponent } from './gate/gate.component';
import { SettingComponent } from './setting/setting-component';
import { DashboardFunc } from './basicmode/dashboard.func';

import { StompConfig, StompService } from '@stomp/ng2-stompjs';
import { stompConfig } from './basicmode/stomp/stomp';

import { SignInComponent } from './signIn/sign-in.component';
import { AppService } from './app.service';
import { InitService } from './init.service';
import { ItemListState  } from './item-list.state';
// import { SharedAdminModule } from './basicmode/sharedmodule/share-admin.module';
// import { DateRangePicker } from './widget/daterangepicker';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
export function init(config: InitService) {
	return () => {
	  	return config.load();
	};
  }
@NgModule({
	declarations: [
		AppComponent,
		ErrorComponent,
		HandleError,
		ConfModal,
		SqlPreviewModal,
		GateComponent,
		HelpModal,
		SaveQueryModal,
		ConvertModal,
		ExcelDownloadModal,
		JobStatusModal,
		RefreshModal,
		NoIrbModal,
		SignInComponent,
		DeleteScenarioModal,
		ShareListModal,
		UploadPatientsModal	,
		TransposeModal,
		IrbApprovalModal,
		// DateRangePicker
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		HttpClientModule,
		RouterModule.forRoot(AppRoutes),
		NgbModule.forRoot(),
		TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
		Angular2FontawesomeModule,
		CodemirrorModule,
		DxDataGridModule,
		DxFileUploaderModule,
		SplitPaneModule,
		DxProgressBarModule,
		DxLoadPanelModule
		// SharedAdminModule
	],
	providers: [ 
		ItemListState,
		AppState, 
		AppService,
		DashboardFunc,
		InitService,
        {
			provide: APP_INITIALIZER,
			useFactory: init,
			deps: [InitService],
			multi: true
		},
		NgbActiveModal,
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	entryComponents: [
		HandleError,
		ConfModal,
		SqlPreviewModal,
		HelpModal,
		SaveQueryModal,
		ConvertModal,
		ExcelDownloadModal,
		JobStatusModal,
		RefreshModal,
		NoIrbModal,
		DeleteScenarioModal,
		ShareListModal,
		UploadPatientsModal,
		TransposeModal,
		IrbApprovalModal
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
