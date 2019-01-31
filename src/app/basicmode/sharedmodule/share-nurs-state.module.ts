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

import { NursStateSearchComponent } from '../nursstateview/nurs-state/nurs-state-search.component';
import { NursStateServerComponent } from '../nursstateview/nurs-state/nurs-state-server.component';
import { NursStateClientComponent } from '../nursstateview/nurs-state/nurs-state-client.component';
import { NursStateFilterComponent } from '../nursstateview/nurs-state/nurs-state-filter.component';
import { NursStateEavSearchComponent } from '../nursstateview/nurs-state-eav/nurs-state-eav-search.component';
import { NursStateEavServerComponent } from '../nursstateview/nurs-state-eav/nurs-state-eav-server.component';
import { NursStateEavClientComponent } from '../nursstateview/nurs-state-eav/nurs-state-eav-client.component';

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
        NursStateSearchComponent,
		NursStateServerComponent,
        NursStateClientComponent,
        NursStateFilterComponent,
		NursStateEavSearchComponent,
		NursStateEavServerComponent,
        NursStateEavClientComponent
    ],
    declarations: [
        NursStateSearchComponent,
		NursStateServerComponent,
        NursStateClientComponent,
        NursStateFilterComponent,
		NursStateEavSearchComponent,
		NursStateEavServerComponent,
        NursStateEavClientComponent
    ]
})
export class SharedNursStateModule { }