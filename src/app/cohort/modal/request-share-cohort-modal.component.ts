import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'request-share-cohort-modal',
	templateUrl: './request-share-cohort-modal.component.html',
	providers: [
	]
})

export class RequestShareCohortModal implements OnInit, AfterViewInit {
  requestShareCohortForm: FormGroup = new FormGroup({});
  @ViewChild('reasonCnte') reasonCnteElement: ElementRef;
  @Input() data: {title: string; content: string};
	reasonCnte: string;
  anonymous: string = 'Y';
  editAuthority: string = 'N';
  downloadAuthority: string = 'N';

	loading: boolean = true;
	constructor(
		private _fb: FormBuilder,
		public activeModal: NgbActiveModal,
	) {
    this.requestShareCohortForm = this._fb.group({
      'reasonCnte': ['', Validators.compose([Validators.required])],
      'anonymous': ['', Validators.compose([Validators.required])]
    });
	}

  ngAfterViewInit() {
//    this.reasonCnteElement.nativeElement.focus();
  }


	ngOnInit() {
	}


  onContentReady(e) {
    e.component.option("loadPanel.enabled", false);
  }

  anonymousClicked(e) {
    this.anonymous = e.target.value;
  }

  changedEditAuthority(e) {
	  if( e.target.checked )
      this.editAuthority = 'Y';
	  else
	    this.editAuthority = 'N';
  }

  changedDownloadAuthority(e) {
    if( e.target.checked )
      this.downloadAuthority = 'Y';
    else
      this.downloadAuthority = 'N';
  }
  // 저장 버튼 클릭시
	submitForm(): void {
		let param = {};
		param['reasonCnte'] = this.reasonCnte;
		param['anonymous'] = this.anonymous;
    param['editAuthority'] = this.editAuthority;
    param['downloadAuthority'] = this.downloadAuthority;
		this.activeModal.close(param);
	}

	// Enter 키 입력 방지
	onKeyPress(event) {
		if (event.keyCode === 13) {
			return false;
		}
	}
}
