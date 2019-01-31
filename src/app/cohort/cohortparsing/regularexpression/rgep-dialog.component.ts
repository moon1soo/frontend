import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import notify from "devextreme/ui/notify";
import { RegularExpressionService } from "./regular-expression.service";
import { AppService } from "../../../app.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: 'rgep-dialog',
	templateUrl: './rgep-dialog.component.html',
	providers: [
    RegularExpressionService
	]
})

export class RgepDialogComponent implements OnInit {
  rgepForm: FormGroup = new FormGroup({});
  @Input() data: { title: string; content: string; RGEP_CD: string; CTG_CD: string; RGEP_NM: string; RGEP_DATA: string; RGEP_CNTE: string; MODE: string; };
  RGEP_NM: string;
  RGEP_DATA: string;
  RGEP_CNTE: string;

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
    this.rgepForm = this._fb.group({
      'RGEP_NM': ['', Validators.compose([Validators.required])],
      'RGEP_DATA': ['', Validators.compose([Validators.required])],
      'RGEP_CNTE': ['']
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
      this.RGEP_NM = this.data.RGEP_NM;
      this.RGEP_DATA = this.data.RGEP_DATA;
      this.RGEP_CNTE = this.data.RGEP_CNTE;
    }
	}


  // 저장 버튼 클릭시
	submitForm(): void {
		let param = {};
		param['CTG_CD'] = this.data.CTG_CD;
		param['RGEP_NM'] = this.RGEP_NM;
    param['RGEP_DATA'] = this.RGEP_DATA;
    param['RGEP_CNTE'] = this.RGEP_CNTE;
    if( this.data.MODE == 'edit' ) {
      param['RGEP_CD'] = this.data.RGEP_CD;
      this._service.updateRegexps(param).subscribe(res =>{
        if( res.result == "failed") {
          notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        } else {
          notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
          this.activeModal.close(param);
        }
      })
    } else {
      this._service.insertRegexps(param).subscribe(res =>{
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
