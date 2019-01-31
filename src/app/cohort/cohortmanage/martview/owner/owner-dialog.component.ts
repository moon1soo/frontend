import {Component, Input, OnInit} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CohortManageService } from "../../cohort-manage.service";
import { TranslateService } from "@ngx-translate/core";
import { AppService } from "../../../../app.service";
import notify from "devextreme/ui/notify";

@Component({
	selector: 'owner-dialog',
	templateUrl: './owner-dialog.component.html',
	providers: [
    CohortManageService
	]
})

export class OwnerDialogComponent implements OnInit {
  @Input() data: { title: string; content: string; CHT_ID: string; MODE: string; };
	ownerDialogForm: FormGroup = new FormGroup({});

	stfNos: string = '';
  selectedStaff: string = '';

	loading: boolean = true;
	dataSource: any;

	selectedRowsData: any;

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
    private _cohortManageService: CohortManageService,
    private _translate: TranslateService,
		public activeModal: NgbActiveModal,
  private _appService: AppService,
	) {
		this.ownerDialogForm = _fb.group({
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
		this._cohortManageService.loadApprovedStaff().subscribe(res => {
			this.dataSource = res['data'];
			setTimeout(() => { this.loading = false; }, 300);
		});
	}

	// 테이블 row 선택 이벤트
	onSelectionChanged(event) {
		this.selectedRowsData = event.selectedRowsData;
    this.stfNos = '';
    this.selectedStaff = '';
		for (let i = 0; i < this.selectedRowsData.length; i++) {
			this.stfNos += this.selectedRowsData[i]['DRSTFNO'];
      this.selectedStaff += ( this.selectedRowsData[i]['DRSTFNO'] + ' ' + this.selectedRowsData[i]['DRSTFNM'] );

			if (i !== this.selectedRowsData.length - 1) {
				this.stfNos += ',';
        this.selectedStaff += ', ';
			}
		}
	}

	onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
	}

	// 저장 버튼 클릭시
	submitForm(): void {
		// // this._store.store.basicStore['queryFlowNm'] = this.scenario.scNm;

		// // if (this.scenario.shareStfNo !== null && this.scenario.shareStfNo !== '') {
		// // 	this._store.store.basicStore['shareYn'] = 'Y';
		// // 	this._store.store.basicStore['shareStfNo'] = this.scenario.shareStfNo;
		// // } else {
		// // 	this._store.store.basicStore['shareYn'] = null;
		// // 	this._store.store.basicStore['shareStfNo'] = null;
		// // }

		// this._store.shareStore();
		// // 모달창을 닫고, 부모창으로 스토어 값 전송
		// this.activeModal.close(this._store.store);

		let param = {
			CHT_ID: this.data.CHT_ID,
      stfNos: null
		};
		if (this.stfNos !== null && this.stfNos !== '') {
			param['stfNos'] = this.stfNos;
      this._cohortManageService.addMartOwner(param).subscribe(res => {
        if ( res.data == "failed") {
          notify({message:this.trans['failed'],position:{my:'Top',at:'Top'}}, 'Error', 2000);
        } else {
          notify({message:this.trans['saved'],position:{my:'Top',at:'Top'}}, 'Success', 2000);
          this.activeModal.close(param);
        }
      });
		} else {
			param['stfNos'] = null;
		}
	}

	// Enter 키 입력 방지
	onKeyPress(event) {
		if (event.keyCode === 13) {
			return false;
		}
	}
}
