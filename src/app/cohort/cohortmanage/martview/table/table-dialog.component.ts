import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import notify from "devextreme/ui/notify";
import {CohortManageService} from "../../cohort-manage.service";
import {TranslateService} from "@ngx-translate/core";
import {AppService} from "../../../../app.service";

@Component({
	selector: 'table-dialog',
	templateUrl: './table-dialog.component.html',
	providers: [
    CohortManageService
	]
})

export class TableDialogComponent implements OnInit, AfterViewInit {
  tableForm: FormGroup = new FormGroup({});
  @Input() data: { title: string; content: string; CHT_ID: string; TBL_ID: string; TBL_SFX: string;
//  TBL_SHARE: string;
  TBL_SORT: string; PSO_CNTE: string; PRC_CNTE: string; MODE: string; };
  TBL_SFX: string;
  PSO_CNTE: string;
  PRC_CNTE: string;
//  TBL_SHARE: string = 'Y';
  TBL_SORT: string;

  trans: any = {
    inputSuffix: null,
    inputPsoCnte: null,
    inputPrcCnte: null,
    saved: null,
    save: null,
    suffixDuplication: null,
    failed: null,
  };
  txt: any = {
    inputSuffix: 'cohort.mart.table.input.suffix',
    inputPsoCnte: 'cohort.mart.table.input.pso_cnte',
    inputPrcCnte: 'cohort.mart.table.input.prc_cnte',
    saved: 'cohort.saved',
    save: 'cohort.save',
    suffixDuplication: 'cohort.mart.suffix-duplication',
    failed: 'cohort.failed'
  };

  constructor(
		private _fb: FormBuilder,
		public activeModal: NgbActiveModal,
    private _cohortManageService: CohortManageService,
    private _translate: TranslateService,
    private _appService: AppService,
	) {
    this.tableForm = this._fb.group({
      'TBL_SFX': ['', Validators.compose([Validators.required])],
      'PSO_CNTE': ['', Validators.compose([Validators.required])],
      'PRC_CNTE': ['', Validators.compose([Validators.required])],
//      'TBL_SHARE': [''],
      'TBL_SORT': ['', Validators.compose([Validators.required])]
    });
    this._translate.use(this._appService.langInfo);
    for(let key of Object.keys(this.txt)) {
      if(this.txt[key]) {
        this._translate.get(this.txt[key]).subscribe(res => {
          this.trans[key] = res;
        });
      }
    }
	}

  ngAfterViewInit() {
//    this.reasonCnteElement.nativeElement.focus();
  }


	ngOnInit() {
    if( this.data.MODE == 'edit' ) {
      this.TBL_SFX = this.data.TBL_SFX;
      this.PSO_CNTE = this.data.PSO_CNTE;
      this.PRC_CNTE = this.data.PRC_CNTE;
//      this.TBL_SHARE = this.data.TBL_SHARE;
      this.TBL_SORT = this.data.TBL_SORT;
    }
	}


  // 저장 버튼 클릭시
	submitForm(): void {
		let param = {};
    param['CHT_ID'] = this.data.CHT_ID;
		param['TBL_SFX'] = this.TBL_SFX;
		param['PSO_CNTE'] = this.PSO_CNTE;
    param['PRC_CNTE'] = this.PRC_CNTE;
//    param['TBL_SHARE'] = this.TBL_SHARE;
    param['TBL_SORT'] = this.TBL_SORT;
    if( this.data.MODE == 'edit' ) {
      param['TBL_ID'] = this.data.TBL_ID;
      this._cohortManageService.updateMartTable(param).subscribe(res =>{
        if( res.result == "failed") {
          notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        } else {
          notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
          this.activeModal.close(param);
        }
      })
    } else {
      this._cohortManageService.addMartTable(param).then(res =>{
        if( res.result == 'suffixDuplication' ) {
          notify({message:this.trans['suffixDuplication'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        } else if( res.result == "failed") {
          notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        } else {
          notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
          this.activeModal.close(param);
        }
      })
    }
	}

	// Enter 키 입력 방지
	onKeyPress(event) {
		if (event.keyCode === 13) {
			return false;
		}
	}
}
