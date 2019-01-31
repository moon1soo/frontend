import { Routes } from '@angular/router';

import { CohortManageComponent } from './cohort-manage.component'
import { TableViewComponent } from './tableview/table-view.component'
import { MartViewComponent } from './martview/mart-view.component'

export const CohortManageRoutes: Routes = [{
	path: '',
	component: CohortManageComponent,
	children: [
    {
      path: 'tblView/:idx',
      component: TableViewComponent
    },
    {
      path: 'martView',
//      loadChildren: './martview/mart-view.module#MartViewModule'
      component: MartViewComponent
    },
	]

}]
