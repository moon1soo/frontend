import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { SharedMedicineModule } from '../sharedmodule/share-medicine.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';
import { MedicineViewComponent } from './medicine-view.component';

export const MedicineRoutes = [
    { path: '', component: MedicineViewComponent, pathMatch: 'full'}
]

// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }
@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(MedicineRoutes),	
		FormsModule,
		HttpModule,
		ReactiveFormsModule,
		NgbModule.forRoot(),
		// TranslateModule.forRoot({
        //     loader: {
        //         provide: TranslateLoader,
        //         useFactory: (createTranslateLoader),
        //         deps: [HttpClient]
        //     }
		// }),
		SharedMedicineModule,
		basicSharedModule
  	],
  	declarations: [
		MedicineViewComponent
  	]
})

export class MedicineViewModule {}
