import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { SharedSurgicalModule } from '../sharedmodule/share-surgical.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';
import { SurgicalViewComponent } from './surgical-view.component';

export const SurgicalRoutes = [
    { path: '', component: SurgicalViewComponent, pathMatch: 'full'}
]

// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }
@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(SurgicalRoutes),	
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
		SharedSurgicalModule,
		MultiselectDropdownModule,
		basicSharedModule
  	],
  	declarations: [
		SurgicalViewComponent		
  	]
})

export class SurgicalViewModule {}
