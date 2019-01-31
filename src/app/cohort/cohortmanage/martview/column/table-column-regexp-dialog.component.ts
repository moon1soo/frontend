import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CohortManageService } from "../../cohort-manage.service";
import { TranslateService } from "@ngx-translate/core";
import { AppService } from "../../../../app.service";
import notify from "devextreme/ui/notify";
import * as _ from "lodash";

@Component({
	selector: 'table-column-regexp-dialog',
	templateUrl: './table-column-regexp-dialog.component.html',
	providers: [
    CohortManageService
	]
})

export class TableColumnRegexpDialogComponent implements OnInit, AfterViewInit {
  @Input() data: { title: string; content: string; TBL_ID: string; COL_ID: string; COL_NM: string; MODE: string; };

  COL_ID: string;
  COL_NM: string;

  columnRegularExpress: any = [];
  regexpCategory: string;
  regexpCategorys: any = [];
  regexp: string;
  regexps: any = [];

  trans: any = {
    select_regex: null,
    saved: null,
    save: null,
    failed: null,
  };
  txt: any = {
    select_regex: 'cohort.mart.table.column.regex.select_regex',
    saved: 'cohort.saved',
    save: 'cohort.save',
    failed: 'cohort.failed'
  };

  constructor(
		private _fb: FormBuilder,
		public activeModal: NgbActiveModal,
    private _cohortManageService: CohortManageService,
    private _translate: TranslateService,
    private _appService: AppService,
	) {
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
    this.getRegExpMeta();
    this.getRegexpCategory();
    this.COL_ID = this.data.COL_ID;
    this.COL_NM = this.data.COL_NM;
	}

	getRegExpMeta() {
    this.columnRegularExpress = [];
    this._cohortManageService.tableColumnRegExs(this.data.COL_ID).subscribe(res => {
      this.columnRegularExpress = res.data;
    });
  }

  deleteRegularExpress(RGEP_ID) {
    this._cohortManageService.deleteTableColumnRegEx(RGEP_ID).subscribe(res => {
      if( res.result && res.result == 'success' ) {
        this.getRegExpMeta();
        notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
      } else {
        notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
      }
    });
  }

  addRegularExpress() {
    if( this.regexp == '' ) {
      notify({message:this.trans['select_regex'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
      return;
    }
    this._cohortManageService.addTableColumnRegEx(this.COL_ID,this.regexp).subscribe(res => {
      if( res.result && res.result == 'success' ) {
        this.getRegExpMeta();
        notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
      } else {
        notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
      }
    });
  }

  getRegexpCategory() {
    this.regexpCategorys = [];
    this.regexpCategory = '';
    this.regexp = '';
    this.regexpCategorys.push({CTG_CD:'',CTG_NM:'Select..'});
    this._cohortManageService.getRegexpCategory().subscribe(res => {
      for (let data of res.result) {
        this.regexpCategorys.push({
          CTG_CD: data.CTG_CD,
          CTG_NM: data.CTG_NM,
        });
      }
    });
  }

  changeRegexpCategory(val) {
    this.regexp = '';
    this.regexps = [];
    this.regexps.push({RGEP_CD:'',RGEP_DATA:'',RGEP_NM:'Select..'});
    this._cohortManageService.getRegexps(val).subscribe(res => {
      for (let data of res.result) {
        this.regexps.push({
          RGEP_CD: data.RGEP_CD,
          RGEP_DATA: data.RGEP_DATA,
          RGEP_NM: data.RGEP_NM
        });
      }
    });
  }

  changeRegexp(val) {
/*
    let list = _.filter(this.regexps,{'RGEP_CD':val});
    if( list.length > 0 ) {
//      this.regex = list[0].RGEP_DATA;
      document.querySelector('#regex').innerHTML = list[0].RGEP_DATA;
      this.regexChanged();
    }
*/
  }

	// Enter 키 입력 방지
	onKeyPress(event) {
		if (event.keyCode === 13) {
			return false;
		}
	}
}
