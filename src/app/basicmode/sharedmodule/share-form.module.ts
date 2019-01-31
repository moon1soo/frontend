import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DxDataGridModule, DxFileUploaderModule, DxLoadPanelModule } from 'devextreme-angular';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { ClickOutsideModule } from 'ng-click-outside';

import { FormBasicSearchComponent } from '../formview/form-basic/form-basic-search.component';
import { FormBasicServerComponent } from '../formview/form-basic/form-basic-server.component';
import { FormBasicClientComponent } from '../formview/form-basic/form-basic-client.component';
import { FormBasicFilterComponent } from '../formview/form-basic/form-basic-filter.component';

import { FormDetailSearchComponent } from '../formview/form-detail/form-detail-search.component';
import { FormDetailServerComponent } from '../formview/form-detail/form-detail-server.component';
import { FormDetailClientComponent } from '../formview/form-detail/form-detail-client.component';
import { FormDetailFilterComponent } from '../formview/form-detail/form-detail-filter.component';

export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		HttpModule,
		ReactiveFormsModule,
		NgbModule.forRoot(),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [HttpClient]
			}
		}),
		DxDataGridModule,
		DxFileUploaderModule,
		DxLoadPanelModule,
		SplitPaneModule,
		ClickOutsideModule
	],
	exports: [
		FormBasicSearchComponent,
		FormBasicServerComponent,
		FormBasicClientComponent,
		FormBasicFilterComponent,
		FormDetailSearchComponent,
		FormDetailServerComponent,
		FormDetailClientComponent,
		FormDetailFilterComponent
	],
	declarations: [
		FormBasicSearchComponent,
		FormBasicServerComponent,
		FormBasicClientComponent,
		FormBasicFilterComponent,
		FormDetailSearchComponent,
		FormDetailServerComponent,
		FormDetailClientComponent,
		FormDetailFilterComponent
	]
})
export class SharedFormModule { }