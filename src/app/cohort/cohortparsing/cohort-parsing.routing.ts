import { Routes } from '@angular/router';

import { CohortParsingComponent } from './cohort-parsing.component'
import { TableViewComponent } from './tableview/table-view.component'
import { RegularExpressionComponent } from './regularexpression/regular-expression.component'

export const CohortParsingRoutes: Routes = [{
	path: '',
	component: CohortParsingComponent,
	children: [
    {
      path: 'tblView/:idx',
      component: TableViewComponent
    },
    {
      path: 'reqularExpression',
      component: RegularExpressionComponent
    }
	]

}]
