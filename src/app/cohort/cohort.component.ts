import { Component } from '@angular/core';
import {Router} from "@angular/router";
@Component({
  selector: 'cohort',
  templateUrl: './cohort.component.html'
})
export class CohortComponent {
  constructor(
    private _router: Router,
  ){
    sessionStorage.setItem('currentUrl', this._router.url);
  }
}
