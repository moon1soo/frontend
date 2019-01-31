import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';
import {NgbDateStruct, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import {FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import {AppState} from '../../../app.state';
import { AppService } from '../../../app.service';
import {DashboardService} from '../../dashboard.service';
import {DashboardState} from '../../dashboard.state';
import {StoreService} from '../../store/store.service';
import {NursAssmService} from './nurs-assm.service';

import * as Model from '../../model/dashboard.model';
import * as StoreModel from '../../store/store.model';
import {Route} from '@angular/router/src/config';

interface nursAssmModel {
  select: string;
  wrtDtSt: NgbDateStruct;
  wrtDtEd: NgbDateStruct;
  ifflScr1: string;
  ifflScr2: string;
  ifflDor: string;
  bdsrScr1: string;
  bdsrScr2: string;
  bdsrStep: string;
  ptCtg: string;
  ptSlCmmScr1: string;
  ptSlCmmScr2: string;
  ptSlCmmCtg: string;
  ptSlMtScr1: string;
  ptSlMtScr2: string;
  ptSlMtCtg: string;
  ptSlApcScr1: string;
  ptSlApcScr2: string;
  ptSlApcCtg: string;
}

@Component({
  selector: 'nurs-assm',
  templateUrl: './nurs-assm.component.html',
  providers: [
    NursAssmService
  ]
})
export class NursAssmComponent implements OnInit {

  nursAssmForm: FormGroup;
  nursAssmData: nursAssmModel;

  ifflScrDisabled = false;
  bdsrScrDisabled = false;

  ptCmmExists = true;
  ptMtExists = false;
  ptApcExists = false;

  refreshMode: boolean = false;

  seqCode: string = this._localService.secCode;

	storageAssm: {
    select: string;
    wrtDtSt: string;
    wrtDtEd: string;
    ifflScr1: string,
    ifflScr2: string,
    ifflDor: string,
    bdsrScr1: string,
    bdsrScr2: string,
    bdsrStep: string,
    ptCtg: string,
    ptSlCmmScr1: string,
    ptSlCmmScr2: string,
    ptSlCmmCtg: string,
    ptSlMtScr1: string,
    ptSlMtScr2: string,
    ptSlMtCtg: string,
    ptSlApcScr1: string,
    ptSlApcScr2: string,
    ptSlApcCtg: string,
  } = {
    select: null,
    wrtDtSt: null,
    wrtDtEd: null,
    ifflScr1: null,
    ifflScr2: null,
    ifflDor: '없음',
    bdsrScr1: null,
    bdsrScr2: null,
    bdsrStep: '없음',
    ptCtg: 'ptCmm',
    ptSlCmmScr1: null,
    ptSlCmmScr2: null,
    ptSlCmmCtg: '없음',
    ptSlMtScr1: null,
    ptSlMtScr2: null,
    ptSlMtCtg: '없음',
    ptSlApcScr1: null,
    ptSlApcScr2: null,
    ptSlApcCtg: '없음',
  };

  constructor(
    private _app: AppState,
    private _service: DashboardService,
    private _store: StoreService,
    private _state: DashboardState,
    private _fb: FormBuilder,
    private _router: Router,
    private _localService: NursAssmService,
    private _translate: TranslateService,
    private _modalService: NgbModal,
    private _appService: AppService
  ) {
  }
  ngOnInit() {
    sessionStorage.setItem('currentUrl', this._router.url);

		// 언어 변경
		this._translate.use(this._appService.langInfo);
		this._appService.language$.subscribe(res => {
			this._translate.use(res); 
			setTimeout(() => {
				window.location.reload();
			}, 100);
    });
    
		const store = this._store.store;
		const storage = store[this._state.code[this.seqCode].storage];    
    
		if(storage) {
			this.storageAssmLoad(storage);
		}    

    this._store.deleteVo$.subscribe(res => {
      if (res === this._state.code[this._localService.secCode].storage) {
        this.refreshMode = true;
        this.nursAssmData = {
          select: null,
          wrtDtSt: null,
          wrtDtEd: null,
          ifflScr1: null,
          ifflScr2: null,
          ifflDor: '없음',
          bdsrScr1: null,
          bdsrScr2: null,
          bdsrStep: '없음',
          ptCtg: 'ptCmm',
          ptSlCmmScr1: null,
          ptSlCmmScr2: null,
          ptSlCmmCtg: '없음',
          ptSlMtScr1: null,
          ptSlMtScr2: null,
          ptSlMtCtg: '없음',
          ptSlApcScr1: null,
          ptSlApcScr2: null,
          ptSlApcCtg: '없음',
        }
        this._localService.list().subscribe(res => {
          setTimeout(() => {this.refreshMode = false;}, 200);
        });
      }
    });
    this.nursAssmForm = this._fb.group({
      'select': ['Y', Validators.compose([Validators.required])],
      'wrtDtSt': [this.nursAssmData.wrtDtSt, Validators.compose([Validators.required])],
      'wrtDtEd': [this.nursAssmData.wrtDtEd, Validators.compose([Validators.required])],
      'ifflScr1': [{ value: this.nursAssmData.ifflScr1, disabled: false }],
      'ifflScr2': [{ value: this.nursAssmData.ifflScr2, disabled: false }],
      'ifflDor': [this.nursAssmData.ifflDor],
      'bdsrScr1': [{ value: this.nursAssmData.bdsrScr1, disabled: false }],
      'bdsrScr2': [{ value: this.nursAssmData.bdsrScr2, disabled: false }],
      'bdsrStep': [this.nursAssmData.bdsrStep],
      'ptCtg': [this.nursAssmData.ptCtg],
      'ptSlCmmScr1': [this.nursAssmData.ptSlCmmScr1],
      'ptSlCmmScr2': [this.nursAssmData.ptSlCmmScr2],
      'ptSlCmmCtg': [this.nursAssmData.ptSlCmmCtg],
      'ptSlMtScr1': [this.nursAssmData.ptSlMtScr1],
      'ptSlMtScr2': [this.nursAssmData.ptSlMtScr2],
      'ptSlMtCtg': [this.nursAssmData.ptSlMtCtg],
      'ptSlApcScr1': [this.nursAssmData.ptSlApcScr1],
      'ptSlApcScr2': [this.nursAssmData.ptSlApcScr2],
      'ptSlApcCtg': [this.nursAssmData.ptSlApcCtg],
    });
    setTimeout(() => {
      const tbl = document.querySelector('.gridContainer');
      const inner = document.querySelector('.tab-inner-area');

      this.watchForm();
    }, 10);
  }

	// 날짜 로드
	storageAssmLoad(storage: any): void {
    this.nursAssmData.select = storage.select;
		this.nursAssmData.wrtDtSt = storage.wrtDtSt;
    this.nursAssmData.wrtDtEd = storage.wrtDtEd;
    this.nursAssmData.ifflScr1 = storage.ifflScr1;
    this.nursAssmData.ifflScr2 = storage.ifflScr2;
    this.nursAssmData.ifflDor = storage.ifflDor;
    this.nursAssmData.bdsrScr1 = storage.bdsrScr1;
    this.nursAssmData.bdsrScr2 = storage.bdsrScr2;
    this.nursAssmData.bdsrStep = storage.bdsrStep;
    this.nursAssmData.ptCtg = storage.ptCtg;
    this.nursAssmData.ptSlCmmScr1 = storage.ptSlCmmScr1;
    this.nursAssmData.ptSlCmmScr2 = storage.ptSlCmmScr2;
    this.nursAssmData.ptSlCmmCtg = storage.ptSlCmmCtg;
    this.nursAssmData.ptSlMtScr1 = storage.ptSlMtScr1;
    this.nursAssmData.ptSlMtScr2 = storage.ptSlMtScr2;
    this.nursAssmData.ptSlMtCtg = storage.ptSlMtCtg;
    this.nursAssmData.ptSlApcScr1 = storage.ptSlApcScr1;
    this.nursAssmData.ptSlApcScr2 = storage.ptSlApcScr2;
    this.nursAssmData.ptSlApcCtg = storage.ptSlApcCtg;
		this.storageAssm = {
      select: storage.select,
      wrtDtSt: storage.wrtDtSt,
      wrtDtEd: storage.wrtDtEd,
      ifflScr1: storage.ifflScr1,
      ifflScr2: storage.ifflScr2,
      ifflDor: storage.ifflDor,
      bdsrScr1: storage.bdsrScr1,
      bdsrScr2: storage.bdsrScr2,
      bdsrStep: storage.bdsrStep,
      ptCtg: storage.ptCtg,
      ptSlCmmScr1: storage.ptSlCmmScr1,
      ptSlCmmScr2: storage.ptSlCmmScr2,
      ptSlCmmCtg: storage.ptSlCmmCtg,
      ptSlMtScr1: storage.ptSlMtScr1,
      ptSlMtScr2: storage.ptSlMtScr2,
      ptSlMtCtg: storage.ptSlMtCtg,
      ptSlApcScr1: storage.ptSlApcScr1,
      ptSlApcScr2: storage.ptSlApcScr2,
      ptSlApcCtg: storage.ptSlApcCtg,
    };
	}  

  // 폼 변경 여부 관찰.
  watchForm(): void {
    this.nursAssmForm.valueChanges
      .debounceTime(100)
      .distinctUntilChanged()
      .subscribe(res => {
        if (!this.refreshMode) {
          for (let key of Object.keys(res)) {
            let data;
            if (res[key] && res[key].year) {
              data = this._app.dateConvertStr(res[key]);
            } else {
              data = res[key];
            }
            this._service.addDataString(this._localService.secCode, key, data);
          }
        }
      });
  }

  setDisabled(ctg, scr) {

    if (scr === 'iffl') {
      let ifflScr1 = this.nursAssmForm.get('ifflScr1');
      let ifflScr2 = this.nursAssmForm.get('ifflScr2');

      if (ctg === '없음') {
        ifflScr1.enable();
        ifflScr2.enable();
      } else {
        this.nursAssmData.ifflScr1 = null;
        this.nursAssmData.ifflScr2 = null;

        ifflScr1.disable();
        ifflScr2.disable();
      }
    } else if (scr === 'bdsr') {
      let bdsrScr1 = this.nursAssmForm.get('bdsrScr1');
      let bdsrScr2 = this.nursAssmForm.get('bdsrScr2');

      if (ctg === '없음') {
        bdsrScr1.enable();
        bdsrScr2.enable();
      } else {
        this.nursAssmData.bdsrScr1 = null;
        this.nursAssmData.bdsrScr2 = null;

        bdsrScr1.disable();
        bdsrScr2.disable();
      }
    } else if (scr === 'ptSlCmm') {
      let ptSlCmmScr1 = this.nursAssmForm.get('ptSlCmmScr1');
      let ptSlCmmScr2 = this.nursAssmForm.get('ptSlCmmScr2');

      if (ctg === '없음') {
        ptSlCmmScr1.enable();
        ptSlCmmScr2.enable();
      } else {
        this.nursAssmData.ptSlCmmScr1 = null;
        this.nursAssmData.ptSlCmmScr2 = null;

        ptSlCmmScr1.disable();
        ptSlCmmScr2.disable();
      }
    } else if (scr === 'ptSlMt') {
      let ptSlMtScr1 = this.nursAssmForm.get('ptSlMtScr1');
      let ptSlMtScr2 = this.nursAssmForm.get('ptSlMtScr2');

      if (ctg === '없음') {
        ptSlMtScr1.enable();
        ptSlMtScr2.enable();
      } else {
        this.nursAssmData.ptSlMtScr1 = null;
        this.nursAssmData.ptSlMtScr2 = null;

        ptSlMtScr1.disable();
        ptSlMtScr2.disable();
      }
    } else if (scr === 'ptSlApc') {
      let ptSlApcScr1 = this.nursAssmForm.get('ptSlApcScr1');
      let ptSlApcScr2 = this.nursAssmForm.get('ptSlApcScr2');

      if (ctg === '없음') {
        ptSlApcScr1.enable();
        ptSlApcScr2.enable();
      } else {
        this.nursAssmData.ptSlApcScr1 = null;
        this.nursAssmData.ptSlApcScr2 = null;

        ptSlApcScr1.disable();
        ptSlApcScr2.disable();
      }
    }
  }

  setPtCtg(ctg) {
    if (ctg === 'ptCmm') {
      this.ptCmmExists = true;
      this.ptMtExists = false;
      this.ptApcExists = false;

      this.nursAssmData.ptSlMtScr1 = null;
      this.nursAssmData.ptSlMtScr2 = null;
      this.nursAssmData.ptSlMtCtg = null;
      this.nursAssmData.ptSlApcScr1 = null;
      this.nursAssmData.ptSlApcScr2 = null;
      this.nursAssmData.ptSlApcCtg = null;

      this.nursAssmData.ptCtg = 'ptCmm';
    } else if (ctg === 'ptMt') {
      this.ptCmmExists = false;
      this.ptMtExists = true;
      this.ptApcExists = false;

      this.nursAssmData.ptSlCmmScr1 = null;
      this.nursAssmData.ptSlCmmScr2 = null;
      this.nursAssmData.ptSlCmmCtg = null;
      this.nursAssmData.ptSlApcScr1 = null;
      this.nursAssmData.ptSlApcScr2 = null;
      this.nursAssmData.ptSlApcCtg = null;

      this.nursAssmData.ptCtg = 'ptMt';
    } else if (ctg === 'ptApc') {
      this.ptCmmExists = false;
      this.ptMtExists = false;
      this.ptApcExists = true;

      this.nursAssmData.ptSlCmmScr1 = null;
      this.nursAssmData.ptSlCmmScr2 = null;
      this.nursAssmData.ptSlCmmCtg = null;
      this.nursAssmData.ptSlMtScr1 = null;
      this.nursAssmData.ptSlMtScr2 = null;
      this.nursAssmData.ptSlMtCtg = null;

      this.nursAssmData.ptCtg = 'ptApc';
    }
  }

}