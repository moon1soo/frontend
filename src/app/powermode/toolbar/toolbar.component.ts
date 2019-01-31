import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router'

import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AppState } from '../../app.state';
import { ResultService } from '../patientlist/result.service';
import { SqlPreviewModal } from '../../modal/sql-preview-modal.component';
import { DiagramService } from '../diagram.service';
import { PowermodeStoreService } from '../store/store.service';
import { SaveQueryModal } from '../../modal/save-query-modal.component';
import { ScenarioService } from '../scenario/scenario.service';

import { RefreshModal} from '../../modal/refresh-modal.component';
import { ScenarioListComponent } from '../scenario/scenario-list.component';
import { TranslateService } from '@ngx-translate/core';

import { ConfModal } from '../../modal/conf-modal.component';
import { AdminModal } from '../admin/admin-modal.component';
import { UploadPatientsModal } from '../../modal/upload-patients-modal.component';

import { IrbApprovalModal } from '../patientlist/irb-approval-modal.component';

@Component({
 	selector: 'toolbar-layout',
    templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {
    // @Output() runQuery = new EventEmitter();
    // @Output() clearPaper = new EventEmitter();
    // @Input('itemList') itemList: {dataSource: any; categoryGroup: string[]};
    // @Input('isUserEditing') isUserEditing: boolean;
    // @ViewChild('patientList') patientList: any;

    appurl: string;
    workMode: string = 'edit';

    storeVo: any;
    disableSql: boolean = true;
    disableFinal: boolean = true;
    closeResult: string;
    sqlTxt: string;
    isScenario: boolean = false;
    
    itemList: {dataSource: any; categoryGroup: string[]};
    workIndex: string;
    adminYn: boolean = false;

	constructor(
        private _globals: AppState,
        private _result: ResultService,
        private _modalService: NgbModal,
        private _service: DiagramService,
        private _store: PowermodeStoreService,
        private _router: Router,
        private _queryService: ScenarioService,
        private _translate: TranslateService,
        private _app: AppState
    ) {
        this.appurl = this._app.ajaxUrl;
    }
    ngOnInit() {
		// 환자명단 호출 완료 여부 구독
		this._result.finishJob$.subscribe(res => {
			if(res) {
				this.disableFinal = false;
			}
        });
        // 아이템 목록 구독하기
        this._service.itemList$.subscribe(res => {
            if(res) {
                this.itemList = res;
            }
        });
        
        // 현재 위치 구독하기
        this._service.curUrl$.subscribe(res => {
            if(res === 'scenario') {
                this.isScenario = true;
            } else {
                this.isScenario = false;
            }
        });

        // 작업단계 구독
        this._service.stateWork$.subscribe(res => {
            this.workMode = res.mode;
        });
        // Reset 여부 구독
        this._service.isReset$.subscribe(res => {
            if(res) {
                this.resetStore();
            }
        });
        // Run Query 
        this._service.runQuery$.subscribe(res => {
            if(res) {
                this.runQueryAct();
            }
        });

        if (sessionStorage.getItem('authCd') === 'A' || sessionStorage.getItem('authCd') === 'R') {
			this.adminYn = true;
		} else {
			this.adminYn = false;
		}
        // Run Final Result
        // this._service.runFinalResult$.subscribe(res => {
        //     if(res) {

        //     }
        // });
    }
    // 홈으로 이동
    goHome(): void {
        const modalRef = this._modalService.open(ConfModal);
        
		modalRef.componentInstance.data = {
            title: this._translate.instant('renewal2017.title.go-home'),
            content: this._translate.instant('renewal2017.p.home-alert'),
            seq: 'notice'
        };
		modalRef.result.then((result) => {
			if(result === 'Confirm') {                
                // this.clearPaper.emit();
                this._service.setPaperClear(true);
                this._store.resetStore('home'); // 스토어 리셋
                setTimeout(() => {
                    this._router.navigateByUrl("/tempAuth.do/gate", { skipLocationChange: true });
                }, 300);
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});   
        
    }
    
     // IRB Approvals 열기
	irbApprovals() {
		const modalRef = this._modalService.open(IrbApprovalModal, {
			size: 'lg'
		});
        modalRef.componentInstance.data = '';
        const irbForm = {
            stfNo: null,
            irbNo: null,
            irbMthd: null,
            itemList: null,
            ptListSql: null,
            irbCount: null,
            ptListCount: null,
        };

		this._result.getSQLResult().subscribe(res => {
			irbForm.ptListSql = res;
		});

		this._result.getCountResult().subscribe(res => {
            irbForm.ptListCount = res.interimResultCount.patientsCount;
        });

		modalRef.result.then((result) => {
			if (result !== 'cancel') {
                this._store.setStore = result;
                // console.log('IRB');
				this._store.shareStore();
				// this.activeExcel = true;
                
                const store = this._store.store;

				if (store.basicStore['irbMethod'] !== '4') {
					this._service.setOnMasking('UNCOVER');
				}
	
				irbForm.stfNo = store.basicStore.stfNo;
				irbForm.irbNo = store.basicStore.irbNo;
				irbForm.irbMthd = store.basicStore.irbMethod;
				irbForm.irbCount = store.basicStore.ptCnt;
                irbForm.itemList = store.basicStore.select;
                // console.log(irbForm);
	
				this._service.setIRBLog(irbForm).subscribe();
				
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});
	}
    
    // 쿼리 리스트 열기
    openQueryList(): void {
        const modalRef = this._modalService.open(ScenarioListComponent, {
            size: 'lg',
			windowClass: 'large-modal'
        });
        modalRef.componentInstance.data = '';
        modalRef.result.then((result) => {
        }, (reason) => {
            this.closeResult = `Dismissed ${reason}`;
        });
    }
    // 시나리오 저장
	saveScenario(): void {
        if(this._store.validateStore()) {
            const modalRef = this._modalService.open(SaveQueryModal); 
            let store = {};
            modalRef.result.then((result) => {
                if (result && result !== 'no') {
                    // 시나리오 저장 액션
                    store['queryFlowNm'] = result.queryFlowNm;
                    store['shareYn'] = result.shareYn;
                    store['shareStfNo'] = result.shareStfNo;
                    this._store.shareBasicDefault(store);
                    setTimeout(() => {
                        this._queryService.saveQuery(this._store.store).subscribe();
                    }, 10);				
                }
            }, (reason) => {
                this.closeResult = `Dismissed ${reason}`;
            });
        }                   
    }
    // saveScenarioAction(): void {
    //     const modalRef = this._modalService.open(SaveQueryModal); 
    //     let store = {};
	// 	modalRef.result.then((result) => {
	// 		if (result && result !== 'no') {
    //             // 시나리오 저장 액션
    //             store['queryFlowNm'] = result.queryFlowNm;
    //             store['shareYn'] = result.shareYn;
    //             store['shareStfNo'] = result.shareStfNo;
    //             this._store.shareBasicDefault(store);
    //             setTimeout(() => {
    //                 this._queryService.saveQuery(this._store.store).subscribe();
    //             }, 10);				
	// 		}
	// 	}, (reason) => {
	// 		this.closeResult = `Dismissed ${reason}`;
	// 	});
    // }
    // Output Item 모드로 전환
    viewOutputMode(): void {
        this._service.setStateWork({mode: 'output'});
    }

    // 최종결과 테이블 보기
	// viewResultTable(): void {
    //     this._service.startFinalQuery(true);
	// 	// this.openModal(this._store.store);	
	// }

   
    // 리셋 스토어
    resetStore(): void {
        const modalRef = this._modalService.open(RefreshModal);
        
		modalRef.componentInstance.data = '';
		modalRef.result.then((result) => {
			if(result === 'yes') {
				// this._service.cancelJob().subscribe(); // Job 취소
				this._store.resetStore('reset'); // 스토어 리셋
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});	
    }
     // New Query
	newQuery(seq: string): void {
        if(!this.isScenario) {
            this.resetStore();
        } else {
            this._store.resetStore(seq);
        }
    }

    // Admin 열기
    openAdmin(): void {
        const modalRef = this._modalService.open(AdminModal, {
            size: 'lg',
			windowClass: 'large-modal'
        });
        
		modalRef.componentInstance.data = '';
		modalRef.result.then((result) => {
			if(result === 'yes') {
				// this._service.cancelJob().subscribe(); // Job 취소
				this._store.resetStore('reset'); // 스토어 리셋
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});	
    }    

    // Upload Patients
	uploadPatients(): void {
        const setBasic: any = {
			age1: null,
            age2: null,
            ageTpCd: 'Y',
            condition: null,
            gender: 'A',
            hspTpCd: null,
            irbNo: '',
			irbMethod: '4',
            lclTpCd: 'L1',
            rschRprvId: 'CRI',
            pactTpCd: 'A',
            period1: null,
            period2: null,
            ptTpNm: null,
            ptBrdyDtEd: null,
            ptBrdyDtSt: null,
            queryFlowNm : "New Scenario",
            select: null,
            shareStfNo: null,
            shareYn: null,
            stfNo: sessionStorage.getItem('stfNo')
		};
		
		this._store.setStore = {
            'basicStore': setBasic,
            'groupInfoListStore': []
        }
		this._store.shareStore();

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
    }

    // 페이지 이동
    runQueryAct() {
        this._service.setStateWork({mode: 'patient'});
	}
    // 에디트 모드로 전환
    transferEdit(): void {  
        this._result.cancelJob().subscribe(res => {
            console.log(res);
            this._service.setStateWork({ mode : 'edit' });
        });
    }

    // 엑셀 업로드 후 쿼리 실행
    uploadQuery(workIndex: string) {
        this._service.setStateWork({ mode : 'patient' });
        // this.isRunQuery = true;        
        this._result.getCountResult().subscribe(res => {});
        this._result.getQueryResult(workIndex).subscribe(res => {

        }); 
    }

    help(): void {
		const win = window;
		win.open(this.appurl + 'help.do', 'Bestcare Help', 'width=1200, height=960, location=no, menubar=no, status=no, toolbar=no');
	}
}