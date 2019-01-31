import { Component, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../../app.service';
import { AppState } from '../../../../app.state';
import { DxFileUploaderComponent } from 'devextreme-angular';
import {NgForm} from "@angular/forms";
import notify from "devextreme/ui/notify";



@Component({
    selector: 'upload-patients-dialog',
    templateUrl: './upload-patients-dialog.component.html',
    providers: [
        AppService,
    ]
})

export class  UploadPatientsDialogComponent implements OnInit {
  @Input() data: { title: string; content: string; CHT_ID: string; CHT_SFX: string; MODE: string; };
    @ViewChild(DxFileUploaderComponent) fileUploader: DxFileUploaderComponent;
  @ViewChild('frm') frm: NgForm;
    appurl: string;
    uploadUrl: string;

    isUploaded: boolean = false;

    uploadPatientsResponse: {length: number; response: string;};

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
        public activeModal: NgbActiveModal,
        private _modalService: NgbModal,
        private _app: AppState,
        private _translate: TranslateService,
        private _appService: AppService,
    ) {
      this.appurl = this._app.ajaxUrl;
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
        // 언어 변경
      this._translate.use(this._appService.langInfo);
      this._appService.language$.subscribe(res => {
              this._translate.use(res);
              setTimeout(() => {
          window.location.reload();
              }, 100);

      });
      this.uploadUrl = `${this.appurl}cohortPatientsUpload.json?CHT_SFX=` + this.data.CHT_SFX;
    }

    clickSaveBtn() {
//      this.frm.submit();
//      activeModal.close(uploadPatientsResponse)
    }

    getStatus(e) {
      const response = JSON.parse(e.request.response);
      this.uploadPatientsResponse = {
          length: response.totalLength,
          response: response.uploadPatients
      }

      if ( response.reuslt == "failed") {
        notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
      } else {
        notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
        this.activeModal.close('ok');
      }
/*

        setTimeout(() => {
          if( response.reuslt == 'success' ) {
            console.log('success');
            this.activeModal.close('ok')
          } else {
            console.log('oppppps')
          }
        }, 1000);
*/
    }
}
