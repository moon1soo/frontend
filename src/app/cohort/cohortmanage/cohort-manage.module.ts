import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

import { CohortManageComponent} from './cohort-manage.component';
import { CohortManageService} from './cohort-manage.service';
import { SidebarComponent, ViewFilterPipe } from './sidebar/sidebar.component';
import { TableViewComponent } from './tableview/table-view.component';

import { MartViewComponent } from './martview/mart-view.component';
import { MartComponent } from './martview/mart/mart.component';
import { MartPropertiesComponent } from './martview/mart/mart-properties.component';
import { PatientListComponent } from './martview/mart/patient-list.component';

import { OwnerDialogComponent } from './martview/owner/owner-dialog.component';
import { OwnerComponent } from './martview/owner/owner.component';
import { TableComponent } from './martview/table/table.component';
import { ColumnComponent } from './martview/column/column.component';
import { TableListComponent } from './martview/column/table-list.component';
import { TablePropertiesComponent } from './martview/column/table-properties.component';
import { TableColumnRegexpDialogComponent } from './martview/column/table-column-regexp-dialog.component'

import { DataComponent } from './martview/data/data.component';
import { DataListComponent } from './martview/data/data-list.component';
import { DataPropertiesComponent } from './martview/data/data-properties.component';


import { MartService } from './martview/mart/mart.service';

import { MartViewModule } from './martview/mart-view.module';


import { CohortManageRoutes} from './cohort-manage.routing';

import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import {DatePipe} from '@angular/common';

import {
  DxDataGridModule,
  DxSparklineModule,
  DxTemplateModule,
  DxDateBoxModule,
  DxButtonModule,
  DxLoadPanelModule,
  DxFileUploaderModule
} from 'devextreme-angular';
import {TableDialogComponent} from "./martview/table/table-dialog.component";
import {TableGroupDialogComponent} from "./martview/column/table-group-dialog.component";
import {TableGroupComponent} from "./martview/column/table-group.component";
import {TableColumnComponent} from "./martview/column/table-column.component";
import {TableColumnDialogComponent} from "./martview/column/table-column-dialog.component";
import {UploadPatientsDialogComponent} from "./martview/mart/upload-patients-dialog.component";


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  	imports: [
      CommonModule,
      FormsModule,
      HttpModule,

      DxDataGridModule,
      DxTemplateModule,
      DxSparklineModule,
      DxDateBoxModule,
      DxButtonModule,
      DxLoadPanelModule,
      DxFileUploaderModule,

      SplitPaneModule,

      /* app modules */
      RouterModule.forChild(CohortManageRoutes),
      ReactiveFormsModule,
      NgbModule.forRoot(),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        }
      }),
  	],
  	declarations: [
      CohortManageComponent,
      SidebarComponent,
      TableViewComponent,
      ViewFilterPipe,
//      MartViewModule
      MartViewComponent,
      MartComponent,
      PatientListComponent,
      MartPropertiesComponent,

      OwnerComponent,
      TableComponent,
      ColumnComponent,
      TableListComponent,
      TablePropertiesComponent,

      TableGroupComponent,
      TableColumnComponent,

      DataComponent,
      DataListComponent,
      DataPropertiesComponent,

      OwnerDialogComponent,
      UploadPatientsDialogComponent,
      TableDialogComponent,
      TableGroupDialogComponent,
      TableColumnDialogComponent,
      TableColumnRegexpDialogComponent
    ],
    entryComponents: [
      OwnerDialogComponent,
      UploadPatientsDialogComponent,
      TableDialogComponent,
      TableGroupDialogComponent,
      TableColumnDialogComponent,
      TableColumnRegexpDialogComponent
    ],
    providers: [
      CohortManageService,
      MartService,
      DatePipe
    ],
    exports: [
    ]

})

export class CohortManageModule {}
