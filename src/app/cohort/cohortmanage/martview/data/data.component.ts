import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
 	selector: 'mart-source-data',
    templateUrl: './data.component.html',
})

export class DataComponent implements OnInit {
    isFilter: boolean = false;

  constructor(
    private _router: Router,
	) {
//      this._service.list().subscribe(res => {
//      });
  }
	ngOnInit() {

  }
}
