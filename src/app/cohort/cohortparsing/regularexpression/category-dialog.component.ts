import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import notify from "devextreme/ui/notify";
import { RegularExpressionService } from "./regular-expression.service";
import { AppService } from "../../../app.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: 'category-dialog',
	templateUrl: './category-dialog.component.html',
	providers: [
    RegularExpressionService
	]
})

export class CategoryComponent implements OnInit {
  categoryForm: FormGroup = new FormGroup({});
  @Input() data: { title: string; content: string; CTG_CD: string; CTG_NM: string; CTG_CNTE: string; MODE: string; };
  CTG_NM: string;
  CTG_CNTE: string;

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
    private _service: RegularExpressionService,
    private _translate: TranslateService,
    private _appService: AppService,
	) {
    this.categoryForm = this._fb.group({
      'CTG_NM': ['', Validators.compose([Validators.required])],
      'CTG_CNTE': ['']
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
      this.CTG_NM = this.data.CTG_NM;
      this.CTG_CNTE = this.data.CTG_CNTE;
    }
	}


  // 저장 버튼 클릭시
	submitForm(): void {
		let param = {};
		param['CTG_NM'] = this.CTG_NM;
		param['CTG_CNTE'] = this.CTG_CNTE;
    if( this.data.MODE == 'edit' ) {
      param['CTG_CD'] = this.data.CTG_CD;
      this._service.updateRegexpCategory(param).subscribe(res =>{
        if( res.result == "failed") {
          notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        } else {
          notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
          this.activeModal.close(param);
        }
      })
    } else {
      this._service.insertRegexpCategory(param).subscribe(res =>{
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
