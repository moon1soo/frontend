import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedNursEavModule } from '../sharedmodule/share-nurs-eav.module';
import { SharedNursDeptModule } from '../sharedmodule/share-nurs-dept.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';

import { NursEavViewComponent } from './nurseav-view.component';

export const NursEavRoutes = [
    { path: '', component: NursEavViewComponent, pathMatch: 'full'}
]

@NgModule({
	imports: [
	  CommonModule,
	  RouterModule.forChild(NursEavRoutes),
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
	  SharedNursEavModule,
	  SharedNursDeptModule,
	  basicSharedModule
	],
	declarations: [
		NursEavViewComponent
	]
})

export class NursEavViewModule {}
