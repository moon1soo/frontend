import { NgModule } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {DxDataGridModule, DxLoadPanelModule, DxTextAreaModule } from 'devextreme-angular';
import {DxChartModule, DxSelectBoxModule, DxRadioGroupModule, DxTabsModule, DxPopupModule} from 'devextreme-angular';
import {DxTextBoxModule, DxBoxModule} from 'devextreme-angular';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpModule} from '@angular/http';
import {ErrorLogComponent} from './error-log/error-log.component';
import {UserTableManagerComponent} from './user-table-manager/user-table-manager.component';
import {WorkManagerComponent} from './work-manager/work-manager.component';
import {ErrorLogDetailModalComponent} from 'app/admin/error-log/error-log-detail-modal.component';
import {WorkManagerModalComponent} from 'app/admin/work-manager/work-manager-modal.component';
import {UserTableErrorModalComponent} from 'app/admin/user-table-manager/user-table-error-modal.component';
import {LoginLogComponent} from 'app/admin/login-log/login-log.component';
import {IrbLogComponent} from 'app/admin/irb-log/irb-log.component';
import {IrbOverviewComponent} from 'app/admin/irb-overview/irb-overview.component';
import {AdminComponent} from 'app/admin/admin.component';
import {SqlLogComponent} from './sql-log/sql-log.component';
import {MetaManagerComponent} from 'app/admin/meta-manager/meta-manager.component';
import {CategoryManagerComponent} from 'app/admin/meta-manager/category-manager/category-manager.component';
import {ItemManagerComponent} from 'app/admin/meta-manager/item-manager/item-manager.component';
import {NoticeManagerComponent} from './notice-manager/notice-manager.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

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
    DxDataGridModule,
    DxChartModule,
    DxSelectBoxModule,
    DxRadioGroupModule,
    DxLoadPanelModule,
    DxTabsModule,
    DxPopupModule,
    DxTextBoxModule,
    DxBoxModule,
    DxTextAreaModule
  ],
  exports: [
    IrbLogComponent,
    IrbOverviewComponent,
    LoginLogComponent,
    SqlLogComponent,
    AdminComponent,
    ErrorLogComponent,
    UserTableManagerComponent,
    WorkManagerComponent,
    MetaManagerComponent,
    CategoryManagerComponent,
    ItemManagerComponent,
    NoticeManagerComponent
  ],
  declarations: [
    IrbLogComponent,
    IrbOverviewComponent,
    LoginLogComponent,
    SqlLogComponent,
    AdminComponent,
    ErrorLogComponent,
    ErrorLogDetailModalComponent,
    UserTableManagerComponent,
    UserTableErrorModalComponent,
    WorkManagerComponent,
    WorkManagerModalComponent,
    MetaManagerComponent,
    CategoryManagerComponent,
    ItemManagerComponent,
    NoticeManagerComponent
  ],
  entryComponents: [
    ErrorLogDetailModalComponent,
    UserTableErrorModalComponent,
    WorkManagerModalComponent
  ],
  providers: []
})
export class AdminModule { }
