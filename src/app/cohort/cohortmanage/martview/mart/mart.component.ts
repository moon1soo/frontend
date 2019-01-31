import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';

import { MartService } from './mart.service';
import { CohortManageService } from '../../cohort-manage.service';

@Component({
 	selector: 'mart',
    templateUrl: './mart.component.html',
    providers: [ MartService ]
})

export class MartComponent implements OnInit {
  @Input() cohortIdx:string;
  constructor(
    private _service: MartService,
    private _router: Router,
    private _cohortManageService: CohortManageService
	) {

  }

	ngOnInit() {
    if( this.cohortIdx) {
      this._service.setCohortIdx(this.cohortIdx);
    }
  }
}
