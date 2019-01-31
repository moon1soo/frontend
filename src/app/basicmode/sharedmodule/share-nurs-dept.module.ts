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

import { NursDeptSearchComponent } from '../nursdiagview/nurs-dept/nurs-dept-search.component';
import { NursDeptServerComponent } from '../nursdiagview/nurs-dept/nurs-dept-server.component';
import { NursDeptClientComponent } from '../nursdiagview/nurs-dept/nurs-dept-client.component';

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
		NursDeptSearchComponent,
		NursDeptServerComponent,
		NursDeptClientComponent
    ],
    declarations: [
		NursDeptSearchComponent,
		NursDeptServerComponent,
		NursDeptClientComponent
    ]
})
export class SharedNursDeptModule { }
