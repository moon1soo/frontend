import { Component, Output, EventEmitter, OnInit, Input, Pipe, Injectable, PipeTransform } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { CohortManageService } from '../cohort-manage.service';
import { AppState } from '../../../app.state';
import { ItemModel } from "../../../powermode/sidebar/pipe.additem";
import { TranslateService } from "@ngx-translate/core";
import { AppService } from "../../../app.service";

@Pipe({
  name: 'viewfilter'
})
@Injectable()
export class ViewFilterPipe implements PipeTransform {
  transform(items: ItemModel[], c: string): any {
    return items.filter((item) => {
      if( item['PRC_NM'] && item['PRC_NM'].length > 0 )
        return item['CHT_ID'] === c;
      return false;
    });
  }
}

@Component({
	selector: 'sidebar-layout',
	templateUrl: './sidebar.component.html',
  styleUrls: [ './sidebar.component.css' ],
  providers: [ ViewFilterPipe ]

})
export class SidebarComponent implements OnInit {
	@Output() toggle = new EventEmitter();
	closeResult: string;
	appurl: string;
	adminYn: boolean = false;

  allCohorts: any[] = [];
  tbls: any[] = [];

  closeOther: boolean = true;

  @Input() idx:string;
	constructor(
		private _app: AppState,
		private _router: Router,
    private _cohortManageService: CohortManageService,
	) {
		this.appurl = this._app.ajaxUrl;
	}
	ngOnInit() {
    this.getAllCohortList();
    this._cohortManageService.emitSelectedMartId( "0", {CHT_ID:"0"} );
    this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortManage/martView`, { skipLocationChange: true });
    this._cohortManageService.martRefresh$.subscribe(res => {
      this.getAllCohortList();
    });
	}

	toggleMenu() {
    this.toggle.emit();
	}

  getAllCohortList() {
    this.allCohorts = [];
    this._cohortManageService.allCohort().subscribe(res => {
      this.allCohorts = res;
      this.initialActive();
//        this.getAllTbl();
    });
  }

  getAllTbl() {
    this._cohortManageService.getAllTbl().subscribe(res => {
      this.tbls = res.result;
/*
      if( this.tbls.length > 0 ) {
//        this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortView/${this.idx}/tblView/${this.tbls[0].TBL_ID}`, { skipLocationChange: true });
      }
*/
    });
  }

  initialActive() {
    for( var i=0; i<this.allCohorts.length;i++) {
      this.allCohorts[i].done = false;
    }
  }

  newCohort() {
    this.initialActive();
    this._cohortManageService.emitSelectedMartId( "0", {CHT_ID:"0"} );
  }

  openMart( idx ) {
    this.initialActive();
    this.allCohorts[idx].done = true;
    this._cohortManageService.emitSelectedMartId( this.allCohorts[idx].CHT_ID, this.allCohorts[idx] );
  }

}
