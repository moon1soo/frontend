import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

import { CohortParsingComponent} from './cohort-parsing.component';
import { CohortParsingService} from './cohort-parsing.service';
import { SidebarComponent, ViewFilterPipe, CohortFilterPipe } from './sidebar/sidebar.component';
import { TableViewComponent } from './tableview/table-view.component';
import { RegularExpressionComponent } from './regularexpression/regular-expression.component';

import { CohortParsingRoutes} from './cohort-parsing.routing';

import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import {DatePipe} from '@angular/common';

import { DxDataGridModule,
  DxSparklineModule,
  DxTemplateModule,
  DxDateBoxModule,
  DxButtonModule,
  DxLoadPanelModule
} from 'devextreme-angular';
import {CategoryComponent} from "./regularexpression/category-dialog.component";
import {RgepDialogComponent} from "./regularexpression/rgep-dialog.component";


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

      SplitPaneModule,

      /* app modules */
      RouterModule.forChild(CohortParsingRoutes),
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
      CohortParsingComponent,
      SidebarComponent,
      TableViewComponent,
      RegularExpressionComponent,
      CategoryComponent,
      RgepDialogComponent,
      ViewFilterPipe,
      CohortFilterPipe
    ],
    entryComponents: [
      CategoryComponent,
      RgepDialogComponent,
    ],
    providers: [
      CohortParsingService,
      DatePipe
    ],
    exports: [
    ]

})

export class CohortParsingModule {}
