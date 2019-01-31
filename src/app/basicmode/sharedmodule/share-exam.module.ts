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

import { ExamSearchComponent } from '../examview/exam-search/exam-search.component';
import { ExamServerComponent } from '../examview/exam-search/exam-server.component';
import { ExamClientComponent } from '../examview/exam-search/exam-client.component';
import { ExamFilterComponent } from '../examview/exam-search/exam-filter.component';

import { ExamResultSearchComponent } from '../examview/exam-result/exam-result-search.component';
import { ExamResultServerComponent } from '../examview/exam-result/exam-result-server.component';
import { ExamResultClientComponent } from '../examview/exam-result/exam-result-client.component';
import { ExamResultFilterComponent } from '../examview/exam-result/exam-result-filter.component';

import { ExamDetailSearchComponent } from '../examview/exam-detail/exam-detail-search.component';
import { ExamDetailServerComponent } from '../examview/exam-detail/exam-detail-server.component';
import { ExamDetailClientComponent } from '../examview/exam-detail/exam-detail-client.component';

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
        ExamSearchComponent,
		ExamServerComponent,
		ExamClientComponent,
		ExamFilterComponent,
		ExamResultSearchComponent,
		ExamResultServerComponent,
		ExamResultClientComponent,
		ExamResultFilterComponent,
		ExamDetailSearchComponent,
		ExamDetailServerComponent,
		ExamDetailClientComponent
    ],
    declarations: [
        ExamSearchComponent,
		ExamServerComponent,
		ExamClientComponent,
		ExamFilterComponent,
		ExamResultSearchComponent,
		ExamResultServerComponent,
		ExamResultClientComponent,
		ExamResultFilterComponent,
		ExamDetailSearchComponent,
		ExamDetailServerComponent,
		ExamDetailClientComponent
    ]
})
export class sharedExamModule { }