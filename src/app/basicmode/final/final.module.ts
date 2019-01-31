import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DxDataGridModule, DxChartModule, DxTooltipModule } from 'devextreme-angular';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

// import { PerfectScrollbarModule } from 'angular2-perfect-scrollbar';
// import { PerfectScrollbarConfigInterface } from 'angular2-perfect-scrollbar';

import { AddItemFilter } from './pipe.additem';
import { AddItemComponent } from './add-item.component';
import { FinalResultModal } from './final-result-modal.component';

import { sharedHospitalModule } from '../sharedmodule/share-hospital.module';
import { SharedDiagnosisModule } from '../sharedmodule/share-diagnosis.module';
import { sharedExamModule } from '../sharedmodule/share-exam.module';
import { SharedCcModule } from '../sharedmodule/share-cc.module';
import { SharedFormModule } from '../sharedmodule/share-form.module';
import { SharedMedicineModule } from '../sharedmodule/share-medicine.module';
import { SharedNursDiagModule } from '../sharedmodule/share-nurs-diag.module';
import { SharedNursStateModule } from '../sharedmodule/share-nurs-state.module';
import { SharedNursEavModule } from '../sharedmodule/share-nurs-eav.module';
import { SharedOrderModule } from '../sharedmodule/share-order.module';
import { SharedSurgicalModule } from '../sharedmodule/share-surgical.module';
import { SharedFeeModule } from '../sharedmodule/shared-fee.module';
import { SharedPathModule } from '../sharedmodule/share-path.module';
import { SharedConcernModule } from '../sharedmodule/share-concern.module';
import { SharedRediationModule } from '../sharedmodule/share-rediation.module';
import { basicSharedModule } from '../../sharedmodule/basic.module';

// import { StompConfig, StompService } from '@stomp/ng2-stompjs';
// import { stompConfig } from '../stomp/stomp';

// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }
export const FinalRoutes = [
    { path: '', component: AddItemComponent, pathMatch: 'full'}
];
// const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
// 	suppressScrollX: false
// };

@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(FinalRoutes),
		FormsModule,
		HttpModule,
		ReactiveFormsModule,
		NgbModule.forRoot(),
		// PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
		// TranslateModule.forRoot({
        //     loader: {
        //         provide: TranslateLoader,
        //         useFactory: (createTranslateLoader),
        //         deps: [HttpClient]
        //     }
		// }),
		// DxDataGridModule,
		DxChartModule,
		DxTooltipModule,
        SplitPaneModule,
		sharedHospitalModule,
		SharedDiagnosisModule,
		sharedExamModule,
		SharedCcModule,
		SharedFormModule,
		SharedMedicineModule,
		SharedNursDiagModule,
		SharedNursStateModule,
		SharedNursEavModule,
		SharedOrderModule,
		SharedSurgicalModule,
		SharedFeeModule,
		basicSharedModule,
		SharedPathModule,
		SharedConcernModule,
		SharedRediationModule
  	],
  	declarations: [
        AddItemFilter,
        AddItemComponent,
		FinalResultModal
	],
	entryComponents: [
		FinalResultModal
	],
	providers: [
		// StompService,
		// {
		// 	provide: StompConfig,
		// 	useValue: stompConfig
		// }
	]
})

export class FinalModule {}
