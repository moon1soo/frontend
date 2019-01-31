import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { MartViewService } from './mart-view.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CohortManageService } from '../cohort-manage.service';
import { AppService } from "../../../app.service";
import { TranslateService } from "@ngx-translate/core";
import {NgbTabset} from "@ng-bootstrap/ng-bootstrap";

declare const $: any;

@Component({
  selector: 'mart-view',
  templateUrl: './mart-view.component.html',
  styleUrls: [ './mart-view.component.css' ],
  providers: [MartViewService]
})
export class MartViewComponent implements OnInit, AfterViewInit {
  @ViewChild('tabs')
  private tabs:NgbTabset;

  cohortIdx: string = '';
  martName: string = '';
  cohort: any = {};
  createCohortMartStr: string = '';

  tabsInitialized: boolean = false;

  constructor(
    public _service: MartViewService,
    private _router: Router,
    private router: ActivatedRoute,
    private _translate: TranslateService,
    private _appService: AppService,
    private _cohortManageService: CohortManageService
  ) {
    this._translate.use(this._appService.langInfo);
    this._translate.get('cohort.mart.create').subscribe(res => {
      this.createCohortMartStr = res;
    });
    this.martName = this.createCohortMartStr;
    this._cohortManageService.martRefresh$.subscribe(res => {
      this.martName = res;
    });
  }

  ngAfterViewInit() {
    this.tabsInitialized = true;
  }

  ngOnInit() {
    this._cohortManageService.selectedMartId$.subscribe(res => {
      if( this.cohortIdx == res ) return;
      if( this.tabsInitialized )
        this.tabs.select('tab1');
      this.cohortIdx = res;
      this.cohort = this._cohortManageService.getSelectedCohort();
      if( this.cohortIdx == '0' )
        this.martName = this.createCohortMartStr;
      else
        this.martName = this.cohort.CHT_NM;
      this.loadData();
    });
  }

  loadData() {

  }
}
