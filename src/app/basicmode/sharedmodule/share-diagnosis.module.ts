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

import { DiagnosisSearchComponent } from '../diagnosisview/diagnosis-search/diagnosis-search.component';
import { DiagnosisServerComponent } from '../diagnosisview/diagnosis-search/diagnosis-server.component';
import { DiagnosisClientComponent } from '../diagnosisview/diagnosis-search/diagnosis-client.component';
import { DiagnosisFilterComponent } from '../diagnosisview/diagnosis-search/diagnosis-filter.component';

import { DiagMedicalSearchComponent } from '../diagnosisview/diag-medical/diag-medical-search.component';
import { DiagMedicalServerComponent } from '../diagnosisview/diag-medical/diag-medical-server.component';
import { DiagMedicalClientComponent } from '../diagnosisview/diag-medical/diag-medical-client.component';
import { DiagMedicalFilterComponent } from '../diagnosisview/diag-medical/diag-medical-filter.component';

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
        DiagnosisSearchComponent,
		DiagnosisServerComponent,
		DiagnosisClientComponent,
		DiagnosisFilterComponent,
		DiagMedicalSearchComponent,
		DiagMedicalServerComponent,
		DiagMedicalClientComponent,
		DiagMedicalFilterComponent
    ],
    declarations: [
        DiagnosisSearchComponent,
		DiagnosisServerComponent,
		DiagnosisClientComponent,
		DiagnosisFilterComponent,
		DiagMedicalSearchComponent,
		DiagMedicalServerComponent,
		DiagMedicalClientComponent,
		DiagMedicalFilterComponent
    ]
})
export class SharedDiagnosisModule { }