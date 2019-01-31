import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
 	selector: 'mart-column',
    templateUrl: './column.component.html',
})

export class ColumnComponent implements OnInit {
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
