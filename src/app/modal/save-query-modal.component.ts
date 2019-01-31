import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreService } from '../basicmode/store/store.service';
import { SaveQueryModalService } from './save-query-modal.service';
import { DashboardState } from '../basicmode/dashboard.state';
import { ItemListState } from '../item-list.state';
import { AppService } from '../app.service';

@Component({
	selector: 'save-query-modal',
	templateUrl: './save-query-modal.component.html',
	providers: [
		StoreService,
		SaveQueryModalService,
		DashboardState,
		ItemListState,
		ItemListState,
		AppService
	]
})

export class SaveQueryModal implements OnInit {
	// @Input() store: any;

	saveScenarioForm: FormGroup;
	scenario: {scNm: string, shareYn: boolean, shareStfNo: string} = {
		scNm: null,
		shareYn: false,
		shareStfNo: null
	};

	loading: boolean = true;
	dataSource: any;

	selectedRowsData: any;

	onShare: boolean = false;

	constructor(
		private _http: Http,
		private _fb: FormBuilder,
		private _modalService: NgbModal,
		// private _store: StoreService,
		private _service: SaveQueryModalService,
		public activeModal: NgbActiveModal
	) {
		this.saveScenarioForm = _fb.group({
		'scenarioNm': ['', Validators.compose([Validators.required])],
		'shareYn': [this.scenario.shareYn],
		'shareStfNo': [this.scenario.shareStfNo]
	});
	}
	ngOnInit() {
		this._service.list().subscribe(res => {
			this.dataSource = res['result'];
			setTimeout(() => { this.loading = false; }, 300);
		});
	}

	// 테이블 row 선택 이벤트 
	onSelectionChanged(event) {
		this.selectedRowsData = event.selectedRowsData;

		this.scenario.shareStfNo = '';

		for (let i = 0; i < this.selectedRowsData.length; i++) {
			this.scenario.shareStfNo += ( this.selectedRowsData[i]['drStfNo'] + ' ' + this.selectedRowsData[i]['drStfNm'] );

			if (i !== this.selectedRowsData.length - 1) {
				this.scenario.shareStfNo += ', ';
			}
		}
	}

	onContentReady(e) {
		e.component.option("loadPanel.enabled", false);
	}

	// 저장 버튼 클릭시
	submitForm(): void {	
		// // this._store.store.basicStore['queryFlowNm'] = this.scenario.scNm;

		// // if (this.scenario.shareStfNo !== null && this.scenario.shareStfNo !== '') {
		// // 	this._store.store.basicStore['shareYn'] = 'Y';
		// // 	this._store.store.basicStore['shareStfNo'] = this.scenario.shareStfNo;
		// // } else {
		// // 	this._store.store.basicStore['shareYn'] = null;
		// // 	this._store.store.basicStore['shareStfNo'] = null;
		// // }

		// this._store.shareStore();
		// // 모달창을 닫고, 부모창으로 스토어 값 전송
		// this.activeModal.close(this._store.store);

		let param = {
			queryFlowNm: null,
			shareYn: null,
			shareStfNo: null
		};
		param['queryFlowNm'] = this.scenario.scNm;
		if (this.scenario.shareStfNo !== null && this.scenario.shareStfNo !== '') {
			param['shareYn'] = 'Y';
			param['shareStfNo'] = this.scenario.shareStfNo;
		} else {
			param['shareYn'] = null;
			param['shareStfNo'] = null;
		}
		this.activeModal.close(param);
	}

	// Enter 키 입력 방지
	onKeyPress(event) {
		if (event.keyCode === 13) {
			return false;
		}
	}
}
