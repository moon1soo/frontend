import { Routes } from '@angular/router';

import { ErrorComponent } from './session/error/error.component';
import { GateComponent } from './gate/gate.component';
import { SignInComponent } from './signIn/sign-in.component';

export const AppRoutes: Routes = [{
  path: '',
  redirectTo: 'tempAuth.do',
  pathMatch: 'full',
}, {
  path: 'tempAuth.do/gate',
  component: GateComponent,
  // loadChildren: './gate/gate.module#GateModule'
}, {
  path: 'tempAuth.do/signin',
  component: SignInComponent,
}, {
    path: 'tempAuth.do/basicmode',
    loadChildren: './basicmode/dashboard.module#DashboardModule'
}, {
    path: 'tempAuth.do/powermode',
    loadChildren: './powermode/diagram.module#DiagramModule'
}, {
    path: 'tempAuth.do/cohortmart',
    loadChildren: './cohort/cohort.module#CohortModule'
}, {
    path: '**',
    component: ErrorComponent
}];
