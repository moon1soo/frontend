import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CohortViewComponent} from './cohort-view.component';
import { CohortViewService} from './cohort-view.service';
import { SidebarComponent} from './sidebar/sidebar.component';
import { PatientViewComponent} from './patientview/patient-view.component';
import { TableViewComponent} from './tableview/table-view.component';


import { CohortViewRoutes} from './cohort-view.routing';

import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import {DatePipe} from '@angular/common';

import { DxDataGridModule,
  DxSparklineModule,
  DxTemplateModule,
  DxDateBoxModule,
  DxButtonModule,
  DxLoadPanelModule,
  DxToolbarModule,
} from 'devextreme-angular';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  	imports: [
      CommonModule,
      FormsModule,
//      BrowserModule,
//      HttpModule,
      DxToolbarModule,
      DxDataGridModule,
      DxTemplateModule,
      DxSparklineModule,
      DxDateBoxModule,
      DxButtonModule,
      DxLoadPanelModule,

      /* app modules */
      RouterModule.forChild(CohortViewRoutes),
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
      CohortViewComponent,
      SidebarComponent,
      TableViewComponent,
      PatientViewComponent
  	],
  exports:[
    TranslateModule,
    RouterModule
  ],
  providers: [
    CohortViewService,
    DatePipe
  ]

})

export class CohortViewModule {}
