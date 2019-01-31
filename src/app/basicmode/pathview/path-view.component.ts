import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { AppState } from '../../app.state';
import { PathService } from './path-search/path.service';
import { DashboardState } from '../dashboard.state';
import { DashboardService } from '../dashboard.service';
import { StoreService } from '../store/store.service';
import { AppService } from '../../app.service';

import * as Model from '../model/dashboard.model';

import * as _ from 'lodash';


interface pathModel {
	testDtSt: string;
	testDtEd: string;
}

@Component({
 	selector: 'path-view',
	templateUrl: './path-view.component.html',
	providers: [ PathService ]
})

export class PathViewComponent implements OnInit {
	
	// Deprecated (Server 사용 안함)	
    dataSource: any[] = [];

    // Deprecated (Server 사용 안함)	
	condition: string[] = [];

	// AutoComplete List
	AutoCompleteList: any[] = []
	
	//Lastest Caret position ID
	currField: any;

	// Lastest Caret position Object
	currFieldObj: any;

	// FormGroup
	pathForm: FormGroup = new FormGroup({});

	pathData: pathModel;
	refreshMode: boolean = false;
	seqCode: string = this._localService.secCode;

	// Pathology Form to send to pathologyStore
	freeTextCtrl: any = {
		freeText: [''],
		freeTextCondition: ['and'],
	};

	// Primary Organ Form Control
	primaryCtrl: any = {
		freeText: [''],
		freeTextCondition: ['and']
	};

	// Diagnosis Form Control
	diagnosisCtrl: any = {
		freeText: [''],
		freeTextCondition: ['and']
	};

	// Procedure Form Control
	procedureCtrl: any = {
		freeText: [''],
		freeTextCondition: ['and']
	};

	// Secondary Organ Form Control
	secondaryCtrl: any = {
		freeText: [''],
		freeTextCondition: ['and']
	};

	// Report(plrtLdat) Form Control
	reportCtrl: any = {
		freeText: [''],
		freeTextCondition: ['and']
	};

	// Default FormControl
	mainlyCtrl: any[] = [this.primaryCtrl, this.diagnosisCtrl, this.procedureCtrl, this.secondaryCtrl, this.reportCtrl];

	// Default FormControl String
	mainlyCtrlStr: string[] = ['primaryCtrl', 'diagnosisCtrl', 'procedureCtrl', 'secondaryCtrl', 'reportCtrl'];

	// Default FormControl Category
	mainlyCate = ['Primary Organ', 'Diagnosis', 'Procedure', 'Secondary Organ', '전문'];

	// DashboardService.addDataCondition YN
	mainlyInit: boolean = false;
	
	// FreeText Data(Value) of each controller 
	freeTextAction: string[];

	// FreeTextCondition Data(and,or,not) of each controller 
	freeTextCondAction: string[];

	// Category name(primary, diagnosis, procedure, ...) of each controller 
	freeTextCateAction: string[];

	// Sequence Number of each controller 
	freeTextSeqAction: string[];

	storageDate: {fromDt: string; toDt: string} = {
		fromDt: null,
		toDt: null
	};

	oldData: any;

	constructor(
		private _router: Router,
		private _app: AppState,
		private _fb: FormBuilder,
		private _store: StoreService,
		private _translate: TranslateService,
		private _service: DashboardService,
		private _state: DashboardState,
		private _localService: PathService,
		private _modalService: NgbModal,
		private _appService: AppService
	) {		
		this.pathData = {
			testDtSt: null,
			testDtEd: null
		}
		
	}



	ngOnInit() {

		sessionStorage.setItem('currentUrl', this._router.url);
		const store = this._store.store;
		const storage = store[this._state.code[this.seqCode].storage];
		
		// 언어 변경
		this._translate.use(this._appService.langInfo);			
		this._appService.language$.subscribe(res => {
			this._translate.use(res); 
			setTimeout(() => {
				window.location.reload();
			}, 100);
		});

		// 하단 설명 변경
		this._translate.get('renewal2017.p.message-pathology').subscribe(res => {
			this._service.setMessage(res);
		});		
		
		if(storage) {
			this.storageDateLoad(storage);
		}

		// default setting 
		// make a FormGroup and make FormContorls in the FormGroup
		this.pathForm = this._fb.group({
			'testDtSt': [null, Validators.compose([Validators.required])],
			'testDtEd': [null, Validators.compose([Validators.required])],
			'freeText-0-primaryCtrl':[''],
			'freeTextCondition-0-primaryCtrl':[''],
			'freeText-0-diagnosisCtrl':[''],
			'freeTextCondition-0-diagnosisCtrl':[''],
			'freeText-0-procedureCtrl':[''],
			'freeTextCondition-0-procedureCtrl':[''],
			'freeText-0-secondaryCtrl':[''],
			'freeTextCondition-0-secondaryCtrl':[''],
			'freeText-0-reportCtrl':[''],
			'freeTextCondition-0-reportCtrl':[''],
		});
		
		// Deprecated
		let receive = this._service.pathologyStore$.subscribe(res => {
//			res['client'].length ? this.dataSource = res['client'] : this.dataSource = [];
//			if(res['client'][0] == null && res['testDtEd'] == null) console.log("path data 없음")
//			console.log("receive > store view");
//			console.log(res);
//			console.log(this.pathForm);
//			console.log(this.primaryCtrl);
//			this.condition = res['condition'];
		});	
		
		Promise.resolve(receive).then(
			() => {	
				if(storage && storage.name1) {
					this.setDynamicForm(storage);
				}
				
			}
		);

		this._store.deleteVo$.subscribe(res => {
			if(res === this._state.code[this._localService.secCode].storage) {
				
				this.mainlyInit = false;
				this.refreshMode = true;
				
				// init
				this.pathForm.reset({
					'testDtSt': [null],
					'testDtEd': [null],
					'freeText-0-primaryCtrl':[''],
					'freeTextCondition-0-primaryCtrl':['and'],
					'freeText-0-diagnosisCtrl':[''],
					'freeTextCondition-0-diagnosisCtrl':['and'],
					'freeText-0-procedureCtrl':[''],
					'freeTextCondition-0-procedureCtrl':['and'],
					'freeText-0-secondaryCtrl':[''],
					'freeTextCondition-0-secondaryCtrl':['and'],
					'freeText-0-reportCtrl':[''],
					'freeTextCondition-0-reportCtrl':['and'],
				})


				for(let i = 1; i < 5; i++) {
					for (let j = 0; j < 5; j++) {
						if(this.pathForm.contains(`freeText-${i}-${this.mainlyCtrlStr[j]}`)) {
							this.pathForm.removeControl(`freeText-${i}-${this.mainlyCtrlStr[j]}`)
							this.pathForm.removeControl(`freeTextCondition-${i}-${this.mainlyCtrlStr[j]}`)
						}
					}	
				}
				this.pathData = {
					testDtSt: null,
					testDtEd: null
				}
				this.storageDate = {
					fromDt: null,
					toDt: null
				}
				this.freeTextCtrl = {
					freeText: [''],
					freeTextCondition: ['and'],
				}
				//Primary orgran
				this.primaryCtrl = {
					freeText: [''],
					freeTextCondition: ['and']
				};
				//Diagnosis
				this.diagnosisCtrl = {
					freeText: [''],
					freeTextCondition: ['and']
				};
				//Procedure
				this.procedureCtrl = {
					freeText: [''],
					freeTextCondition: ['and']
				};
				//secondary organ
				this.secondaryCtrl = {
					freeText: [''],
					freeTextCondition: ['and']
				};

				//plrt_ldat 진단 전문
				this.reportCtrl = {
					freeText: [''],
					freeTextCondition: ['and']
				};
			
				this._localService.list().subscribe(res => {
					setTimeout(() => { this.refreshMode = false; }, 200);
				});
			}
		});
		
		this.watchForm();

		// set AutoComplete List at pathologyAutoCompleteStore
		this._localService.getAutoCompleteList("pathologyAutoComplete").subscribe(res => {
					setTimeout(() => { this.refreshMode = false; }, 200);
		});

		// get Autocomplete List
		let autoComplete = this._service.pathologyAutoCompleteStore$.subscribe(res => {
			res != null ? this.AutoCompleteList = res : this.AutoCompleteList = [];
			//console.log("[AutoCompleteList][get]" ,this.AutoCompleteList);
		});

		
	}

	// 날짜 로드
	storageDateLoad(storage: any): void {
		this.pathData.testDtSt = storage.testDtSt;
		this.pathData.testDtEd = storage.testDtEd;
		this.storageDate = {fromDt: this.pathData.testDtSt, toDt: this.pathData.testDtEd};
	}

	// 날짜 선택
	selectDate(event: {fromDt: string; toDt: string}): void {
		this.pathData.testDtSt = event.fromDt;
		this.pathData.testDtEd = event.toDt;

		this.storageDate = {fromDt: this.pathData.testDtSt, toDt: this.pathData.testDtEd};
		this._service.addDate(this._localService.secCode, {testDtSt: event.fromDt, testDtEd: event.toDt});
		
	}

	// 프리텍스트 컨트롤 동적 추가
	setDynamicForm(storage: any): void {
		console.log("[Pathology][setDynamicForm] Start..");
		//console.log("[Pathology][setDynamicForm][storage]" ,storage);
		//console.log("[Pathology][setDynamicForm][pathForm]" ,this.pathForm.controls);
		this.refreshMode = true;
		
		if(storage.freeText[0] != null) {
			console.log("[Pathology][setDynamicForm] Pathology storage can be found.");
			const storeFreeText = storage.freeText;
			const storeFreeCond = storage.freeTextCondition;
			const storeFreeCate = storage.select1;		
			//console.log("[Pathology][setDynamicForm][storeFreeText]" ,storeFreeText);	
			//console.log("[Pathology][setDynamicForm][storeFreeCond]" ,storeFreeCond);
			//console.log("[Pathology][setDynamicForm][storeFreeCate]" ,storeFreeCate);

			for(let i = 0; i < storage.freeText.length; i++) {
				
				let cate = storeFreeCate[i].substring(1,storeFreeCate[i].length - 1);
				
				// 초기화
				let ctrl = this.mainlyCtrl[0];
				let ctrlStr = this.mainlyCtrlStr[0];

				for (let j = 0; j < this.mainlyCate.length; j++) {
					
					if(cate == this.mainlyCate[j]) {
						ctrl = this.mainlyCtrl[j];
						ctrlStr = this.mainlyCtrlStr[j];
					}
				}

				//초기화 Ctrl >> array 0
				ctrl.freeText.pop();
				ctrl.freeTextCondition.pop();
				
				//this.pathForm.removeControl(`freeText-0-${ctrlStr}`);
				//this.pathForm.removeControl(`freeTextCondition-0-${ctrlStr}`);
				
				if (storage.freeText[i].includes(',')) {
					let sft = storeFreeText[i].split(',');
					let sfc = storeFreeCond[i].split(',');
					for (let k = 0; k < sft.length; k++) {
						ctrl.freeText.push(sft[k]);
						ctrl.freeTextCondition.push(sfc[k]);
						
						let text: FormControl = new FormControl(sft[k]);
						let condition: FormControl = new FormControl(sfc[k]);
						
						this.pathForm.addControl(`freeText-${k}-${ctrlStr}`, text);
						this.pathForm.addControl(`freeTextCondition-${k}-${ctrlStr}`, condition);
					}

				} else {
					let sft = storeFreeText[i];
					let sfc = storeFreeCond[i];
					ctrl.freeText.push(sft);
					ctrl.freeTextCondition.push(sfc);

					let text: FormControl = new FormControl(sft);
					let condition: FormControl = new FormControl(sfc);
					
					this.pathForm.addControl(`freeText-0-${ctrlStr}`, text);
					this.pathForm.addControl(`freeTextCondition-0-${ctrlStr}`, condition);
				}
			}
		} else {
			console.log("[Pathology][setDynamicForm] Pathology store can't be found.");
		}
		//console.log("[Pathology][setDynamicForm][primaryCtrl]", this.primaryCtrl.freeText);
		//console.log("[Pathology][setDynamicForm][diagnosisCtrl]", this.diagnosisCtrl.freeText);
		//console.log("[Pathology][setDynamicForm][procedureCtrl]", this.procedureCtrl.freeText);
		//console.log("[Pathology][setDynamicForm][reportCtrl]", this.reportCtrl.freeText);
		console.log("[Pathology][setDynamicForm] Done.");
	}

	addCondition(ctrl: any, cate: number): void {

		let text: FormControl = new FormControl('');
		let condition: FormControl = new FormControl('and');

		ctrl.freeText.push(['']);
		ctrl.freeTextCondition.push('and');
		
		this.pathForm.addControl(`freeText-${ctrl.freeText.length - 1}-${this.mainlyCtrlStr[cate]}`, text);
		this.pathForm.addControl(`freeTextCondition-${ctrl.freeTextCondition.length - 1}-${this.mainlyCtrlStr[cate]}`, condition);

		// FreeText Field 추가 시 추가된 FreeText 영역으로 자동 커서 이동 저장
		this.currField = `freeText-${ctrl.freeText.length - 1}-${this.mainlyCtrlStr[cate]}`;
	}


	delCondition(ctrl: any, cate: number): void {
		let text: FormControl = new FormControl('');
		let condition: FormControl = new FormControl('and');
		let leng = ctrl.freeText.length;
		
		ctrl.freeText.splice(leng - 1, 1);
		ctrl.freeTextCondition.splice(leng - 1, 1);
	
		setTimeout(() => {
			this.pathForm.removeControl(`freeText-${ctrl.freeText.length}-${this.mainlyCtrlStr[cate]}`);
			this.pathForm.removeControl(`freeTextCondition-${ctrl.freeTextCondition.length}-${this.mainlyCtrlStr[cate]}`);
			this.pathForm.updateValueAndValidity();
		}, 10);

		// FreeText Field 삭제 시 커서 위치 없앰
		this.currField = null;

	}
	
	// 커서의 위치 세팅 (focus)
	setPosition() {
		console.log("[Pathology][setPosition]");
		if (this.currField != null) {

			setTimeout(() => {

				// 진단 전문일 경우 <input type="text"> 이기에 path 조정 그 외는 AutoComplete Directive
				if (this.currField.split('-')[2] == 'reportCtrl') document.getElementById(this.currField).focus();
				else document.getElementById(this.currField).children['0'].children['0'].children['0'].focus();
				
			}, 1);
			
		}
	}

	// 커서가 다시 위치 했을 경우 기본 세팅
	// 기본적으로 커서가 다시 이동해도 List를 출력해주지 않기에 이를 세팅함
	defaultAutoComplete(e: any): void {

		// 값 저장
		let value = e.component.field()[0].value;
		console.log("[Pathology][defaultAutoComplete][e.component.field()]", e.component.field()[0].value)
		// 값이 없을 경우 반환 
		if (value == null || value == '') return;

		// 값이 있을 경우 SearchValue 세팅 및 pageSize 세팅
		console.log("[Pathology][defaultAutoComplete][e.component.field()]", e.component.getDataSource())
		
		e.component.getDataSource()._searchValue = value;
		e.component.getDataSource()._pageSize = 1000;

		// AutoComplete List 열기
		e.component.open();
		
	}

	// AutoComplete의 위치 가져오기
	getPosition(e: any) {
		console.log("[Pathology][getPosition][currFieldObj]", e);
		console.log("[Pathology][getPosition][currField]", e.element[0].id);
		this.currField = e.element[0].id;
		this.currFieldObj = e;
	}

	// Input의 위치 가져오기
	getInputPostition(e: any) {
		console.log("[Pathology][getPosition]", e.target.id);
		this.currField = e.target.id;
	}

	// 폼 변경 여부 관찰.
	watchForm(): void {

		this.pathForm.valueChanges
			.debounceTime(800)
			.distinctUntilChanged()
			.subscribe(res => {	
				//console.log("[Pathology][watchForm] Start..");
				this.freeTextAction = [];
				this.freeTextCondAction = [];
				this.freeTextCateAction = [];

				// 커서 보정
				this.setPosition();

				for(let key of Object.keys(res)) {
					const head = key.split('-')[0];		// freeText, freeTextCondition
					const idx = key.split('-')[1];		// 0, 1, 2, 3, ...
					const cate = key.split('-')[2];		// primaryCtrl, diagnosisCtrl, ...

					if(head === 'freeText' || head === 'freeTextCondition') {
						if(head === 'freeText') {
							this.freeTextCateAction.push(cate);
							this.freeTextAction.push(res[key]);
						} else if(head === 'freeTextCondition') {
							if(res[key] === "") {		
								this.freeTextCondAction.push('and');
							} else {
								this.freeTextCondAction.push(res[key]);
							}
						}

					}
				}
				
				//console.log("[Pathology][watchForm][freeTextAction]" ,this.freeTextAction);
				//console.log("[Pathology][watchForm][freeTextCondAction]" ,this.freeTextCondAction);
				//console.log("[Pathology][watchForm][freeTextCateAction]" ,this.freeTextCateAction);
				
				this.sendData();
				//console.log("[Pathology][watchForm] Done.");
		});
	}

	sendData(): void {
		
		const text = ['','','','',''], condition = ['','','','',''] 
		const tmpFreeText = [], tmpFreeCond = [], tmpFreeCate = [];

		if(this.freeTextAction) {
			var j = 0, k = 0, v = 0, s = 0, r = 0;
			
			for(let i = 0; i < this.freeTextAction.length; i++) {
				if (this.freeTextAction[i] == '') continue;
				
				if (this.freeTextCateAction[i] == this.mainlyCtrlStr[0]) {
					text[0] += this.freeTextAction[i] + ',';
					condition[0] += this.freeTextCondAction[i] + ',';
					this.primaryCtrl.freeText[j] = this.freeTextAction[i];
					this.primaryCtrl.freeTextCondition[j++] = this.freeTextCondAction[i];

				} else if (this.freeTextCateAction[i] == this.mainlyCtrlStr[1]) {
					text[1] += this.freeTextAction[i] + ',';
					condition[1] += this.freeTextCondAction[i] + ',';
					this.diagnosisCtrl.freeText[k] = this.freeTextAction[i];
					this.diagnosisCtrl.freeTextCondition[k++] = this.freeTextCondAction[i];

				} else if (this.freeTextCateAction[i] == this.mainlyCtrlStr[2]) {
					text[2] += this.freeTextAction[i] + ',';
					condition[2] += this.freeTextCondAction[i] + ',';
					this.procedureCtrl.freeText[v] = this.freeTextAction[i];
					this.procedureCtrl.freeTextCondition[v++] = this.freeTextCondAction[i];

				} else if (this.freeTextCateAction[i] == this.mainlyCtrlStr[3]) {
					text[3] += this.freeTextAction[i] + ',';
					condition[3] += this.freeTextCondAction[i] + ',';
					this.secondaryCtrl.freeText[s] = this.freeTextAction[i];
					this.secondaryCtrl.freeTextCondition[s++] = this.freeTextCondAction[i];

				} else if (this.freeTextCateAction[i] == this.mainlyCtrlStr[4]) {
					text[4] += this.freeTextAction[i] + ',';
					condition[4] += this.freeTextCondAction[i] + ',';
					this.reportCtrl.freeText[r] = this.freeTextAction[i];
					this.reportCtrl.freeTextCondition[r++] = this.freeTextCondAction[i];
				}
			}
		
			for(let i = 0; i < text.length; i++) {

				if(condition[i] == '') continue;
				tmpFreeText.push(text[i].substring(0,text[i].length - 1));
				tmpFreeCond.push(condition[i].substring(0,condition[i].length - 1));
				tmpFreeCate.push(this.mainlyCate[i]);
			
			}	
		}

		this.freeTextCtrl = {
			freeText: tmpFreeText,
			freeTextCondition: tmpFreeCond
		}

		for(let i = 0; i < tmpFreeCate.length; i++) {
			
			let dataFormat = {
				lclTpcd: 'A',
				hspTpCd: null,
				hspTpNm: null,
				plrtLdatKey: tmpFreeCate[i]
			};

			this._localService.addData(this.seqCode, i, JSON.parse(JSON.stringify(dataFormat)));
			this.mainlyInit = true;
		}
		
		if (tmpFreeCate.length == 0) this._localService.addData(this.seqCode, 0, 'E1244');
		if (this.mainlyInit) this._service.addDataCondition(this._localService.secCode, this.freeTextCtrl);

	}
}
