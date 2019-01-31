import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DxDataGridModule, DxTreeListModule } from 'devextreme-angular';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { ClickOutsideModule } from 'ng-click-outside';

import { ConcernSearchComponent } from '../concernview/concern-search/concern-search.component';
import { ConcernServerComponent } from '../concernview/concern-search/concern-server.component';
import { ConcernClientComponent } from '../concernview/concern-search/concern-client.component';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
    imports: [
        CommonModule,
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
        DxTreeListModule,
        SplitPaneModule,
        ClickOutsideModule
    ],
    exports: [
        ConcernSearchComponent,
		ConcernServerComponent,
        ConcernClientComponent
    ],
    declarations: [
        ConcernSearchComponent,
		ConcernServerComponent,
        ConcernClientComponent
    ]
})
export class SharedConcernModule { }
