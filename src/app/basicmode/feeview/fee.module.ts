import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { SharedFeeModule } from '../sharedmodule/shared-fee.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';

import { FeeViewComponent } from './fee-view.component';

export const OrderRoutes = [
    { path: '', component: FeeViewComponent, pathMatch: 'full'}
]

// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }
@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(OrderRoutes),	
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
		SharedFeeModule,
		basicSharedModule
  	],
  	declarations: [
		FeeViewComponent
  	]
})

export class FeeViewModule {}
