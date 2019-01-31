import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { CohortManageService } from '../../cohort-manage.service';
import CustomStore from "devextreme/data/custom_store";
import {DxDataGridComponent} from "devextreme-angular";
import {ConfirmModal} from "../../../modal/confirm-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AppService} from "../../../../app.service";
import {TranslateService} from "@ngx-translate/core";

declare const $: any;

@Component({
 	selector: 'data-properties',
	templateUrl: './data-properties.component.html'
})

export class DataPropertiesComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
	dataSource: any;
  totalStr: string = '0';
  total: number = 0;
  sizePerSizeStr: string = '0';

  sourceDataSql: string = '';
  tblSfx = '';

  trans: any = {
    saved: null,
    save: null,
    sourceDataInitial: null,
    failed: null,
    delete: null,
  };
  txt: any = {
    saved: 'cohort.saved',
    save: 'cohort.save',
    sourceDataInitial: 'cohort.mart.sourcedata-initial',
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
    this._cohortManageService.selectedSourceDataId$.subscribe(res => {
      this.sourceDataSql = this._cohortManageService.getSourceDataSql();
      this.tblSfx = '( ' + this._cohortManageService.getTableSfx() + ' )';
      this.loadData();
    });
    this._cohortManageService.selectedMartId$.subscribe(res => {
      this.sourceDataSql = '';
      this.clearView();
    });
    this._cohortManageService.tabRefresh$.subscribe(res => {
      this.sourceDataSql = '';
      this.clearView();
    });
	}

  ngOnInit() {
	}

	clearView() {
    this.dataSource = {};
    this.totalStr = '0';
    this.total = 0;
    this.sizePerSizeStr = '0';
    this.dataSource.store = new CustomStore({
      load: (loadOptions: any) => {
        return new Promise((resolve, reject) => {
          this.sizePerSizeStr = '0';
          this.totalStr = '0';
          this.total = 0;
          resolve([{DATA:''}]);
        });
      }
    });
  }

  initValue() {
    this.dataSource = {};
    this.dataSource.store = new CustomStore({
      load: (loadOptions: any) => {
        return new Promise((resolve, reject) => {
          this._cohortManageService.loadSourceData( loadOptions.skip, loadOptions.take, this.sourceDataSql ).subscribe((res) => {
            this.sizePerSizeStr =  this.addComma(( loadOptions.skip + res.data.length ).toString());
            resolve( res.data );
          }, (error) => {
            reject(error);
          });
        })
      }
    });
  }


  loadData() {
    this.clearView();
    if( this.sourceDataSql==null || this.sourceDataSql == '' || this.sourceDataSql.length <= 0 ) {
      return;
    }
    this._cohortManageService.countSourceData(this.sourceDataSql).subscribe(res => {
      this.totalStr = this.addComma(res.total);
      this.total = parseInt(res.total);
      this.initValue();
    });
  }

  sourceDataInitialize() {
    const modalRef = this._modalService.open(ConfirmModal);
    modalRef.componentInstance.data = this.trans['sourceDataInitial'];
    modalRef.result.then((result) => {
      if (result === 'Confirm') {
        this._cohortManageService.sourceDataInitialize(this.sourceDataSql).subscribe(res => {
          this.loadData();
        });
      }
    }, (reason) => {
      console.log(`Dismissed ${reason}`);
    });
  }

  sqlSave() {
  }

  addComma(nm) {
    return nm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

}
