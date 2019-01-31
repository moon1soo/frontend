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

import { MedicineSearchComponent } from '../medicineview/medicine-search/medicine-search.component';
import { MedicineServerComponent } from '../medicineview/medicine-search/medicine-server.component';
import { MedicineClientComponent } from '../medicineview/medicine-search/medicine-client.component';
import { MedicineFilterComponent } from '../medicineview/medicine-search/medicine-filter.component';

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
        MedicineSearchComponent,
		MedicineServerComponent,
        MedicineClientComponent,
        MedicineFilterComponent
    ],
    declarations: [
        MedicineSearchComponent,
		MedicineServerComponent,
        MedicineClientComponent,
        MedicineFilterComponent
    ]
})
export class SharedMedicineModule { }