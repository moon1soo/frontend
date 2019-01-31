// import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { RouterModule, Router} from '@angular/router';
// import { AppState } from './app.state';
import { CohortRoutes } from './cohort.routing';
import { basicSharedModule } from '../sharedmodule/basic.module';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { CommonModule } from "@angular/common";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { CohortComponent } from './cohort.component';
import { CohortService } from './cohort.service';
import { DeleteModal } from './modal/delete-modal.component';
import { ConfirmModal } from './modal/confirm-modal.component';
import { RequestShareCohortModal } from './modal/request-share-cohort-modal.component';
import { ExcelDownloadModal } from "./modal/excel-download-modal.component";

import { StompService, StompConfig } from '@stomp/ng2-stompjs';


import {
  DxLoadIndicatorModule,
  DxProgressBarModule,
  DxDateBoxModule,
  DxCheckBoxModule,
} from 'devextreme-angular';
import {stompConfig} from "../basicmode/stomp/stomp";
import {RelatedDownloadModal} from "./modal/related-download-modal.component";
import {PatientDownloadModel} from "./modal/patient-download-modal.component";

@NgModule({
  declarations: [
    ToolbarComponent,
    CohortComponent,
  //  CohortListComponent,
//    CohortShareComponent,
    DeleteModal,
    ConfirmModal,
    RequestShareCohortModal,
    ExcelDownloadModal,
    RelatedDownloadModal,
    PatientDownloadModel
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    NgbModule.forRoot(),
    DxProgressBarModule,
    DxLoadIndicatorModule,
    DxDateBoxModule,
    DxCheckBoxModule,

    /* App Module */
    RouterModule.forChild(CohortRoutes),
    basicSharedModule,
  ],
  exports: [
    RouterModule,
  ],
  entryComponents: [
    DeleteModal,
    ConfirmModal,
    RequestShareCohortModal,
    ExcelDownloadModal,
    RelatedDownloadModal,
    PatientDownloadModel
  ],
  providers: [
    CohortService,
    StompService,
    {
      provide: StompConfig,
      useValue: stompConfig
    },
  ],

})
export class CohortModule { }
