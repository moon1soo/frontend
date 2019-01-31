import { Routes } from '@angular/router';

import { CohortViewComponent } from './cohort-view.component'
import { TableViewComponent } from './tableview/table-view.component'
import { PatientViewComponent } from './patientview/patient-view.component'
import { CohortViewService } from './cohort-view.service'

export const CohortViewRoutes: Routes = [{
	path: '',
	component: CohortViewComponent,
	children: [
/*
	  {
		path: '',
		component: TableViewComponent
  },
//*/
    {
      path: 'tblView/:idx',
      component: TableViewComponent
    },
    {
      path: 'patientview',
      component: PatientViewComponent
    }

  ]

}]
