import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { SharedRediationModule } from '../sharedmodule/share-rediation.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';
import { RediationViewComponent } from './rediation-view.component';

export const RediationRoutes = [
    { path: '', component: RediationViewComponent, pathMatch: 'full'}
];

@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(RediationRoutes),
		FormsModule,
		HttpModule,
		ReactiveFormsModule,
		NgbModule.forRoot(),
		SharedRediationModule,
		MultiselectDropdownModule,
		basicSharedModule
  	],
  	declarations: [
		RediationViewComponent
  	]
})

export class RediationViewModule {}
