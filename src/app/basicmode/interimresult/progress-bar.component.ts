import { NgModule, Component, enableProdMode, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

import { StoreService } from '../store/store.service';
import { DashboardState } from 'app/basicmode/dashboard.state';
import { StompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { HandleError } from '../../modal/handle-error.component';

import { DxChartModule, DxChartComponent } from 'devextreme-angular';

// import { Data } from './progress-bar.service';
import { ResultService } from './interim-result.service';
// import { FinalResultService } from '../final/final-result.service';

@Component({
    selector: 'progress-bar',
    templateUrl: './progress-bar.component.html'
})
export class ProgressBar {
    @Input() seqCode: any;
    @ViewChild('progBar') dxChart: DxChartComponent;

    dataSource: any[];

    jobData: any[] = [];
    monthGroup: any;
    countGroup: any[] = [];

    rate: any;

    stfNo = sessionStorage.getItem('stfNo');
    urlCount = this._state.resultCount;

    initRun: boolean = false;
    onError: boolean = false;

    constructor(
        private _modal: NgbModal,
        private _stomp: StompService,
        private _service: ResultService,
        private _detective: ChangeDetectorRef,
        private _state: DashboardState,
        private _store: StoreService
    ) {
    }

    customizeTooltip = (args: any) => {
        return {
            html: "<strong>" + args.argument + "</strong> : " + args.value
        };
    }

    ngOnInit() {
        console.log('phase 01');
        if (this._store.exProgress) {
            console.log('phase 02');
            setTimeout(() => this.onProgress(this._store.exProgress, true), 1000);
        } else {
            console.log('phase 03');
            this.initRun = false;
            this._store.socketData$.subscribe(res => {
                console.log('phase 04');
                this.onProgress(JSON.parse(res), false);
            });
        }
    }

    ngOnDestroy(): void {
        this.initRun = false;
        this.onError = false;
    } 

    onProgress(data: any, reload: boolean) {
        const serverMessage = data.SERVER_MESSAGE; // 서버 메세지 (ACTIVE || ALIVE || DISCONNECT)
        let workIndex;

        // 현재 실행한 잡의 인덱스를 저장
        if (data.WORK_HISTORY) {
            const history = Object.getOwnPropertyNames(data.WORK_HISTORY);
            workIndex = history[history.length - 1];
            this._service.setWorkIndex = history[history.length - 1];
            sessionStorage.setItem('workIndex', history[history.length - 1]);
        }

        // 잡 에러 발생시
        const idx = sessionStorage.getItem('workIndex');
        const err = data.WORK_HISTORY[idx].ERROR_LIST;
        console.log('[ERROR]', idx, err);
        if (err && err.length) {
            this.jobError(err[err.length - 1]);
        }

        if (serverMessage === 'ACTIVE') {
            const workList = data.WORK_LIST;

            if (workList.length > 0) {
                this.initRun = true;

                const work = workList[0];

                let tskIdx = null; // task 인덱스 반환받을 변수 선언
                const tskLen = Object.keys(work.taskStatusList).length; // task 갯수 반환

                for (let i = 0; i < tskLen; i++) {
                    this._service.jobCategory[i] = work.taskStatusList[i].categoryType;

                    if (work.taskStatusList[i].categoryType === this.seqCode) { // 해당 항목 코드의 인덱스를 반환
                        tskIdx = i;
                    }
                }

                if (tskIdx !== null) {
                    this.monthGroup = Object.keys(work.taskStatusList[tskIdx].resultMap); // 현재 불러온 월 데이터를 저장

                    const monLen = this.monthGroup.length; // 현재 불러온 월 데이터의 길이를 반환

                    let stIdx = 0;
                    let start = false;

                    let edIdx = 0;
                    let end = false;

                    for (let i = 0; i < monLen; i++) {
                        this.countGroup[i] = work.taskStatusList[tskIdx].resultMap[this.monthGroup[i]];

                        if (this.countGroup[i] !== '0') {
                            stIdx = i;
                            break;
                        }
                    }

                    for (let i = stIdx; i < monLen; i++) {

                        if ( start === false && work.taskStatusList[tskIdx].resultMap[this.monthGroup[i]] !== '0') {
                            start = true;
                        }

                        if (work.taskStatusList[tskIdx].resultMap[this.monthGroup[i]] !== '0') {
                            end = true;
                            edIdx = i + 1;
                        } else {
                            end = false;
                        }

                        if (start) {
                            this.jobData[i] = {
                                month: this.monthGroup[i],
                                count: Number(work.taskStatusList[tskIdx].resultMap[this.monthGroup[i]])
                            };
                        }
                    }

                    this.rate = work.taskStatusList[tskIdx].rate;

                    if (this.rate > 0 && this.rate < 100) {
                        this._service.setCurrentSeq(this.seqCode);
                    }

                    if (this.rate === 100) {
                        this._store.exProgress = data;
                    } else {
                        this._store.exProgress = null;
                    }

                    if (this.dataSource !== this.jobData.slice(stIdx, edIdx)) {
                            this.dataSource = this.jobData.slice(stIdx, edIdx);
                    }

                    if (work.taskStatusList[tskIdx].finished === true || work.taskStatusList[tskIdx].rate === 100) {
                        if (this._service.setData[this.seqCode] === false) {
                            this._service.getCountResult(this.urlCount[this.seqCode]).subscribe(res => {
                                this._service.setTotalCount(res.result_root.interimResultCount, this.seqCode);
                            });

                            this._service.setOnLine(this.seqCode);
                            this._service.setData[this.seqCode] = true;
                        }
                    }
                }
            }
            if (!this._detective['destroyed']) {
                this._detective.detectChanges();
            }

        } else if (serverMessage === 'ALIVE' && this.initRun === false ) {
            console.log('JOB 실행 대기중입니다.');
        }

        if (serverMessage === 'DISCONNECT'
            || (serverMessage === 'ALIVE' && this.initRun === true) || reload) { // DISCONNECT를 수신하면 구독 해지함

            // Job이 정상적으로 완료되었을 경우 Rate에 100을 할당함
            this.rate = 100;

            if (this._service.setData[this.seqCode] === false) {
                this._service.getCountResult(this.urlCount[this.seqCode]).subscribe(res => {
                    this._service.setTotalCount(res.result_root.interimResultCount, this.seqCode);
                });

                this._service.setOnLine(this.seqCode);
                this._service.setData[this.seqCode] = true;
            }

            if (this._service.setData['patient'] === false) {
                // 중간 결과 환자명단 성별/나이대별 데이터 및 카운트 불러오기
                // console.log('카운트 불러오기',this.urlCount[this.seqCode]);
                this._service.getCountResult(this.urlCount['patient']).subscribe(res => {
                    // 카운트 불러오기
                    this._service.setTotalCount(res.result_root.interimResultCount, 'patient');

                    // Patient List Count 세션에 저장하기
                    sessionStorage.setItem('ptCount', res.result_root.interimResultCount.patientsCount);

                    // 성별/나이대별 데이터 불러오기
                    const jsonData = res.result_root.patientsResultCountByAge;
                    const arrData = Object.keys(jsonData).map(function(k) {
                        return jsonData[k];
                    });

                    this._service.setCountByAge(arrData);
                });

                this._service.setData['patient'] = true;
            }

            this._service.setCurrentSeq('patient');
            this._service.setJobCompleted(true);
        }
    }

    // 잡 에러 모달 실행
    jobError(msg: string): void {
        if (this.onError === false) {
            this.onError = true;

            this._service.cancelJob().subscribe();

            const modalRef = this._modal.open(HandleError);
            modalRef.componentInstance.data = msg;
        }
    }
}

