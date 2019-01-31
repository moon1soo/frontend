import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DxDataGridModule } from 'devextreme-angular';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { CodemirrorModule } from 'ng2-codemirror';

// import { AddItemFilter } from './pipe.additem';

import { InterimRoutes } from './interim-result.routing';
import { InterimResultComponent } from './interim-result.component';
// import { SqlPreviewModal } from './sql-preview-modal.component';

import { PatientInterimComponent } from './search/patient-list.component';
import { MedicalInterimComponent } from './search/medical-interim.component';
import { DiagnosisInterimComponent } from './search/diagnosis-interim.component';
import { ExamInterimComponent } from './search/exam-interim.component';
import { ExamResultInterimComponent } from './search/exam-result-interim.component';
import { MedicineInterimComponent } from './search/medicine-interim.component';
import { OrderInterimComponent } from './search/order-interim.component';
import { FeeInterimComponent } from './search/fee-interim.component';
import { SurgicalInterimComponent } from './search/surgical-interim.component';
import { CcInterimComponent } from './search/cc-interim.component';
import { ConcernInterimComponent } from './search/concern-interim.component';
import { FormInterimComponent } from './search/form-interim.component';
import { NursDiagInterimComponent } from './search/nursdiag-interim.component';
import { NursStateInterimComponent } from './search/nursstate-interim.component';
import { NursEavInterimComponent } from './search/nurseav-interim.component';
import { NursAssmInterimComponent } from './search/nursassm-interim.component';
import { PopulationChart } from './population.chart';
// import { ProgressChart } from './progress.chart';
import { ProgressBar } from './progress-bar.component';
import { DxChartModule } from 'devextreme-angular';
import { basicSharedModule } from '../../sharedmodule/basic.module';
import { PathInterimComponent } from './search/path-interim.component';
import { RediationInterimComponent } from './search/rediation-interim.component';

// import { StompConfig, StompService } from '@stomp/ng2-stompjs';
// import { stompConfig } from '../stomp/stomp';

@NgModule({
  	imports: [
		CommonModule,
		RouterModule.forChild(InterimRoutes),
		FormsModule,
		HttpModule,
		ReactiveFormsModule,
		NgbModule.forRoot(),
		DxChartModule,
		SplitPaneModule,
		CodemirrorModule,
		basicSharedModule
  	],
  	declarations: [
		// SqlPreviewModal,
		InterimResultComponent,
		PatientInterimComponent,
		MedicalInterimComponent,
		DiagnosisInterimComponent,
		ExamInterimComponent,
		ExamResultInterimComponent,
		MedicineInterimComponent,
		OrderInterimComponent,
		FeeInterimComponent,
		SurgicalInterimComponent,
		CcInterimComponent,
		ConcernInterimComponent,
		FormInterimComponent,
		NursDiagInterimComponent,
		NursStateInterimComponent,
		NursEavInterimComponent,
		NursAssmInterimComponent,
		PathInterimComponent,
		RediationInterimComponent,
		PopulationChart,
		// ProgressChart,
		ProgressBar
	],
	entryComponents: [
		// SqlPreviewModal,
	],
	providers: [
		// StompService,
		// {
		// 	provide: StompConfig,
		// 	useValue: stompConfig
		// }
	]
})

export class InterimResultViewModule {}
