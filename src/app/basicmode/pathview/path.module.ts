import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DxAutocompleteModule } from 'devextreme-angular';


import { SharedPathModule } from '../sharedmodule/share-path.module';
import { PathViewComponent } from './path-view.component' ;
import { basicSharedModule } from '../../sharedmodule/basic.module';

export const PathRoutes = [
    { path: '', component: PathViewComponent, pathMatch: 'full'}
]

// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }
@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(PathRoutes),
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
		SharedPathModule,
		basicSharedModule,
		DxAutocompleteModule
  	],
  	declarations: [
		PathViewComponent,
  	]
})

export class PathViewModule {}
