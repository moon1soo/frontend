import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedNursStateModule } from '../sharedmodule/share-nurs-state.module';
import { SharedNursDeptModule } from '../sharedmodule/share-nurs-dept.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';

import { NursStateViewComponent } from './nursstate-view.component';

export const NursStateRoutes = [
    { path: '', component: NursStateViewComponent, pathMatch: 'full'}
]

@NgModule({
	imports: [
	  CommonModule,
	  RouterModule.forChild(NursStateRoutes),
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
	  SharedNursStateModule,
	  SharedNursDeptModule,
	  basicSharedModule
	],
	declarations: [
		NursStateViewComponent
	]
})

export class NursStateViewModule {}
