import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CohortListComponent} from './cohort-list.component';
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { DxDataGridModule, DxLoadPanelModule } from 'devextreme-angular';

export const CohortListRoutes = [
    { path: '', component: CohortListComponent, pathMatch: 'full'}
]

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    RouterModule.forChild(CohortListRoutes),
    DxDataGridModule,
    DxLoadPanelModule
  ],
  declarations: [
    CohortListComponent
  ],
  exports:[
    TranslateModule,
    DxDataGridModule,
    DxLoadPanelModule,
    CohortListComponent
  ]
})

export class CohortListModule {}
