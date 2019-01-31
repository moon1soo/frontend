import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DxDataGridModule } from 'devextreme-angular';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { ClickOutsideModule } from 'ng-click-outside';

import { PathSearchComponent } from '../pathview/path-search/path-search.component';
import { PathServerComponent } from '../pathview/path-search/path-server.component';
import { PathClientComponent } from '../pathview/path-search/path-client.component';
import { PathFilterComponent } from '../pathview/path-search/path-filter.component';

import { PathSlipFilterComponent } from '../pathview/path-slip/path-slip-filter.component';
import { PathSlipServerComponent } from '../pathview/path-slip/path-slip-server.component';
import { PathSlipSearchComponent } from '../pathview/path-slip/path-slip-search.component';

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
        SplitPaneModule,
        ClickOutsideModule
    ],
    exports: [
        PathSearchComponent,
		PathServerComponent,
        PathClientComponent,
        PathFilterComponent,
        PathSlipFilterComponent,
        PathSlipServerComponent,
        PathSlipSearchComponent
    ],
    declarations: [
        PathSearchComponent,
		PathServerComponent,
        PathClientComponent,
        PathFilterComponent,
        PathSlipFilterComponent,
        PathSlipServerComponent,
        PathSlipSearchComponent
    ]
})
export class SharedPathModule { }
