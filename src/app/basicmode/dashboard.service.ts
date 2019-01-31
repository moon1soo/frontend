import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs/Subject';
import { AppState } from '..//app.state';
import { HandleError } from '../modal/handle-error.component';
import { StoreService } from './store/store.service';
import { DashboardState } from './dashboard.state';
import { DashboardFunc } from './dashboard.func';
import { ItemListState } from '../item-list.state';
import { TranslateService } from '@ngx-translate/core';

import * as Model from './model/dashboard.model';
import * as StoreModel from './store/store.model';
import notify from "devextreme/ui/notify";
import * as _ from 'lodash';

@Injectable()
export class DashboardService {
	curLocation: string = 'condition';
	storeVo: any;
	dataset: {server: any[]; client: any, filter: string[]; condition: string[]; name: string[]; [props: string]: any;} = {
		server: [],
		client:[[]],
		filter: [],
		condition: [],
		name: []
	};
	sortTable: string;

	stringStorage: string[] = ['partiSur'];

	private requestComplete = new Subject<any[]>();

	private message = new Subject<string>();
	private activeTab = new Subject<number>();
	private addGrid = new Subject<boolean>();
	// private removeGrid = new Subject<any>();
	// private queryResult = new Subject<any>();

	private hospitalStore = new Subject<any>();
	private medicalStore = new Subject<any>();
	private doctorStore = new Subject<any>();
	private diagnosisStore = new Subject<any>();
	private orderStore = new Subject<any>();
	private feeStore = new Subject<any>();
	private examStore = new Subject<any>();
	private examResultStore = new Subject<any>();
	private pathologyStore = new Subject<any>();
	private pathologyAutoCompleteStore = new Subject<any>();
	private examDetailStore = new Subject<any>();
	private ccStore = new Subject<any>();
	private formStore = new Subject<any>();
	private formDetailStore = new Subject<any>();
	private medicineStore = new Subject<any>();
	private surgicalStore = new Subject<any>(); //수술
	private diagMedicalStore = new Subject<any>();
	private surDiagStore = new Subject<any>();
	private surgicalMedicalStore = new Subject<any>();
	private surDoctorStore = new Subject<any>();
	private partiSurStore = new Subject<any>();
	private partiAnesthStore = new Subject<any>();
	private nursDeptStore = new Subject<any[]>();
	private nursCircumStore = new Subject<any>();
	private nursDiagStore = new Subject<any>();
	private nursPlanStore = new Subject<any>();
	private nursStateStore = new Subject<any>();
	private nursStateEavStore = new Subject<any>();
	private nursEavStore = new Subject<any>();
	private nursEavItemsStore = new Subject<any>();
	private nursAssessmentStore = new Subject<any>();
	private concernPatientStore = new Subject<any>();
	private rediationTreatmentStore = new Subject<any>();
	private rediationTherapyRoomStore = new Subject<any>();
	private rediationTherapyRegionStore = new Subject<any>();
	private rediationDoctorStore = new Subject<any>();

  	requestComplete$ = this.requestComplete.asObservable();
	message$ = this.message.asObservable();
	activeTab$ = this.activeTab.asObservable();
	addGrid$ = this.addGrid.asObservable();
	// removeGrid$ = this.removeGrid.asObservable();
	// queryResult$ = this.queryResult.asObservable();

	hospitalStore$ = this.hospitalStore.asObservable();
	medicalStore$ = this.medicalStore.asObservable();
	doctorStore$ = this.doctorStore.asObservable();
	diagnosisStore$ = this.diagnosisStore.asObservable();
	orderStore$ = this.orderStore.asObservable();
	feeStore$ = this.feeStore.asObservable();
	examStore$ = this.examStore.asObservable();
	examResultStore$ = this.examResultStore.asObservable();
	pathologyStore$ = this.pathologyStore.asObservable();
	pathologyAutoCompleteStore$ = this.pathologyAutoCompleteStore.asObservable();
	examDetailStore$ = this.examDetailStore.asObservable();
	ccStore$ = this.ccStore.asObservable();
	formStore$ = this.formStore.asObservable();
	formDetailStore$ = this.formDetailStore.asObservable();
	surgicalStore$ = this.surgicalStore.asObservable();
	medicineStore$ = this.medicineStore.asObservable();
	diagMedicalStore$ = this.diagMedicalStore.asObservable();
	surDiagStore$ = this.surDiagStore.asObservable();
	surgicalMedicalStore$ = this.surgicalMedicalStore.asObservable();
	surDoctorStore$ = this.surDoctorStore.asObservable();
	partiSurStore$ = this.partiSurStore.asObservable();
	partiAnesthStore$ = this.partiAnesthStore.asObservable();
	nursDeptStore$ = this.nursDeptStore.asObservable();
	nursCircumStore$ = this.nursCircumStore.asObservable();
	nursDiagStore$ = this.nursDiagStore.asObservable();
	nursPlanStore$ = this.nursPlanStore.asObservable();
	nursStateStore$ = this.nursStateStore.asObservable();
	nursStateEavStore$ = this.nursStateEavStore.asObservable();
	nursEavStore$ = this.nursEavStore.asObservable();
	nursEavItemsStore$ = this.nursEavItemsStore.asObservable();
	nursAssessmentStore$ = this.nursAssessmentStore.asObservable();
	concernPatientStore$ = this.concernPatientStore.asObservable();  
	rediationTreatmentStore$ = this.rediationTreatmentStore.asObservable();
	rediationTherapyRoomStore$ = this.rediationTherapyRoomStore.asObservable();
	rediationTherapyRegionStore$ = this.rediationTherapyRegionStore.asObservable();
	rediationDoctorStore$ = this.rediationDoctorStore.asObservable();

	constructor(
		private _store: StoreService,
		private _state: DashboardState,
		private _finalState: ItemListState,
		private _router: Router,
		private _func: DashboardFunc,
		private _translate: TranslateService
	) {
		// 현재 위치 파악
		this._func.curUrl$.subscribe(res => {
			this.curLocation = res;
		});
		const store = JSON.parse(sessionStorage.getItem('store'));
		if(store) {
			this.storeVo = store;
		}
		this._store.storeVo$.subscribe(res => {
			this.storeVo = res;
		});
	}
	
	// 그리드 추가 정보
	setAddGrid(data) {
		this.addGrid.next(data);
	}
	// 활성화 탭 정보
	setActiveTab(data) {
		this.activeTab.next(data);
	}

	// 병원
	setHospitalStore(data) {
		this.hospitalStore.next(data);
		this.dataset = data;
	}
	// 진료과
	setMedicalStore(data) {
		this.medicalStore.next(data);
		this.dataset = data;
	}
	// 진료의
	setDoctorStore(data) {
		this.doctorStore.next(data);
		this.dataset = data;
	}
	// 진단
	setDiagnosisStore(data) {
		this.diagnosisStore.next(data);
		this.dataset = data;
	}
	// 진단수술-진단진료과
	setDiagMedicalStore(data) {
		this.diagMedicalStore.next(data);
		this.dataset = data;
	}
	// 오더
	setOrderStore(data) {
		this.orderStore.next(data);
		this.dataset = data;
	}
	// 수가
	setFeeStore(data) {
		this.feeStore.next(data);
		this.dataset = data;
	}
	// 검사
	setExamStore(data) {
		this.examStore.next(data);
		this.dataset = data;
	}
	// 검사결과 기본검색
	setExamResultStore(data) {
		// console.log(JSON.stringify(data));
		this.examResultStore.next(data);
		this.dataset = data;
	}
	// 병리
	setPathologyStore(data) {
		this.pathologyStore.next(data);
		this.dataset = data;
	}

	// 병리 Autocomplete
	setPathologyAutoCompleteStore(data) {
		this.pathologyAutoCompleteStore.next(data);
		//this.dataset = data;
	}

	setExamDetailStore(data) {
		this.examDetailStore.next(data);
		this.dataset = data;
	}
	// cc
	setCcStore(data) {
		this.ccStore.next(data);
		this.dataset = data;
	}
	// 서식
	setFormStore(data) {
		this.formStore.next(data);
		this.dataset = data;
	}
	// 서식 세부
	setFormDetailStore(data) {
		this.formDetailStore.next(data);
		this.dataset = data;
	}
	// 수술
	setSurgicalStore(data) {
		this.surgicalStore.next(data);
		this.dataset = data;
	}
	// 약품
	setMedicineStore(data) {
		this.medicineStore.next(data);
		this.dataset = data;
	}

	// 진단수술-수술진단명
	setSurDiagStore(data) {
		this.surDiagStore.next(data);
		this.dataset = data;
	}
	// 진단수술-수술진료과
	setSurgicalMedicalStore(data) {
		this.surgicalMedicalStore.next(data);
		this.dataset = data;
	}
	// 진단수술-수술집도의
	setSurDocStore(data) {
		this.surDoctorStore.next(data);
		this.dataset = data;
	}
	// 수술상세-수술 후 퇴실장소
	setPartiSurStore(data) {
		this.partiSurStore.next(data);
		this.dataset = data;
	}
	// 수술상세-마취종류
	setPartiAnesthStore(data) {
		this.partiAnesthStore.next(data);
		this.dataset = data;
	}
	// 간호기록부서
	setNursDeptStore(data) {
		this.nursDeptStore.next(data);
		this.dataset = data;
	}	
	// 간호진단-간호사정
	setNursCircumStore(data) {
		this.nursCircumStore.next(data);
		this.dataset = data;
	}
	// 간호진단-간호진단
	setNursDiagStore(data) {
		this.nursDiagStore.next(data);
		this.dataset = data;
	}
	// 간호진단-간호계획
	setNursPlanStore(data) {
		this.nursPlanStore.next(data);
		this.dataset = data;
	}
	// 간호진술문
	setNursStateStore(data) {
		this.nursStateStore.next(data);
		this.dataset = data;
	}
	// 간호진술문 EAV
	setNursStateEavStore(data) {
		this.nursStateEavStore.next(data);
		this.dataset = data;
	}
	// 용어 EAV
	setNursEavStore(data) {
		this.nursEavStore.next(data);
		this.dataset = data;
	}
	// 용어 EAV 항목
	setNursEavItemsStore(data) {
		this.nursEavItemsStore.next(data);
		this.dataset = data;
	}
	// 간호사정평가
	setNursAssessmentStore(data) {
		this.nursAssessmentStore.next(data);
		this.dataset = data;
	}
	// 환자
	setConcernPatientStore(data) {
		this.concernPatientStore.next(data);
		this.dataset = data;
	}
	// 방사선 종양 치료
	setRediationTreatmentStore(data) {
		this.rediationTreatmentStore.next(data);
		this.dataset = data;
	}
	// 방사선치료 - 치료실
	setRediationTherapyRoomStore(data) {
		this.rediationTherapyRoomStore.next(data);
		this.dataset = data;
	}
	// 방사선치료 - 치료부위
	setRediationTherapyRegionStore(data) {
		this.rediationTherapyRegionStore.next(data);
		this.dataset = data;
	}
	// 방사선치료 - 담당의
	setRediationDoctorStore(data) {
		this.rediationDoctorStore.next(data);
		this.dataset = data;
	}

	// 하단 툴팁
	setMessage(data) {
		this.message.next(data);
	}
	// 코드값 구하기
	secCode(seq: string): {select: string; name: string} {
		let secId = this._state.code[seq].idx;
		let secName = this._state.code[seq].name;;
		// console.log('코드값', secId, secName);
		return { select: secId, name: secName };
	}
	checkDuplCate(key: string): string {
		for(let cate of this._state.processGroup) {
			const prop = Object.getOwnPropertyNames(cate);
			const arr = cate[prop[0]].split(',');
			if(~arr.indexOf(key)) {
				return prop[0];
			}
		}
	}

	// 그리드 추가
	addClientGrid(seq: string) {
		console.log('그리드 추가');
		const dataset = Object.assign({}, this.dataset);
	
		const idx = dataset.client.length;
		// console.log(dataset.client, idx);
		if(idx === 1 && !dataset.client[0].length) {
			return false;
		} else {
			dataset.client[idx] = [];
			dataset.condition[idx] = 'and';
			dataset.name[idx] = '';
			console.log(dataset);
	
			this.dataset = dataset;
			// this[storage].next(dataset);
			this.submitData(seq, dataset);
		}			
	}
	// 테이블 데이터 추가
	addData(seq: string, idx:number, rows: any) {
		// console.log('데이터 추가',seq, idx, rows);
		const codeList = [];		
		const dataset = Object.assign({}, this.dataset);
		
		const cLen = dataset.client[idx] ? dataset.client[idx].length : 0;
		const sLen = rows.length;

		if (cLen + sLen > 1000) {
			notify(this._translate.instant('renewal2017.p.over-thousand'), 'error', 3000);
		} else {
			let code;
			seq !== 'concernPatient' ? code = this.secCode(seq) : code = {select: 'cncnPtNdSeq'};
			
			if(rows && dataset) {
				for(let list of dataset.server) {
					seq !== 'concernPatient' ? codeList.push(list[code.select]) : codeList.push(list['cncnPtNdSeq']);
					
				}
				if(this.curLocation !== 'final') {
					// Condition Setup
					if(!dataset.client[idx]) {
						dataset.client.push([]);
					}
					if(!~this.stringStorage.indexOf(seq)) {
						if(!dataset.condition[idx]) {
							dataset.condition[idx] = 'and';
						}
					}			
					for(let row of rows) {	
						dataset.server.splice(codeList.indexOf(row[code.select]), 1);
						codeList.splice(codeList.indexOf(row[code.select]), 1);
						dataset.client[Number(idx)].push(row);
					}				
				} else {
					// Add Items filter
					for(let row of rows) {
						dataset.server.splice(codeList.indexOf(row[code.select]), 1);
						codeList.splice(codeList.indexOf(row[code.select]), 1);
						dataset.filter.push(row);
					}
				}	
				
				return this.submitData(seq, dataset);
			}	
		}
	}

	// 조건 설정 데이터 추가
	addDataCondition(seq: string, rows: any) {
		
		this.dataset = Object.assign({}, this.dataset, rows);
		console.log('addDataCondition', this.dataset);
		return this.submitData(seq, rows);
	}
	// string 타입 데이터 추가
	addDataString(seq: string, key: string, val: string) {
		// const dataset = Object.assign({}, this.dataset);
		let rows = {};
		rows[key] = val;
		return this.submitData(seq, rows);
	}
	// 날짜타입 데이터 추가
	addDate(seq: string, rows: any) {
		console.log('추가된 날짜 정보',rows);
		return this.submitData(seq, rows);
	}

	// and, not 조건 데이터 추가
	setCondition(seq: string, idx:number, data: string) {
		const dataset = Object.assign({}, this.dataset);
		dataset.condition[idx] = data;
		return this.submitData(seq, dataset);
	}
	// 색인 추가
	setWordIndex(param: [string, number, string]) {
		let [seq, idx, data] = param;
		const dataset = Object.assign({}, this.dataset);
		if(data) {
			dataset.name[idx] = data;

			return this.submitData(seq, dataset);
		}
	}
	// 데이터 삭제
	removeData(seq: string, idx: number, rows: any): void {
		console.log('데이터 삭제', seq, idx);
		let codeList = [];
		const code = this.secCode(seq);
		const dataset = Object.assign({}, this.dataset);

		if(this.curLocation !== 'final') {
			for(let list of dataset.client[idx]) {
				codeList.push(list[code.select]);
			}
			dataset.client[idx].splice(codeList.indexOf(rows[code.select]), 1);
		} else {
			for(let list of dataset.filter) {
				codeList.push(list[code.select]);
			}
			dataset.filter.splice(codeList.indexOf(rows[code.select]), 1);
		}

		codeList.splice(codeList.indexOf(rows[code.select]), 1);
		
		// if (seq !== 'concernPatient') {
		// 	dataset.server.push(rows);

		// 	this.dataset.server.sort((a, b) => {
		// 		if(a[idx] < b[idx]) {
		// 			return -1;
		// 		}
		// 		if(a[idx] > b[idx]) {
		// 			return 1;
		// 		}
		// 	});
		// }
		dataset.server.push(rows);

		this.dataset.server.sort((a, b) => {
			if(a[idx] < b[idx]) {
				return -1;
			}
			if(a[idx] > b[idx]) {
				return 1;
			}
		});
		
		if(!dataset.client[idx].length) {
			this.removeClientGroup(seq, idx);
		}
		this.submitData(seq, dataset);
	}
	removeClientGroup(seq: string, idx: number): void {
		const dataset = Object.assign({}, this.dataset);
		const serverClone = dataset.server.concat(dataset.client[idx]);
		const store = this._store.store;
		const delCel = () => {
			dataset.client.splice(idx, 1);
			dataset.condition.splice(idx, 1);
			dataset.name.splice(idx, 1);
		}
		
		if(dataset.client.length > 1) {
			delCel();
		} else {
			if(dataset.client.length === 1 && idx === 1) {
				delCel();
			} else if(dataset.client.length === 1 && idx === 0) {
				dataset.client[idx] = [];
				dataset.condition = [];
				dataset.name = [];
			}
		}
		for(let state of this._state.stringArrayType) {			
			if(dataset[state]) {
				dataset[state].splice(idx, 1);
				this.dataset[state] = dataset[state];
			}
		}
		// if (seq !== 'concernPatient') {
		// 	dataset.server = serverClone;
		// 	this.dataset.server = serverClone;
		// 	// this.dataset = dataset;
		// }
		dataset.server = serverClone;
		this.dataset.server = serverClone;

		if(this.curLocation !== 'final') {
			// consition step
			this.submitData(seq, dataset);
		}
	}

	removeFilterGroup(seq: string, idx: number): void {
		const dataset = Object.assign({}, this.dataset);
		const serverClone = dataset.server.concat(dataset.filter);
		const store = this._store.store;
		const delCel = () => {
			dataset.filter.splice(idx, 1);
		}

		dataset.filter = [];

		dataset.server = serverClone;
		this.dataset.server = serverClone;
		this.dataset.filter = dataset.filter;

		this.submitData(seq, dataset);
	}

	// 컴포넌트로 데이터 주입
	submitData(seq: string, rows: any) {
		if(rows) {
			const data = Object.assign({}, this.dataset, rows);
			// console.log(JSON.stringify(data));
			// console.log('submitData',seq, data);
			// this.dataset = data;
			switch(seq) {
				case 'hospital':
					this.hospitalStore.next(data);
					   break;
				case 'medical':
					this.medicalStore.next(data);
					break;
				case 'doctor':
					this.doctorStore.next(data);
					break;
				case 'diagnosis' :
					this.diagnosisStore.next(data);
					break;
				case 'order':
					this.orderStore.next(data);
					break;
				case 'fee':
					this.feeStore.next(data);
					break;
				case 'exam':
					this.examStore.next(data);
					break;
				case 'examResult':
					this.examResultStore.next(data);					
					break;
				case 'examDetail':
					this.examDetailStore.next(data);
					break;
				case 'pathology':
					this.pathologyStore.next(data);
					break;
				case 'form':
					this.formStore.next(data);
					break;
				case 'formDetail':
					this.formDetailStore.next(data);
					break;
				case 'medicine':
					this.medicineStore.next(data);
					break;
				case 'surgical':
					this.surgicalStore.next(data);
					break;
				case 'diagMed':
					this.diagMedicalStore.next(data);
					break;
				case 'surDiag':
					this.surDiagStore.next(data);
					break;
				case 'surMed':
					this.surgicalMedicalStore.next(data);
					break;
				case 'surDoc':
					this.surDoctorStore.next(data);
					break;
				case 'partiSur':
					this.partiSurStore.next(data);
					break;
				case 'partiAnesth':
					this.partiAnesthStore.next(data);
					break;
				case 'cc':
					this.ccStore.next(data);
					break;
				case 'nursDept':
					this.nursDeptStore.next(data);
					break;
				case 'nursCircum':
					this.nursCircumStore.next(data);
					break;
				case 'nursDiag':
					this.nursDiagStore.next(data);
					break;
				case 'nursPlan':
					this.nursPlanStore.next(data);
					break;
				case 'nursState':
					this.nursStateStore.next(data);
					break;
				case 'nursStateEav':
					this.nursStateEavStore.next(data);
					break;
				case 'nursEav':
					this.nursEavStore.next(data);
					break;
				case 'nursEavItems':
					this.nursEavItemsStore.next(data);
				case 'concernPatient':
					this.concernPatientStore.next(data);
				case 'rediation':
					this.rediationTreatmentStore.next(data);
				case 'rediationRoom':
					this.rediationTherapyRoomStore.next(data);
				case 'rediationRegion':
					this.rediationTherapyRegionStore.next(data);
				case 'rediationDoctor':
					this.rediationDoctorStore.next(data);
			}
			
			if(this.curLocation !== 'final') {				
				this.saveLTStore(seq, data);
				
			} else {
				// 	Add Items
				console.log(seq, 'filter', data);
				this.saveFilter(seq, data);
			}
		}
	}
	// Add Item 필터 저장
	saveFilter(seq: string, data: any): void {
		// console.log('seq', seq);
		// console.log('data', data);
		let filterset = [];
		let filterCd = data.filterCd;
		for(let filter of data.filter) {
			filterset.push(filter[this.secCode(seq).select])
		}
		this._store.shareFinalStorefilter(filterset, this._state.code[seq].storage, filterCd);
	}
	
	saveLTStore(seq: string, dataset: any): void {
		const code = this.secCode(seq);
		let store;
		delete dataset.server;
		delete dataset.filter;		
		if(!~this.stringStorage.indexOf(seq)) {
			store = {
				select1: [],
				name1: [],
				condition1: []
			};
			for(let key of Object.keys(dataset)) {
				// console.log('스토어에 데이터셋 적용',dataset);
				if(key === 'client') {
					for(let data of dataset.client) {
						if(data.length) {
							const sel = [], nm=[];
							for(let key of data) {
								sel.push(`'${key[code.select]}'`);
							}
							store.select1.push(sel.join(','));
						}
						else {
							dataset.client.splice(dataset.client.indexOf(data), 1);
						}
					}
				} else if(key === 'name') {
					store.name1 = dataset.name;					
				} else if(key === 'condition') {
					store.condition1 = dataset.condition;					
				} else if(~this._state.stringArrayType.indexOf(key)) {
					// freetext, range 등
					if(key === 'freeTextCondition') {
						dataset[key].length ? store[key] =  dataset[key] : store[key] = ['and'];
					} else {
						store[key] = dataset[key];
					}
					
				} else if(~this._state.stringType.indexOf(key)) {
					(dataset[key] !== null && typeof dataset[key] !== 'undefined') ? store[key] = dataset[key] : false;
					// store[key] = dataset[key];
				}
			}
			// 선택데이터가 없을 경우, 색인도 삭제
			if(!store.select1.length) {
				store.name1 = [];
				store.condition1 = [];
			}
		} else {
			store = {
				select1: null,
				name1: null
			};
			const sel = [], nm=[];
			for(let data of dataset.client) {
				for(let key of data) {
					sel.push(`'${key[code.select]}'`);
				}
			}
			store['select1'] = sel.join(',');
		}
		
		return this.saveStoreAction(seq, store);
	}
	// 스토어 저장
	saveStoreAction(seq: string, store: any) {
		const storage = this._state.code[seq].storage;
		if(store.select1 && store.select1.length === 1 &&  store.select1[0] === '') {
			this._store.removeTableStore(storage);
		} else {
			if(seq !== 'hospital') {
				this._store.shareTableStore(store, storage);				
			}
		}
	}

	// 세션에 저장되어 있는 데이터 화면에 구현
	getStorage(seq: string, idx: string, storage: any): void {
		// this.message.next(this._state.message[seq]);
		// 스토어 적용 완료여부 통지
		this.requestComplete.next([seq, storage]);
		let arrData = {};
		let strData = {};

		if(this.curLocation !== 'final' && storage) {
			for(let key of Object.keys(storage)) {
				if(key === 'select1') {
					// 룩업 테이블 적용
					if(!~this.stringStorage.indexOf(seq)) {
						
						let arr = [];
						let dataset = [];
						if(storage.condition1) {
							this.dataset.condition = storage.condition1;
						} if (storage.select1) {
							Array.from(storage.select1).forEach((obj, idx) => {
								const split = String(obj).split(',');
								arr.push(split);
							});
						}
						for(let i=0; i<arr.length; i++) {
							dataset.push([]);
						}
						for(let data of this.dataset.server) {
							for(let i=0; i<arr.length; i++) {
								if(~arr[i].indexOf(`'${data[idx]}'`)) {
									dataset[i].push(data);
								}
							}
						}
						for(let i=0; i<dataset.length; i++) {
							this.addData(seq, i, dataset[i]);
						}

					} else {
						if(~this.stringStorage.indexOf(seq)) {
							let arr = [];
							const split = String(storage.select1).split(',');
							for(let data of this.dataset.server) {
								if(~split.indexOf(`'${data[idx]}'`)) {
									this.addData(seq, 0, [data]);
								}
							}
						}
					}
				}
				else if(~this._state.stringArrayType.indexOf(key)) {
					// 조건설정 등 배열타입 스토어 적용
					if(key === 'freeTextCondition') {
						storage[key].length ? arrData[key] =  storage[key] : arrData[key] = ['and'];
					} else if (key === 'rangeDtSt' || key === 'rangeDtEd') {
						typeof arrData[key] !== 'undefined' ? storage[key] : [];
					} else {
						arrData[key] = storage[key];
					}
				}
				else if(~this._state.stringType.indexOf(key)) {
					// 기타 날짜 등 스트링타입 스토어 적용
					strData[key] = storage[key];
					this.addDataString(seq, key, strData[key]);				
				}
			}

			this.addDataCondition(seq, arrData);			
		} else {
			// 최종결과 화면의 경우
			// this.getFilterStorage(seq);
		}
	}

	getFilterStorage(seq: string, selected: any[]) {
		if (this.curLocation === 'final') {
			const storageNm = this._state.code[seq].storage
			let codes: string[] = [];
			let dataset = [];
			let data = {};
			for(let key of this._finalState.matchAddItem) {
				if(key.store === storageNm && key.code1 === 'select1') {
					data['ctgCd'] = key.category;
					data['itemCd'] = key.itemCd;
					break;
				}
			}
			// console.log(data);
			if (this._store.store.finalResultStore.filter) {
				for(let item of this._store.store.finalResultStore.filter) {
					let arr = item.split('|');
					if(arr[0] === data['ctgCd'] && arr[1] === data['itemCd']) {
						codes = arr[2].split(',');
						break;
					}
				}
			}

			// Output Items Filter에서 선택한 값이 없을 때
			if (codes.length === 0 || (codes.length > 0 && codes[0] === "")) {
				// Case Design에서 해당 스토어에 선택한 값이 있을 때
				if (selected.length > 0) {
					for (let cd of selected) {
						codes.push(cd);
					}
				}
			}

			const code = this.secCode(seq).select;
			for(let data of this.dataset.server) {
				if(~codes.indexOf(data[code])) {
					dataset.push(data);
				}
			}
			this.addData(seq, 0, dataset);
		}		
	}	
}
