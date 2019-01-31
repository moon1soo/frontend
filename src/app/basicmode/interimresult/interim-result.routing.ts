import { Routes } from '@angular/router';
import { InterimResultComponent } from './interim-result.component';

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
import { PathInterimComponent } from './search/path-interim.component';
import { RediationInterimComponent } from './search/rediation-interim.component';

export const InterimRoutes: Routes = [
	{
		path: '',
		component: InterimResultComponent,
		children: [
			{
				path: 'concernPatient',
				component: ConcernInterimComponent
			},
			{
				path: 'visit',
				component: MedicalInterimComponent
			},
			{
				path: 'diagnosis',
				component: DiagnosisInterimComponent
			},
			{
				path: 'exam',
				component: ExamInterimComponent
			},
			{
				path: 'examResult',
				component: ExamResultInterimComponent
			},
			{
				path: 'medicine',
				component: MedicineInterimComponent
			},
			{
				path: 'order',
				component: OrderInterimComponent
			},
			{
				path: 'fee',
				component: FeeInterimComponent
			},
			{
				path: 'surgical',
				component: SurgicalInterimComponent
			},
			{
				path: 'cc',
				component: CcInterimComponent
			},
			{
				path: 'form',
				component: FormInterimComponent
			},
			{
				path: 'nursDiag',
				component: NursDiagInterimComponent
			},
			{
				path: 'nursState',
				component: NursStateInterimComponent
			},
			{
				path: 'nursEav',
				component: NursEavInterimComponent
			},
			{
				path: 'nursAssm',
				component: NursAssmInterimComponent
			},
			{
				path: 'patient',
				component: PatientInterimComponent
			},
			{
				path: 'pathology',
				component: PathInterimComponent
			},
			{
				path: 'rediation',
				component: RediationInterimComponent
			}
		]
	}
];
