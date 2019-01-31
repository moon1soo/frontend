import { Routes } from '@angular/router';
import { DiagramComponent } from './diagram.component';
import { ScenarioListComponent } from './scenario/scenario-list.component';
import { PaperComponent } from './paper/paper.component';
import { AdminComponent } from '../admin/admin.component';

export const DiagramRoutes = [
	{
		path: '',
		component: DiagramComponent,
		children: [{
			path: 'scenario',
			component: ScenarioListComponent
		},{
			path: 'paper',
			component: PaperComponent
		},{ 
			path: 'admin', 
			component: AdminComponent, 
			pathMatch: 'full'
		}]
	}
];
