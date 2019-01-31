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

import { SurgicalSearchComponent } from '../surgicalview/surgical-search/surgical-search.component';
import { SurgicalServerComponent } from '../surgicalview/surgical-search/surgical-server.component';
import { SurgicalClientComponent } from '../surgicalview/surgical-search/surgical-client.component';
import { SurgicalFilterComponent } from '../surgicalview/surgical-search/surgical-filter.component';

import { SurMedicalSearchComponent } from '../surgicalview/sur-medical/sur-medical-search.component';
import { SurMedicalServerComponent } from '../surgicalview/sur-medical/sur-medical-server.component';
import { SurMedicalClientComponent } from '../surgicalview/sur-medical/sur-medical-client.component';
import { SurMedicalFilterComponent } from '../surgicalview/sur-medical/sur-medical-filter.component';

import { SurDoctorSearchComponent } from '../surgicalview/sur-doctor/sur-doctor-search.component';
import { SurDoctorServerComponent } from '../surgicalview/sur-doctor/sur-doctor-server.component';
import { SurDoctorClientComponent } from '../surgicalview/sur-doctor/sur-doctor-client.component';
import { SurDoctorFilterComponent } from '../surgicalview/sur-doctor/sur-doctor-filter.component';

import { SurDiagSearchComponent } from '../surgicalview/sur-diag-search/sur-diag-search.component';
import { SurDiagServerComponent } from '../surgicalview/sur-diag-search/sur-diag-server.component';
import { SurDiagClientComponent } from '../surgicalview/sur-diag-search/sur-diag-client.component';
import { SurDiagFilterComponent } from '../surgicalview/sur-diag-search/sur-diag-filter.component';

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
        SurgicalSearchComponent,
		SurgicalServerComponent,
		SurgicalClientComponent,
		SurgicalFilterComponent,
		SurMedicalSearchComponent,
		SurMedicalServerComponent,
		SurMedicalClientComponent,
		SurMedicalFilterComponent,
		SurDoctorSearchComponent,
		SurDoctorServerComponent,
		SurDoctorClientComponent,
		SurDoctorFilterComponent,
		SurDiagSearchComponent,
		SurDiagServerComponent,
		SurDiagClientComponent,
		SurDiagFilterComponent
    ],
    declarations: [
        SurgicalSearchComponent,
		SurgicalServerComponent,
		SurgicalClientComponent,
		SurgicalFilterComponent,
		SurMedicalSearchComponent,
		SurMedicalServerComponent,
		SurMedicalClientComponent,
		SurMedicalFilterComponent,
		SurDoctorSearchComponent,
		SurDoctorServerComponent,
		SurDoctorClientComponent,
		SurDoctorFilterComponent,
		SurDiagSearchComponent,
		SurDiagServerComponent,
		SurDiagClientComponent,
		SurDiagFilterComponent
    ]
})
export class SharedSurgicalModule { }