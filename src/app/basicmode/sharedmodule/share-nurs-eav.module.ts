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

import { NursEavSearchComponent } from '../nurseavview/nurs-eav/nurs-eav-search.component';
import { NursEavServerComponent } from '../nurseavview/nurs-eav/nurs-eav-server.component';
import { NursEavClientComponent } from '../nurseavview/nurs-eav/nurs-eav-client.component';
import { NursEavFilterComponent } from '../nurseavview/nurs-eav/nurs-eav-filter.component';
import { NursEavItemsSearchComponent } from '../nurseavview/nurs-eav-items/nurs-eav-items-search.component';
import { NursEavItemsServerComponent } from '../nurseavview/nurs-eav-items/nurs-eav-items-server.component';
import { NursEavItemsClientComponent } from '../nurseavview/nurs-eav-items/nurs-eav-items-client.component';

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
        NursEavSearchComponent,
		NursEavServerComponent,
        NursEavClientComponent,
        NursEavFilterComponent,
		NursEavItemsSearchComponent,
		NursEavItemsServerComponent,
        NursEavItemsClientComponent
    ],
    declarations: [
        NursEavSearchComponent,
		NursEavServerComponent,
        NursEavClientComponent,
        NursEavFilterComponent,
		NursEavItemsSearchComponent,
		NursEavItemsServerComponent,
        NursEavItemsClientComponent
    ]
})
export class SharedNursEavModule { }