import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';

import { MedicalService } from './medical.service';
import { StoreService } from '../../store/store.service';
import { DashboardState } from '../../dashboard.state';
import { DashboardFunc } from '../../dashboard.func';

@Component({
 	selector: 'medical-search',
    templateUrl: './medical-search.component.html',
    providers: [ MedicalService ]
})

export class MedicalSearchComponent implements OnInit {
    @Input('activeTab') activeTab: string;
    isFilter: boolean = false;

    constructor(
        private _service: MedicalService,
        private _router: Router,
        private _store: StoreService,
        private _state: DashboardState,
        private _func: DashboardFunc
	) {
        this._service.list().subscribe(res => {

        });
    }
	ngOnInit() {
        sessionStorage.setItem('currentUrl', this._router.url);
        const url = this._router.url.split('/');
        const location = url[url.length - 1];

        if(location === 'additem') {
            this.isFilter = true;
        } else {
            this.isFilter = false;
        }
        
        // 스토어 삭제여부 구독
        this._store.deleteVo$.subscribe(res => {
            console.log('스토어 삭제');
			if(res === this._state.code[this._service.secCode].storage) {
				this._service.list().subscribe(res => {
				});
			}
        });

        // 병원선택 변경 여부 구독
        this._store.hospitalVo$.subscribe(res => {
            console.log('병원선택 변경');
            this._service.list().subscribe(res => {
            });
        });
    }
}