import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import notify from "devextreme/ui/notify";
import {CohortManageService} from "../../cohort-manage.service";
import {TranslateService} from "@ngx-translate/core";
import {AppService} from "../../../../app.service";

@Component({
	selector: 'table-group-dialog',
	templateUrl: './table-group-dialog.component.html',
	providers: [
    CohortManageService
	]
})

export class TableGroupDialogComponent implements OnInit {
  tableGroupForm: FormGroup = new FormGroup({});
  @Input() data: { title: string; content: string; TBL_ID: string; GRP_ID: string; GRP_SORT: string; GRP_NM: string; GRP_CNTE: string; MODE: string; };
  GRP_SORT: string;
  GRP_NM: string;
  GRP_CNTE: string;

  trans: any = {
    saved: null,
    save: null,
    failed: null,
  };
  txt: any = {
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
    this.tableGroupForm = this._fb.group({
      'GRP_SORT': ['', Validators.compose([Validators.required])],
      'GRP_NM': ['', Validators.compose([Validators.required])],
      'GRP_CNTE': ['', Validators.compose([Validators.required])]
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

	ngOnInit() {
    if( this.data.MODE == 'edit' ) {
      this.GRP_SORT = this.data.GRP_SORT;
      this.GRP_NM = this.data.GRP_NM;
      this.GRP_CNTE = this.data.GRP_CNTE;
    }
	}


  // 저장 버튼 클릭시
	submitForm(): void {
		let param = {};
    param['TBL_ID'] = this.data.TBL_ID;
		param['GRP_SORT'] = this.GRP_SORT;
		param['GRP_NM'] = this.GRP_NM;
    param['GRP_CNTE'] = this.GRP_CNTE;
    if( this.data.MODE == 'edit' ) {
      param['GRP_ID'] = this.data.GRP_ID;
      this._cohortManageService.updateMartTableGroup(param).subscribe(res =>{
        if( res.result == "failed") {
          notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        } else {
          notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
          this.activeModal.close(param);
        }
      })
    } else {
      this._cohortManageService.addMartTableGroup(param).subscribe(res =>{
        if( res.result == "failed") {
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
