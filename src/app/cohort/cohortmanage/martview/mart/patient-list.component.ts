import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { DxDataGridComponent } from "devextreme-angular";
import { CohortManageService } from '../../cohort-manage.service';
import { UploadPatientsDialogComponent } from "./upload-patients-dialog.component";

import { ConfirmModal } from "../../../modal/confirm-modal.component";
import { AppService } from "../../../../app.service";
import { TranslateService } from "@ngx-translate/core";

import CustomStore from "devextreme/data/custom_store";

declare const $: any;

@Component({
 	selector: 'patient-list',
	templateUrl: './patient-list.component.html'
})

export class PatientListComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  dataSource: any = {};
  totalStr: string = '0';
  total: number = 0;
  sizePerSizeStr: string = '0';
  loading: boolean = false;

  trans: any = {
    saved: null,
    save: null,
    patientInitial: null,
    failed: null,
    delete: null,
  };
  txt: any = {
    saved: 'cohort.saved',
    save: 'cohort.save',
    patientInitial: 'cohort.mart.patient-initial',
    failed: 'cohort.failed',
    delete: 'cohort.mart.table.column.delete'
  };

  constructor(
    private _cohortManageService: CohortManageService,
    private _modalService: NgbModal,
    private _translate: TranslateService,
    private _appService: AppService,
  ) {
    this.dataSource = {};
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
	  var h = $(window).height() - 150;
//	  $('.patientDiv').height("calc(100% - 160px)");
    $('.patientDiv').height(h);
    this.dataGrid.height = "calc(100% - 160px)";
    this._cohortManageService.selectedMartId$.subscribe(res => {
      this.initialize();
    })
    this._cohortManageService.martRefresh$.subscribe(res => {
      this.initialize();
    });
	}

	initialize() {
    this.dataSource = {};
    this.dataSource.store = new CustomStore({
      load: (loadOptions: any) => {
        return new Promise((resolve, reject) => {
          this.sizePerSizeStr = '0';
          this.totalStr = '0';
          this.total = 0;
          resolve(null);
        });
      }
    });
  }

  loadData(){
    var h = $(window).height() - 150;
    $('.patientDiv').height(h);
    this.countOriginalPatient();
  }

  initValue() {
    this.dataSource = {};
    this.dataSource.store = new CustomStore({
      load: (loadOptions: any) => {
        return new Promise((resolve, reject) => {
          this._cohortManageService.loadOriginalPatient( loadOptions.skip, loadOptions.take ).subscribe((res) => {
            this.sizePerSizeStr =  this.addComma(( loadOptions.skip + res.data.length ).toString());
            resolve( res.data );
          }, (error) => {
            reject(error);
          });
        })
      }
    });
  }


  countOriginalPatient() {
    this._cohortManageService.countOriginalPatient().subscribe(res => {
      this.dataGrid.height = "calc(100% - 160px)";
      this.dataSource = {};
      this.sizePerSizeStr  = '0';
      this.dataGrid.applyOptions();

      this.totalStr = this.addComma(res.data);
      this.total = parseInt(res.data);
      this.initValue();
    });
  }

  initialPaient() {
    const modalRef = this._modalService.open(ConfirmModal);
    modalRef.componentInstance.data = this.trans['patientInitial'];
    modalRef.result.then((result) => {
      if (result === 'Confirm') {
        this._cohortManageService.initialPatient().subscribe(res => {
          if( res.result == 'success' ) {
            this.countOriginalPatient();
          }
        });
      }
    }, (reason) => {
      console.log(`Dismissed ${reason}`);
    });
  }

  onContentReady(e) {
    e.component.option("loadPanel.enabled", false);
  }

  onToolbarPreparing(e) {
    e.toolbarOptions.height = 6;
  }
  addComma(nm) {
    return nm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  initialPaientExcel() {
    const modalRef = this._modalService.open(UploadPatientsDialogComponent,{
      size: 'lg'
    });
    modalRef.componentInstance.data = {
      title: '',
      content: '',
      CHT_ID: this._cohortManageService.getSelectedCohort().CHT_ID,
      CHT_SFX: this._cohortManageService.getSelectedCohort().CHT_SFX,
      MODE: 'add'
    };
    modalRef.result.then((result) => {
      if (result !== 'no') {

        this.countOriginalPatient();
      }
    }, (reason) => {
//      console.log(`Dismissed ${reason}`);
    });

 /*
	const modalRef = this._modalService.open(UploadPatientsModal, {
  size: 'lg'
    });
    modalRef.componentInstance.data = 'powermode';
    modalRef.result.then((result) => {
      if (result && result !== 'no') {
        // console.log(result);
        const store = this._store.store;

        store.basicStore['uploadYn'] = 'Y';
        store.basicStore.select = 'upload';
        store.basicStore.condition = 'and';

        this._store.setStore = store;
        this._store.shareStore();

        this.workIndex = result.workIndex;

        this.uploadQuery(result.workIndex);

        // this.runQueryAct(null, 'upload');
        // this._router.navigateByUrl('/tempAuth.do/powermode/result/interim/patient', { skipLocationChange: true });
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${reason}`;
    });

    */



  }
}
