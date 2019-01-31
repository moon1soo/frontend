import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { SharedConcernModule } from '../sharedmodule/share-concern.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';
import { ConcernViewComponent } from './concern-view.component';

export const ConcernRoutes = [
    { path: '', component: ConcernViewComponent, pathMatch: 'full'}
];

@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(ConcernRoutes),
		FormsModule,
		HttpModule,
		ReactiveFormsModule,
		NgbModule.forRoot(),
		SharedConcernModule,
		basicSharedModule
  	],
  	declarations: [
		ConcernViewComponent
  	]
})

export class ConcernViewModule {}
