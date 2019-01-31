import { Routes } from '@angular/router';
import { CohortComponent } from './cohort.component';

export const CohortRoutes: Routes = [
  {
    path: '',
    component: CohortComponent,
//    pathMatch: 'full',
    children: [
      {
        path: '',
//        component: CohortListComponent
        loadChildren: './cohortlist/cohort-list.module#CohortListModule'
      },
      {
        path: 'cohortList',
//        component: CohortListComponent
        loadChildren: './cohortlist/cohort-list.module#CohortListModule'
      },
      {
        path: 'cohortShare',
        loadChildren: './cohortshare/cohort-share.module#CohortShareModule'
      },
      {
        path: 'cohortView',
        loadChildren: './cohortview/cohort-view.module#CohortViewModule'
      },
      {
        path: 'cohortManage',
        loadChildren: './cohortmanage/cohort-manage.module#CohortManageModule'
      },
      {
        path: 'cohortParsing',
        loadChildren: './cohortparsing/cohort-parsing.module#CohortParsingModule'
      }
    ]
  }

]
