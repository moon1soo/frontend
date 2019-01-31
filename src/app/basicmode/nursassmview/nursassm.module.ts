import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedNursAssmModule } from '../sharedmodule/share-nurs-assm.module';
import { SharedNursDeptModule } from '../sharedmodule/share-nurs-dept.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';

import { NursAssmViewComponent } from './nursassm-view.component';

export const NursAssmRoutes = [
    { path: '', component: NursAssmViewComponent, pathMatch: 'full'}
]

@NgModule({
	imports: [
	  CommonModule,
	  RouterModule.forChild(NursAssmRoutes),
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
	  SharedNursAssmModule,
	  SharedNursDeptModule,
	  basicSharedModule
	],
	declarations: [
		NursAssmViewComponent
	]
})

export class NursAssmViewModule {}
