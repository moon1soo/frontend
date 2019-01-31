import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedNursDiagModule } from '../sharedmodule/share-nurs-diag.module';
import { SharedNursDeptModule } from '../sharedmodule/share-nurs-dept.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';

import { NursDiagViewComponent } from './nursdiag-view.component';

export const NursDiagRoutes = [
    { path: '', component: NursDiagViewComponent, pathMatch: 'full'}
]

@NgModule({
	imports: [
	  CommonModule,
	  RouterModule.forChild(NursDiagRoutes),
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
	  SharedNursDiagModule,
	  SharedNursDeptModule,
	  basicSharedModule
	],
	declarations: [
		NursDiagViewComponent
	]
})

export class NursDiagViewModule {}
