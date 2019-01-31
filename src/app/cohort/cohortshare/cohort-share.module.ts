import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CohortShareComponent} from './cohort-share.component';
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { DxDataGridModule, DxLoadPanelModule } from 'devextreme-angular';

export const CohortShareRoutes = [
    { path: '', component: CohortShareComponent, pathMatch: 'full'}
]

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  	imports: [
      CommonModule,
      RouterModule.forChild(CohortShareRoutes),
      FormsModule,
      HttpModule,
      ReactiveFormsModule,
      NgbModule.forRoot(),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        }
      }),
      DxDataGridModule,
      DxLoadPanelModule
  	],
  	declarations: [
      CohortShareComponent
  	],
  exports:[
    TranslateModule,
    DxDataGridModule,
    DxLoadPanelModule
  ]
})

export class CohortShareModule {}
