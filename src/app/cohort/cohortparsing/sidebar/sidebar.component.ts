import { Component, Output, EventEmitter, OnInit, Input, Pipe, Injectable, PipeTransform } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { CohortParsingService } from '../cohort-parsing.service';
import { AppState } from '../../../app.state';
import { ItemModel } from "../../../powermode/sidebar/pipe.additem";
import { TranslateService } from "@ngx-translate/core";
import { AppService } from "../../../app.service";

declare const $: any;

@Pipe({
  name: 'viewfilter'
})
@Injectable()
export class ViewFilterPipe implements PipeTransform {
  transform(items: ItemModel[], c: string): any {
    return items.filter((item) => {
      if( item['TBL_SFX'] && item['TBL_SFX'].length > 0 )
        return item['CHT_ID'] === c;
      return false;
    });
  }
}

@Pipe({
  name: 'cohortfilter'
})
@Injectable()
export class CohortFilterPipe implements PipeTransform {
  transform(items: ItemModel[]): any {
    return items.filter((item) => {
      if( item['CHT_NM'] && item['CHT_NM'].length > 0 )
        return item['CHT_NM'].indexOf('Syapse') < 0;
      return false;
    });
  }
}

@Component({
	selector: 'sidebar-layout',
	templateUrl: './sidebar.component.html',
  styleUrls: [ './sidebar.component.css' ],
  providers: [ ViewFilterPipe,CohortFilterPipe ]

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
    private _cohortParsingService: CohortParsingService,
	) {
		this.appurl = this._app.ajaxUrl;
	}
	ngOnInit() {
    this.getAllCohortList();
    this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortParsing/reqularExpression`, { skipLocationChange: true });
	}

	toggleMenu() {
    this.toggle.emit();
	}

  getAllCohortList() {
    this.allCohorts = [];
    this._cohortParsingService.allCohort().subscribe(res => {
      this.allCohorts = res;
      this.getAllTbl();
    });
  }
/*
  cohortConditon(c) {
	    if( c.indexOf('Syapse') ) return false;
	    else true;
  }
*/
  getAllTbl() {
    this._cohortParsingService.getAllTbl().subscribe(res => {
      this.tbls = res.result;
      if( this.tbls.length > 0 ) {
//        this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortView/${this.idx}/tblView/${this.tbls[0].TBL_ID}`, { skipLocationChange: true });
      }
    });
  }

  openMart( idx ) {
//    this.initialActive();
//    this.allCohorts[idx].done = true;
    this._cohortParsingService.emitSelectedMartId( this.allCohorts[idx].CHT_ID, this.allCohorts[idx] );
  }
  openTable(tblId,e,t) {
    $('.sidebar-list-link').removeClass('active');
    $('#' + t).addClass('active');
    this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortParsing/tblView/${tblId}`, { skipLocationChange: true });
  }

  rgepManage() {
    this._router.navigateByUrl(`/tempAuth.do/cohortmart/cohortParsing/reqularExpression`, { skipLocationChange: true });
  }

}
