import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClickOutsideModule } from 'ng-click-outside';
import { DxDataGridModule, DxFileUploaderModule, DxLoadPanelModule, DxTreeListModule } from 'devextreme-angular';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DashboardDatepicker } from '../basicmode/dashboard.datepicker';
import { NgxCarouselModule } from 'ngx-carousel';
import { SettingComponent } from '../setting/setting-component';

import { IrbLogComponent } from '../admin/irb-log/irb-log.component';
import { LoginLogComponent } from '../admin/login-log/login-log.component';
import { SqlLogComponent } from '../admin/sql-log/sql-log.component';
import { AdminComponent } from '../admin/admin.component';
import { DateRangePicker } from '../widget/daterangepicker';
import { CustomFormsModule } from 'ng2-validation'

import 'hammerjs';
import {ErrorLogComponent} from '../admin/error-log/error-log.component';
import {UserTableManagerComponent} from '../admin/user-table-manager/user-table-manager.component';
import {ErrorLogDetailModalComponent} from '../admin/error-log/error-log-detail-modal.component';
import {UserTableErrorModalComponent} from "../admin/user-table-manager/user-table-error-modal.component";
import {WorkManagerComponent} from "../admin/work-manager/work-manager.component";
import {WorkManagerModalComponent} from "../admin/work-manager/work-manager-modal.component";
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		HttpModule,
		NgbModule.forRoot(),
		TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
		Daterangepicker,
		NgxCarouselModule,
		ClickOutsideModule,
		DxDataGridModule,
		DxTreeListModule,
		DxFileUploaderModule,
		DxLoadPanelModule,
		MultiselectDropdownModule,
		CustomFormsModule,
		ReactiveFormsModule
	],
	exports: [
		TranslateModule,
		Daterangepicker,
		NgxCarouselModule,
		ClickOutsideModule,
		DxDataGridModule,
		DxTreeListModule,
		DxFileUploaderModule,
		DxLoadPanelModule,
		MultiselectDropdownModule,
		SettingComponent,
		DashboardDatepicker,
		DateRangePicker
	],
	declarations: [
		SettingComponent,
		DashboardDatepicker,
		DateRangePicker
	],
  entryComponents: [],
	providers: []

})
export class basicSharedModule { }
