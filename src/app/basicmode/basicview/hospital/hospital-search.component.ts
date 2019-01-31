import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { IMultiSelectOption, IMultiSelectTexts,IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import { TranslateService } from '@ngx-translate/core';

import { StoreService } from '../../store/store.service';
import { HospitalService } from './hospital.service';
import { DashboardService } from '../../dashboard.service';
import { DashboardState } from '../../dashboard.state';
import { AppService } from '../../../app.service';

import * as Model from '../../model/dashboard.model';
import * as StoreModel from '../../store/store.model';
import { AppState } from '../../../app.state';

@Component({
 	selector: 'hospital-search',
    templateUrl: './hospital-search.component.html',
    providers: [ HospitalService ]
})

export class HospitalSearchComponent implements OnInit {

    hospitalForm: FormGroup;
    dataSource: Model.HospitalList[] = [];
    basicStore: StoreModel.SetBasic;

    refreshMode: boolean = false;

    optionsModel: any[] = [];
    myOptions: any[] = [];
    mySettings: IMultiSelectSettings = {
        enableSearch: false,
        buttonClasses: 'btn btn-light',
		selectAddedValues: true,
		dynamicTitleMaxItems: 6
    };

    myTexts: IMultiSelectTexts  = {
        checkAll: this._app.trans.checkAll, //전체
        uncheckAll: this._app.trans.uncheckAll, //선택해제
        checked: 'item selected',
        checkedPlural: this._app.trans.checkedPlural, //개 선택
        searchPlaceholder: 'Find',
        searchEmptyResult: this._app.trans.searchEmptyResult, 
        searchNoRenderText: this._app.trans.searchNoRenderText,
        defaultTitle: this._app.trans.checkAll, //전체
        allSelected: this._app.trans.allSelected, //전체 선택',
    };

    constructor(
        private _fb: FormBuilder,
        private _app: AppState,
        private _dashboard: DashboardService,
        private _service: HospitalService,
        private _router: Router,
        private _store: StoreService,
        private _state: DashboardState,
        private _translate: TranslateService,
        private _appService: AppService
	) {
        this._service.list().subscribe(res => {
            for(let data of res) {
                this.myOptions.push({
                    id: data.hspTpCd,
                    name: data.hspTpNm
                });
            }
        });        
    }
	ngOnInit() {
		const store = this._store.store;
		const storage = store.hospitalStore;
        sessionStorage.setItem('currentUrl', this._router.url);
 
		this.hospitalForm = this._fb.group({
			'optionsModel': ['']
		});		

        this._store.deleteVo$.subscribe(res => {
            this.refreshMode = true;
			if(res === this._state.code[this._service.secCode].storage) {
				this._service.list().subscribe(res => {
                    const clone = res.slice(0);
                    for (let data of clone) {
                        let control: FormControl = new FormControl('', Validators.required);
                        this.hospitalForm.addControl(data.hspTpCd, control);
                        data.isChecked = true;
                    }
                    setTimeout(() => { this.refreshMode = false; }, 200);
                });
			}
		});

        this._store.storeVo$.subscribe(res => {
            this.basicStore = res.basicStore;
        });
        if(storage) {
            this.loadData(storage);
        }
    }
    loadData(storage: any): void {
		const list = storage.select1.replace(/'/g, '');
		const arr = list.split(',');

		this.optionsModel = arr;
    }
    // 선택 변경
    onChange() {
		if(this.optionsModel.length) {
			this._store.shareHospital({
				select1: this.optionsModel.join(',')
            });
            this.basicStore.hspTpCd = this.optionsModel.join(',');
			this._store.shareBasicDefault(this.basicStore);
		}		 
    }
}