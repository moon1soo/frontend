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

import { MedicalSearchComponent } from '../hospitalview/medical/medical-search.component';
import { MedicalServerComponent } from '../hospitalview/medical/medical-server.component';
import { MedicalClientComponent } from '../hospitalview/medical/medical-client.component';
import { MedicalFilterComponent } from '../hospitalview/medical/medical-filter.component';
import { DoctorSearchComponent } from '../hospitalview/doctor/doctor-search.component';
import { DoctorServerComponent } from '../hospitalview/doctor/doctor-server.component';
import { DoctorClientComponent } from '../hospitalview/doctor/doctor-client.component';
import { DoctorFilterComponent } from '../hospitalview/doctor/doctor-filter.component';

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
		SplitPaneModule
    ],
    exports: [
        MedicalSearchComponent,
        MedicalServerComponent,
        MedicalClientComponent,
        MedicalFilterComponent,
        DoctorSearchComponent,
        DoctorServerComponent,
        DoctorClientComponent,
        DoctorFilterComponent
    ],
    declarations: [
        MedicalSearchComponent,
        MedicalServerComponent,
        MedicalClientComponent,
        MedicalFilterComponent,
        DoctorSearchComponent,
        DoctorServerComponent,
        DoctorClientComponent,
        DoctorFilterComponent
    ]
})
export class sharedHospitalModule { }