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

import { NursCircumSearchComponent } from '../nursdiagview/nurs-circum/nurs-circum-search.component';
import { NursCircumServerComponent } from '../nursdiagview/nurs-circum/nurs-circum-server.component';
import { NursCircumClientComponent } from '../nursdiagview/nurs-circum/nurs-circum-client.component';
import { NursDiagSearchComponent } from '../nursdiagview/nurs-diag/nurs-diag-search.component';
import { NursDiagServerComponent } from '../nursdiagview/nurs-diag/nurs-diag-server.component';
import { NursDiagClientComponent } from '../nursdiagview/nurs-diag/nurs-diag-client.component';
import { NursPlanSearchComponent } from '../nursdiagview/nurs-plan/nurs-plan-search.component';
import { NursPlanServerComponent } from '../nursdiagview/nurs-plan/nurs-plan-server.component';
import { NursPlanClientComponent } from '../nursdiagview/nurs-plan/nurs-plan-client.component';

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
        NursCircumSearchComponent,
		NursCircumServerComponent,
		NursCircumClientComponent,
		NursDiagSearchComponent,
		NursDiagServerComponent,
		NursDiagClientComponent,
		NursPlanSearchComponent,
		NursPlanServerComponent,
		NursPlanClientComponent
    ],
    declarations: [
        NursCircumSearchComponent,
		NursCircumServerComponent,
		NursCircumClientComponent,
		NursDiagSearchComponent,
		NursDiagServerComponent,
		NursDiagClientComponent,
		NursPlanSearchComponent,
		NursPlanServerComponent,
		NursPlanClientComponent
    ]
})
export class SharedNursDiagModule { }