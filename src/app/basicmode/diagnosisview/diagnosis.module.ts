import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { SharedDiagnosisModule } from '../sharedmodule/share-diagnosis.module';

import { DiagnosisViewComponent} from './diagnosis-view.component';
import { basicSharedModule } from '../../sharedmodule/basic.module';

export const DiagnosisRoutes = [
    { path: '', component: DiagnosisViewComponent, pathMatch: 'full'}
]

// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }
@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(DiagnosisRoutes),	
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
		SharedDiagnosisModule,
		basicSharedModule	
  	],
  	declarations: [
		DiagnosisViewComponent
  	]
})

export class DiagnosisViewModule {}
