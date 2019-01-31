import { Component, OnInit, Output,Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { DashboardFunc } from '../dashboard.func';
import { StoreService } from '../store/store.service';
import { ScenarioService } from '../scenario/scenario.service';
import { ConvertStoreService } from './convert.powermode.service';
import { AppService } from '../../app.service';
import notify from 'devextreme/ui/notify';

import { ConvertModal } from '../../modal/convert-modal.component';

@Component({
 	selector: 'toolbar-layout',
      templateUrl: './toolbar.component.html',
      providers: [ ScenarioService, ConvertStoreService ]
})
export class ToolbarComponent implements OnInit {
    @Input('isMenuCollapsed') isMenuCollapsed: boolean;
    @Output() toggle = new EventEmitter();
    @Output() router = new EventEmitter();

    // storeVo: any;
    isCondition: boolean = true;
    // isCaseDesign: boolean = true;
    isUploadY: boolean = false;
    isEnableAddItem: boolean = true;
    isEnableInterim: boolean = true;
    isScenario: boolean = false;
    headLine: string;
    headLineOld: string;
    focusInput: boolean = false;

    patientListLink: string = '/tempAuth.do/basicmode/result/interim';

	constructor(
        private _router: Router,
        private _globals: AppState,
        private _func: DashboardFunc,
        private _modalService: NgbModal,
        private _store: StoreService,
        private _scenario: ScenarioService,
        private _service: ConvertStoreService,
        private _appService: AppService,
        private _translate: TranslateService
    ) {

    }
    // 생성자 함수(constructor) 후 실행. 다른 함수가 실행되기 전에 먼저 실행됨.
    ngOnInit() {
        const store = this._store.store;

        // 현재 위치 구독하기
        this._func.curUrl$.subscribe(res => {
            console.log(res);
            if(res === 'condition') {
                this.isCondition = true;
            } else {
                this.isCondition = false;
            }
            
            if(res === 'scenario') {
                this.isScenario = true;
            } else {
                this.isScenario = false;
            }            
        });

        this._func.createPatient$.subscribe(res => {
            this.isEnableAddItem = res;
            if (this._store.store.basicStore['uploadYn']) {
                // this.isCaseDesign = res;
                this.isUploadY = true;
                this.patientListLink = '/tempAuth.do/basicmode/result/interim/patient';
            } else {
                this.isUploadY = res;
                this.patientListLink = '/tempAuth.do/basicmode/result/interim';
            }
        });

        this._func.runQuery$.subscribe(res => {
            if (res) {
                this.isEnableInterim = false;
                this.isUploadY = true;
            } else {
                this.isEnableInterim = true;
                this.isUploadY = false;
            }
        });

		if(store) {
            this.headLine = store.basicStore.queryFlowNm;
            this.headLineOld = store.basicStore.queryFlowNm;
        }
        // 스토어 불러오기
		this._store.storeVo$.subscribe(res => {
            this.headLine = res.basicStore.queryFlowNm;
            this.headLineOld = res.basicStore.queryFlowNm;
		});
    }
    toggleMenu() {
        this.toggle.emit();
    }
    inputFocus(event: MouseEvent, seq: string): void {
        if(seq === 'focus') {
            this.focusInput = true;
        } else {
            this.focusInput = false;
            if(this.headLine !== this.headLineOld) {
                this.changeHeadline(this.headLine);
            }
        }
    }
    // 제목 변경
    changeHeadline(event): void {
        this._store.shareBasicDefault({queryFlowNm: event});
        setTimeout(() => {
            const scNm = this._store.store.basicStore.queryFlowNm;
            const scId = this._store.store.basicStore.queryFlowId;
            this._scenario.editQuery(scId, scNm).subscribe(res => {});
        }, 10);
    }
    // 파워모드 변환
    transferPowermode() {
        const store = this._store.store.basicStore.select;

        if(store) { 
            this._service.convertPowermode().subscribe(res => {
                if(res) {
                    this._appService.setSwitchStore(res);
                    // sessionStorage.setItem('currentUrl', "/tempAuth.do/powermode/paper");
					this._router.navigateByUrl("/tempAuth.do/powermode/paper", { skipLocationChange: true }); 
                } else {
                    notify(this._translate.instant('renewal2017.p.convert-fail'), "error", 2000);
                }
            });
        } else {
            this._router.navigateByUrl("/tempAuth.do/powermode/paper", { skipLocationChange: true });
        }
    }

    openTransModal() {
        const modalRef = this._modalService.open(ConvertModal);
        
        modalRef.componentInstance.data = {
            title: this._translate.instant('renewal2017.title.go-home'),
            content: this._translate.instant('renewal2017.p.home-alert')
        };
        modalRef.result.then((result) => {
            if(result === 'Confirm') {
                this.transferPowermode();
            }
        }, (reason) => {
            // this.closeResult = `Dismissed ${reason}`;
        });          
    }
}