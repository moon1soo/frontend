import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

import { MartViewService } from './mart-view.service';

import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { DatePipe } from '@angular/common';

import { DxDataGridModule,
  DxSparklineModule,
  DxTemplateModule,
  DxDateBoxModule,
  DxButtonModule,
  DxLoadPanelModule
} from 'devextreme-angular';
import {TableColumnDialogComponent} from "./column/table-column-dialog.component";
import {TableGroupDialogComponent} from "./column/table-group-dialog.component";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
      // MartViewComponent,
      // MartComponent,
    ],
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

//      MartTableComponent,

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
    providers: [
      MartViewService,
      DatePipe
    ],
    exports: [
    ],
    entryComponents: [
    ]

})

export class MartViewModule {}
