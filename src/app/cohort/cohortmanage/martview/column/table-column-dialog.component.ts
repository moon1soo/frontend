import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CohortManageService } from "../../cohort-manage.service";
import { TranslateService } from "@ngx-translate/core";
import { AppService } from "../../../../app.service";
import notify from "devextreme/ui/notify";

@Component({
	selector: 'table-column-dialog',
	templateUrl: './table-column-dialog.component.html',
	providers: [
    CohortManageService
	]
})

export class TableColumnDialogComponent implements OnInit, AfterViewInit {
  tableColumnForm: FormGroup = new FormGroup({});
  @Input() data: { title: string; content: string; COL_ID: string; TBL_ID: string; TBL_SFX: string; CHT_ID: string; COL_NM: string; COL_GRP: number; COL_TP: string; COL_SIZE: string; COL_SRC: string;
//    COL_SHARE: string;
    COL_VISIBLE: boolean; COL_SORT: string; COL_ANONYMOUS: boolean; COL_EDIT: boolean; COL_ISPK: boolean; COL_CNTE: string;
    MODE: string; };

  COL_ID: string;
  COL_NM: string;
  COL_GRP: number;
  COL_TP: string;
  COL_SIZE: string;
  COL_SRC: string;
//  COL_SHARE: string = 'Y';
  COL_VISIBLE: boolean;
  COL_SORT: string;
  COL_ANONYMOUS: boolean;
  COL_EDIT: boolean;
  COL_ISPK: boolean;
  COL_CNTE: string;

  strSizeView = true;

  groups: {name: string; value: number}[] = [];
  parsingSourceColumns: any = [];

  trans: any = {
    inputSuffix: null,
    inputPsoCnte: null,
    inputPrcCnte: null,
    saved: null,
    save: null,
    suffixDuplication: null,
    failed: null,
    inputColSize: null
  };
  txt: any = {
    inputSuffix: 'cohort.mart.table.input.suffix',
    inputPsoCnte: 'cohort.mart.table.input.pso_cnte',
    inputPrcCnte: 'cohort.mart.table.input.prc_cnte',
    saved: 'cohort.saved',
    save: 'cohort.save',
    suffixDuplication: 'cohort.mart.suffix-duplication',
    failed: 'cohort.failed',
    inputColSize: 'cohort.mart.table.column.input.col_size'
  };

  constructor(
		private _fb: FormBuilder,
		public activeModal: NgbActiveModal,
    private _cohortManageService: CohortManageService,
    private _translate: TranslateService,
    private _appService: AppService,
	) {
    this.tableColumnForm = this._fb.group({
      'COL_NM': ['', Validators.compose([Validators.required])],
//      'COL_GRP': ['', Validators.compose([Validators.required])],
      'COL_TP': ['', Validators.compose([Validators.required])],
      'COL_SIZE': [''],
      'COL_SRC': [''],
      'COL_SORT': ['', Validators.compose([Validators.required])],
      'COL_CNTE': ['', Validators.compose([Validators.required])],
//      'COL_SHARE': [''],
      'COL_VISIBLE': [''],
      'COL_ANONYMOUS': [''],
      'COL_EDIT': [''],
      'COL_ISPK': [''],
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
    this._cohortManageService.loadMartTableGroup(this.data.TBL_ID,this.data.TBL_SFX).subscribe(res => {
      this.groups = [];
      this.groups.push({name:'None',value:0});
      var groups = res.data;
      if( groups && groups.length > 0 ) {
        groups.forEach((v,i) => {
          this.groups.push( {name:v.GRP_NM,value:v.GRP_ID} );
        });
      }
      this.parsingSourceColumns = [];
      this.parsingSourceColumns.push({name:'None',value:''});
      var parsingSourceColumns = res.psc;
      if( parsingSourceColumns && parsingSourceColumns.length>0 ) {
        parsingSourceColumns.forEach((v,i) => {
          this.parsingSourceColumns.push( {name:v.COLUMN_NAME,value:v.COLUMN_NAME})
        });
      }
      if( this.data.MODE == 'edit' ) {
        this.COL_NM = this.data.COL_NM;
        this.COL_GRP = this.data.COL_GRP;
        this.COL_TP = this.data.COL_TP;
        this.COL_SIZE = this.data.COL_SIZE;
        this.COL_SRC = this.data.COL_SRC;
//        this.COL_SHARE = this.data.COL_SHARE;
        this.COL_VISIBLE = this.data.COL_VISIBLE;
        this.COL_SORT = this.data.COL_SORT;
        this.COL_ANONYMOUS = this.data.COL_ANONYMOUS;
        this.COL_EDIT = this.data.COL_EDIT;
        this.COL_ISPK = this.data.COL_ISPK;
        this.COL_CNTE = this.data.COL_CNTE;
        if(this.COL_TP=='STR') {
          this.strSizeView = true;
        } else {
          this.strSizeView = false;
        }

      } else {
        this.COL_GRP = 0;
        this.COL_TP = 'STR';
        this.COL_SRC = '';
      }
    });

	}

  changeColTp(val) {
      if(val=='STR') {
        this.strSizeView = true;
      } else {
        this.strSizeView = false;
      }
  }

  // 저장 버튼 클릭시
	submitForm(): void {
		let param = {};
    param['TBL_ID'] = this.data.TBL_ID;
    param['TBL_SFX'] = this.data.TBL_SFX;
    param['CHT_ID'] = this.data.CHT_ID;
    param['COL_NM'] = this.COL_NM;
    param['COL_GRP'] = this.COL_GRP;
    param['COL_TP'] = this.COL_TP;
    param['COL_SIZE'] = this.COL_SIZE;
    param['COL_SRC'] = this.COL_SRC;
//    param['COL_SHARE'] = this.COL_SHARE;
    param['COL_VISIBLE'] = this.COL_VISIBLE==true?'Y':'N';
    param['COL_SORT'] = this.COL_SORT;
    param['COL_ANONYMOUS'] = this.COL_ANONYMOUS==true?'Y':'N';
    param['COL_EDIT'] = this.COL_EDIT==true?'Y':'N';
    param['COL_ISPK'] = this.COL_ISPK==true?'Y':'N';
    param['COL_CNTE'] = this.COL_CNTE;
    if( this.COL_TP == 'STR' ) {
      if( !this.COL_SIZE ) {
        notify({message:this.trans['inputColSize'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        return;
      }
    }
    if( this.data.MODE == 'edit' ) {
      param['COL_ID'] = this.data.COL_ID;
      this._cohortManageService.updateMartTableColumn(param).subscribe(res =>{
        if( res.result == "failed") {
          notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        } else {
          notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
          this.activeModal.close(param);
        }
      })
    } else {
      this._cohortManageService.addMartTableColumn(param).subscribe(res =>{
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
