import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';


import {CohortManageService} from "../../cohort-manage.service";
declare const $: any;

@Component({
 	selector: 'data-list',
	templateUrl: './data-list.component.html'
})

export class DataListComponent implements OnInit {
  dataSource: any[] = [];

  constructor(
    private _cohortManageService: CohortManageService,
  ) {
  }

  ngOnInit() {
    this._cohortManageService.selectedMartId$.subscribe(res => {
      this.loadData();
    });
    this._cohortManageService.tabRefresh$.subscribe(res => {
      this.loadData();
    });
  }

  onRowClick(event: any) {
    this._cohortManageService.emitSelectedSourceDataId( event.data.TBL_ID, event.data.TBL_SFX, event.data.PSO_SQL );
  }

  loadData() {
    this._cohortManageService.loadMartTables().subscribe(res => {
      this.dataSource = res.data;
    });
  }
}
