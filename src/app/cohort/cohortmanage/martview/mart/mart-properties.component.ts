import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import {NgbModal, NgbPanelChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import notify from 'devextreme/ui/notify';

import { CohortManageService } from '../../cohort-manage.service';
import { MartService } from './mart.service';
import { TranslateService } from "@ngx-translate/core";
import { AppService } from "../../../../app.service";
import {TableColumnDialogComponent} from "../column/table-column-dialog.component";
import {DeleteModal} from "../../../modal/delete-modal.component";

declare const $: any;

@Component({
 	selector: 'mart-properties',
	templateUrl: './mart-properties.component.html'
})

export class MartPropertiesComponent implements OnInit {
  @ViewChild('mName') mName: ElementRef;
  @ViewChild('mCnte') mCnte: ElementRef;
  @ViewChild('mSuffix') mSuffix: ElementRef;
  @ViewChild('mSchedule') mSchedule: ElementRef;
  @ViewChild('mOwner') mOwner: ElementRef;
  @ViewChild('mPatientSql') mPatientSql: ElementRef;

  cohort: any = {};
  maxLength: number = 20000;

  mart: any = {
    idx: '',
    name:  '',
    cnte: '',
    suffix: '',
    schedule: 'N',
//    share: 'N',
    owner: '',
    patientSql: ''
  };

  trans: any = {
    inputName: null,
    inputDescription: null,
    inputSuffix: null,
    inputOwner: null,
    inputPatientSql: null,
    saved: null,
    save: null,
    createCohortMartStr: null,
    suffixDuplication: null,
    failed: null
  };

  txt: any = {
    inputName: 'cohort.mart.input.name',
    inputDescription: 'cohort.mart.input.description',
    inputSuffix: 'cohort.mart.input.suffix',
    inputOwner: 'cohort.mart.input.owner',
    inputPatientSql: 'cohort.mart.input.patient-sql',
    saved: 'cohort.saved',
    save: 'cohort.save',
    createCohortMartStr: 'cohort.mart.create',
    suffixDuplication: 'cohort.mart.suffix-duplication',
    failed: 'cohort.failed'
  };

  createCohortMartStr: string = '';

  constructor(
      private _service: MartService,
      private _cohortManageService: CohortManageService,
      private _translate: TranslateService,
      private _appService: AppService,
      private _modalService: NgbModal,
  ) {
    this._translate.use(this._appService.langInfo);
    for(let key of Object.keys(this.txt)) {
      if(this.txt[key]) {
        this._translate.get(this.txt[key]).subscribe(res => {
          this.trans[key] = res;
        });
      }
    }
    this._cohortManageService.selectedMartId$.subscribe(res => {
      this.cohort = this._cohortManageService.getSelectedCohort();
      this.mart.idx = this.cohort.CHT_ID;
      this.mart.name = this.cohort.CHT_NM?this.cohort.CHT_NM:'';
      this.mart.cnte = this.cohort.CHT_CNTE?this.cohort.CHT_CNTE:'';
      this.mart.suffix = this.cohort.CHT_SFX?this.cohort.CHT_SFX:'';
      this.mart.schedule = this.cohort.CHT_SCH?this.cohort.CHT_SCH:'N';
      this.mart.plsch = this.cohort.CHT_PL_SCH?this.cohort.CHT_PL_SCH:'N';
//      this.mart.share = this.cohort.CHT_SHARE?this.cohort.CHT_SHARE:'N';
      this.mart.owner = this.cohort.OWNER?this.cohort.OWNER:'';
      this.mart.patientSql = this.cohort.CHT_PL_SQL?this.cohort.CHT_PL_SQL:'';
      if( this.mart.idx == "0" ) {
        this.createCohortMartStr = this.trans.createCohortMartStr;
      } else {
        this.createCohortMartStr = '';
      }
    });
	}

  ngOnInit() {
  }

  cohortSave() {
    if( this.mart.name == '' ) {
      notify({message:this.trans['inputName'],position:{my:'Top',at:'Top'}}, 'Warning', 2000);
      this.mName.nativeElement.focus();
      return;
    }
    if( this.mart.cnte == '' ) {
      notify({message:this.trans['inputDescription'],position:{my:'Top',at:'Top'}}, 'Warning', 2000);
      this.mCnte.nativeElement.focus();
      return;
    }
    if( this.mart.suffix == '' ) {
      notify({message:this.trans['inputSuffix'],position:{my:'Top',at:'Top'}}, 'Warning', 2000);
      this.mSuffix.nativeElement.focus();
      return;
    }
/*
    if( this.mart.owner == '' ) {
      notify({message:this.trans['inputOwner'],position:{my:'Top',at:'Top'}}, 'Warning', 2000);
      this.mOwner.nativeElement.focus();
      return;
    }
*/
    if( this.mart.patientSql == '' ) {
      notify({message:this.trans['inputPatientSql'],position:{my:'Top',at:'Top'}}, 'Warning', 2000);
      this.mPatientSql.nativeElement.focus();
      return;
    }
    this._cohortManageService.cohortSave(this.mart).subscribe(res => {
      if( res.result == "suffixDuplication" ) {
        notify({message:this.trans['suffixDuplication'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
      } else if( res.result == "failed") {
        notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
      } else {
        notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
        this._cohortManageService.emitMartRefresh( this.mart.name );
      }
    });
  }

}
