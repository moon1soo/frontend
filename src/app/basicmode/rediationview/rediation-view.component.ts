import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { AppState } from '../../app.state';
import { DashboardState } from '../dashboard.state';

import { AppService } from '../../app.service';
import { DashboardService } from '../dashboard.service';
import { StoreService } from '../store/store.service';
import { RediationService } from './rediation-search/rediation.service';
import { RediationRoomService } from './rediation-room/rediation-room.service';

interface rediationModel {
    yn: string;
}

interface rediationDateModel {
    testDtSt: string;
    testDtEd: string;
}

@Component({
    selector: 'rediation-view',
    templateUrl: './rediation-view.component.html',
    providers: [
        RediationService,
        RediationRoomService
    ]
})

export class RediationViewComponent implements OnInit {
    @ViewChild('tab') tab: any;

    seqCode: string = this._localService.secCode;

    rediationForm: FormGroup;
    rediationData: rediationModel = {
        yn: null
    };
    rediationPeriod: rediationDateModel = {
        testDtSt: null,
        testDtEd: null
    };

    storageDate: {
        fromDt: string;
        toDt: string;
    } = {
        fromDt: null,
        toDt: null
    };

    refreshMode = false;

    constructor(
        private _app: AppState,
        private _router: Router,
        private _service: DashboardService,
        private _store: StoreService,
        private _state: DashboardState,
        private _fb: FormBuilder,
        private _translate: TranslateService,
        private _appService: AppService,
        private _localService: RediationService
    ) {

    }

    ngOnInit() {
        sessionStorage.setItem('currentUrl', this._router.url);

        const store = this._store.store;
        const storage = store[this._state.code[this.seqCode].storage];

		// 언어 변경
        this._translate.use(this._appService.langInfo);
        this._appService.language$.subscribe(res => {
            this._translate.use(res);
            setTimeout(() => { window.location.reload(); }, 100);
        });

        // 하단 설명 변경
        this._translate.get('renewal2017.p.message-rediation').subscribe(res => {
            this._service.setMessage(res);
        });

        // 해당 스토어가 존재하면 날짜 로드
        if (storage) {
            this.storageDateLoad(storage);
        }

        this._store.deleteVo$.subscribe(res => {
            if (res === this._state.code[this._localService.secCode].storage) {
                this.tab.select('tab-rediation');
                this.refreshMode = true;

                this.rediationData = {
                    yn: null
                };

                this.storageDate = {
                    fromDt: null,
                    toDt: null
                };

                this.rediationPeriod = {
                    testDtSt: null,
                    testDtEd: null
                };

                this._localService.list().subscribe(res => {
                    setTimeout(() => { this.refreshMode = false; }, 200);
                });
            }
        });

        this.rediationForm = this._fb.group({
            'yn': [this.rediationData.yn]
        });

        setTimeout(() => {
            this.watchForm();
        }, 10);
    }

    // 날짜 로드
    storageDateLoad(storage: any): void {
        this.rediationPeriod.testDtSt = storage.testDtSt;
        this.rediationPeriod.testDtEd = storage.testDtEd;
        this.rediationData.yn = storage.yn;

        this.storageDate = {
            fromDt: this.rediationPeriod.testDtSt,
            toDt: this.rediationPeriod.testDtEd
        };
    }

	// 날짜 선택
    selectDate(event: { fromDt: string; toDt: string; }): void {
        this.rediationPeriod.testDtSt = event.fromDt;
        this.rediationPeriod.testDtEd = event.toDt;

        this.storageDate = {
            fromDt: this.rediationPeriod.testDtSt,
            toDt: this.rediationPeriod.testDtEd
        };

        this._service.addDate(this._localService.secCode,
            {
                testDtSt: event.fromDt,
                testDtEd: event.toDt
            }
        );
    }

    // 폼 변경 여부 관찰.
	watchForm(): void {
		this.rediationForm.valueChanges
			.debounceTime(100)
			.distinctUntilChanged()
			.subscribe(res => {
				if(!this.refreshMode) {
					for(let key of Object.keys(res)) {
                        let data;
						if(key === 'yn') {
							res[key] ? data = 'Y' : data = 'N';
							this._service.addDataString(this._localService.secCode, key, data);
						}
					}
				}
		});
	}
}
