import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { BasicViewComponent } from './basicview/basic-view.component';
import { NursAssmViewComponent } from './nursassmview/nursassm-view.component';
import { ConditionLayoutComponent } from './layout/condition/condition-layout.component';
import { ResultLayoutComponent } from './layout/result/result-layout.component';
import { AddItemComponent } from './final/add-item.component';
import { HospitalViewComponent } from './hospitalview/hospital-view.component';
import { ScenarioListComponent } from './scenario/scenario-list.component';
import { AdminComponent } from '../admin/admin.component';

export const DashboardRoutes = [
	// {
	// 	path: '',
	// 	redirectTo: 'condition/basicView',
	// 	pathMatch: 'full',
	// }, 	
	{
		path: '',
		component: DashboardComponent,
		children: [			
			{
				path: 'condition',
				component: ConditionLayoutComponent,
				children: [
					{
						path: 'hospitalView',
						component: HospitalViewComponent
					},
					{
						path: 'diagnosisView',
						loadChildren: './diagnosisview/diagnosis.module#DiagnosisViewModule'
					},
					{
						path: 'orderView',
						loadChildren: './orderview/order.module#OrderViewModule'
					},
					{
						path: 'feeView',
						loadChildren: './feeview/fee.module#FeeViewModule'
					},
					{
						path: 'medicineView',
						loadChildren: './medicineview/medicine.module#MedicineViewModule'
					},
					{
						path: 'examView',
						loadChildren: './examview/exam.module#ExamViewModule'
					},
					{
						path: 'pathView',
						loadChildren: './pathview/path.module#PathViewModule'
					},
					{
						path: 'surgicalView',
						loadChildren: './surgicalview/surgical.module#SurgicalViewModule'
					},
					{
						path: 'ccView',
						loadChildren: './ccview/cc.module#CcViewModule'
					},
					{
						path: 'formView',
						loadChildren: './formview/form.module#FormViewModule'
					},
					{
						path: 'nursDiagView',
						loadChildren: './nursdiagview/nursdiag.module#NursDiagViewModule'
					},
					{
						path: 'nursStateView',
						loadChildren: './nursstateview/nursstate.module#NursStateViewModule'
					},
					{
						path: 'nursEavView',
						loadChildren: './nurseavview/nurseav.module#NursEavViewModule'
					},
					{
						path: 'nursAssmView',
						loadChildren: './nursassmview/nursassm.module#NursAssmViewModule'
					},
					{
						path: 'concernView',
						loadChildren: './concernview/concern.module#ConcernViewModule'
					},
					{
						path: 'rediationView',
						loadChildren: './rediationview/rediation.module#RediationViewModule'
					}
				]
			},
			{
				path: 'result',
				component: ResultLayoutComponent,
				children: [
					{
						path: 'interim',
						loadChildren: './interimresult/interim-result.module#InterimResultViewModule'
					}
				]
			},
			{
				path: 'additem',
				loadChildren: './final/final.module#FinalModule'
			},
			{
				path: 'scenario',
				component: ScenarioListComponent
			},
			{ path: 'admin', component: AdminComponent, pathMatch: 'full'}
		]
	}	
];
