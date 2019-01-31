import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Http, Headers, URLSearchParams } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { NgxCarousel } from 'ngx-carousel';

import { AppState } from '../../app.state';
import { DashboardState } from '../dashboard.state';
import { WorkflowService } from './workflow.service';

import { StoreService } from '../store/store.service';
import { DashboardService } from 'app/basicmode/dashboard.service';
import { ResultService } from '../interimresult/interim-result.service';
// import { JobStatusModal } from '../../modal/job-status-modal.component';
import { RefreshModal } from '../../modal/refresh-modal.component';
import { element } from 'protractor';
import { DashboardFunc } from 'app/basicmode/dashboard.func';
import { TranslateService } from '@ngx-translate/core';

import notify from "devextreme/ui/notify";
import * as Model from '../model/dashboard.model';
import * as StoreModel from '../store/store.model';

declare const $: any;
import * as _ from 'lodash';

@Component({
	selector: 'workflow-diagram',
	templateUrl: './workflow.component.html',
	providers: [ WorkflowService, ResultService ]
	
})

export class WorkflowComponent implements OnInit {
	@Input() curUrl: string;

	carouselOne: NgxCarousel;

	storeVo: any = [];
	winSize: number;
	condition: string[] = [];
	selectGroup: string[] = [];
	selectGroupClone: string[] = [];
	datasource: any = [];
	processGroup: any;	
	closeResult: string;

	exceptGroup: string[] = [];
	exceptCondition: string[] = [];
	initPatient: string = 'patient';

	runnable: boolean = false;
	stoppable: boolean = true;

	constructor(
		private _store: StoreService,
		private _app: AppState,
		private _router: Router,
		private _state: DashboardState,
		private _service: WorkflowService,
		private _dashboard: DashboardService,
		private _func: DashboardFunc,
		private _interim: ResultService,
		private _http: Http,
		private _modalService: NgbModal
	) {
		this.processGroup = this._state.processGroup;
		const store = JSON.parse(sessionStorage.getItem('store'));
		if(store) {
			this.storeVo = store;
			this.applyCard(store);
		}
	}
	ngOnInit() {
		console.log(JSON.stringify(localStorage).length);
		// 스토어 불러오기
		if(this._store.store.basicStore.select) {
			this.initPatient = this._store.store.basicStore.select.split(',')[0];
			this.checkRun(this._store.store);
		}
		
		this._store.storeVo$.subscribe(res => {
			console.log('[STORE]', res);
			 
			if(this._store.store.basicStore.select) {
				this.initPatient = this._store.store.basicStore.select.split(',')[0];
			}

			this.checkRun(res);
			this.applyCard(res);
		});
	
		// 윈도우 크기 계산
		// const basic = (document.querySelector('.workflow-basic') as HTMLElement).offsetWidth;
		this.winSize = window.innerWidth - 500;
		window.addEventListener('resize', () => {
			this.winSize = window.innerWidth - 500;
		});

		this.carouselOne = {
			grid: {xs: 0, sm: 0, md: 0, lg: 0, all: 300},
			slide: 1,
			speed: 400,
			interval: 4000,
			point: {
			  visible: false
			},
			load: 1,
			touch: false,
			loop: false,
			custom: 'banner',
		};

		this._func.createPatient$.subscribe(res => {
			this.stoppable = res;
		});
	}

	// 스토어 내용 카드에 반영
	applyCard(res: any): void {
		this.storeVo = res;
		const select = res.basicStore.select;
		const condition = res.basicStore.condition;
		this.selectGroupClone = [];
		this.selectGroup = [];
		for(let st of Object.keys(res)) {
			if(!~this._state.exceptResult.indexOf(st) && !~this.selectGroupClone.indexOf(this.checkDuplCate(st))) {
				this.selectGroupClone.push(this.checkDuplCate(st));
			}
		}
		select ? this.selectGroup = select.split(',') : this.selectGroup = [];
		condition ? this.condition = condition.split(',') : this.condition = [];
		
		this.checkUpdate();
	}

	// 중복 체크
	checkDuplCate(key: string): string {
		for(let cate of this.processGroup) {
			const prop = Object.getOwnPropertyNames(cate);
			const arr = cate[prop[0]].split(',');
			if(~arr.indexOf(key)) {
				return prop[0];
			}
		}
	}
	// 업데이트 여부 확인
	checkUpdate(): void {
		const arr = this.selectGroup.slice(0);
		const condition = this.condition.slice(0);
		
		if(arr.length < this.selectGroupClone.length) {
			for(let key of this.selectGroupClone) {
				if(!~arr.indexOf(key) && arr.length < this.selectGroupClone.length) {
					arr.push(key);
					condition.push('and');
				}
			}
			this._store.shareCondition([arr.join(','), condition.join(',')]);
			
		} if(arr.length > this.selectGroupClone.length) {
			return this.makingCard(this.selectGroupClone);
		 } else {
			return this.makingCard(arr);
		}
	}

	// 카드 동적 생성
	makingCard(selectGroup: string[]): void {
		// console.log('selectGroup',selectGroup);
		this.datasource = [];
		Array.from(selectGroup).forEach((group, index) => {
			this.datasource.push({
				group: group,
				member: [],
				except: false,
				condition: this.condition[index].toUpperCase()
			});
		});

		for(let key of Object.keys(this.storeVo)) {
			const groupNm = this.checkDuplCate(key);
			if(~selectGroup.indexOf(groupNm)) {
				let dataset = {
					title: key,
					content: this.storeVo[key],
					name: this.storeVo[key].name1
				};
				this.datasource[selectGroup.indexOf(groupNm)].member.push(dataset);
			}
		}
		// console.log('쿼리플로우', this.datasource);
		this.sortable();
	}
	sortable(): void {
		let groupArr = [];
		let conditionArr = [];
		let setStorageArr = (arr) => {
			this._store.reArrStore(arr);
		}
		// jQuery
		setTimeout(() => {
			$('.ngxcarousel-items').sortable({
				axis: 'x',
				items: '.workflow-diagram',
				start: function(event, ui) {
					groupArr = [];
				},	
				helper: function (e, item) {
					var elements = item.clone();
					elements.css('opacity', 0.6);
					elements.find('.d-inline-block, .line-box').css('opacity', 0.2);
					var helper = $('<div/>');
					return helper.append(elements);
				},
				stop: function(event, ui) {
					$('.workflow-diagram').each(function(index) {
						groupArr.push($(this).data('group'));
						conditionArr.push($(this).data('condition').toLowerCase());
					});
					setStorageArr([groupArr, conditionArr]);
				}
			});
		}, 10);		
	}
	// 캐러셀 메뉴 
	carouselfunc(event: Event) {
		// 
	}

	// and, or 조건 설정
	changeJoin(event: MouseEvent, select: string): void {
		if(this.selectGroup && this.selectGroup.indexOf(select)) {
			this.condition[this.selectGroup.indexOf(select)] = event.srcElement.innerHTML.toLowerCase();
			this._store.shareCondition([this.selectGroup.join(','), this.condition.join(',')]);
		}
	}
	// 카드 삭제
	deleteWorkflow(event: MouseEvent, storeNm: any) {
		event.preventDefault();
		for(let data of storeNm.member) {
			this._store.removeStore(storeNm.group, data.title);
		}
	}
	// 카드 더보기
	expandCard(event: MouseEvent, group: string): void {
		const target = (document.querySelector('.wrap-slider') as HTMLElement);
		const cardAll = document.querySelectorAll(`[data-group]`);
		const card = (document.querySelector(`[data-group=${group}]`) as HTMLElement);
		
		
		_.forEach(cardAll, obj => {
			obj.classList.remove('expand');
		});
		card.classList.add('expand');
		Promise.resolve(this.collapseCard).then(() => {
			setTimeout(() => {
				target.classList.add('expand');
			}, 200)
		});
	}
	collapseCard(event: MouseEvent, group: string): void {
		const cardAll = document.querySelectorAll(`[data-group]`);
		const card = (document.querySelector(`[data-group=${group}]`) as HTMLElement);
		const target = (document.querySelector('.wrap-slider') as HTMLElement);
		card.classList.remove('expand');
		
		if(!document.querySelector('.card-workflow.expand')) {
			target.classList.remove('expand');
		}
	}
	// 조건 제외
	exceptWorkflow(event: MouseEvent, storeNm: any) {
		event.preventDefault();
		const store = Object.assign({}, this.storeVo);
		const select = store.basicStore.select.split(',');
		const condition = store.basicStore.condition.split(',');

		if(!~this.exceptGroup.indexOf(storeNm.group)) {
			this.exceptGroup.push(storeNm.group);
			this.exceptCondition.push(storeNm.condition);
		}
		for(let i=0; i<select.length; i++) {
			if(~this.exceptGroup.indexOf(select[i])) {
				select.splice(i, 1);
				condition.splice(i, 1);
			}
		}

		this._store.exceptResult({
			exGroup: this.exceptGroup,
			exCond: this.exceptCondition,
			select: select,
			condition: condition
		});
		for(let data of this.datasource) {
			if(~this.exceptGroup.indexOf(data.group)) {
				data.except = true;
			} else {
				data.except = false;
			}
		}
	}
	
	// 조건제외 취소
	exceptWorkflowCancel(event: MouseEvent, storeNm: any) {
		event.preventDefault();
		console.log(storeNm);
		
		const store = Object.assign({}, this.storeVo);
		const select = store.basicStore.select.split(',');
		const condition = store.basicStore.condition.split(',');
		console.log(this.selectGroup);

		const idx = this.selectGroup.indexOf(storeNm.group);

		Array.from(this.exceptGroup).forEach((group, index) => {
			if(group === storeNm.group) {
				this.exceptGroup.splice(index, 1);
				this.exceptCondition.splice(index, 1);
			}
		});
		select.splice(idx, 0, storeNm.group);
		condition.splice(idx, 0, storeNm.condition.toLowerCase());

		this._store.exceptResult({
			exGroup: this.exceptGroup,
			exCond: this.exceptCondition,
			select: select,
			condition: condition
		});
		for(let data of this.datasource) {
			if(~this.exceptGroup.indexOf(data.group)) {
				data.except = true;
			} else {
				data.except = false;
			}
		}
	}
	// 리셋
	resetStore(param: any): void {
		const modalRef = this._modalService.open(RefreshModal);
		modalRef.componentInstance.data = '';
		modalRef.result.then((result) => {
			if(result === 'yes') {
				this._service.cancelJob().subscribe(res => {
					if (param === 'home') {
						this._store.resetStore('home'); // 스토어 리셋
					} else {
						this._store.resetStore('reset'); // 스토어 리셋
					}
				}); // Job 취소

				this._store.exProgress = null;
			}
		}, (reason) => {
			this.closeResult = `Dismissed ${reason}`;
		});	
	}
	// 쿼리 실행
	runQuery() {
		// if (this.runnable) {
			this._store.exProgress = null;
		
			if (this._store.store.basicStore.select) {
	
				this._store.getWorkProgress();
	
				setTimeout(() => {
					this._service.getExecute().subscribe(res => {
						this._func.setRunQuery(true);
						this._func.setCreatePatient(true);
		
						if (this._router.url.indexOf('interim') < 0) {
							this._router.navigateByUrl(`/tempAuth.do/basicmode/result/interim/${this.initPatient}`, { skipLocationChange: true });
						}
					});
				}, 100);
			}
		// } else {
		// 	notify('선택 결과가 입력되지 않은 주제 영역이 있습니다.', 'error', 3000);
		// }
	}
	
	// 쿼리 정지
	stopQuery() {
		this._service.cancelJob().subscribe(res => {
			this._func.setRunQuery(false);
			this._router.navigateByUrl('/tempAuth.do/basicmode/condition', { skipLocationChange: true });
		});
	}

	// Run Query 가능 여부 판단
	checkRun(store: any) {
		// console.log('[CHECK RUN STORE]', store);

		for (let item of Object.keys(store)) {
			if (item !== 'basicStore' && item !== 'finalResultStore') {

				// 욕창/낙상/환자분류는 select1 값이 없음
				if (item === 'nursAssessmentStore') {
					const assm = store.nursAssessmentStore;

					for (let assmItem of Object.keys(assm)) {
						if ('select1, name1, condition1, dept1, wrtDtSt, wrtDtEd'.indexOf(assmItem) > -1) {
							continue;
						} else {
							if (assm[assmItem] !== null || assm[assmItem] !== '') {
								this.runnable = true;
							} else {
								this.runnable = false;
							}
						}
					}
				// 오더는 FREETEXT만 선택해도 Run Query 실행 가능함
				} else if (item === 'orderStore') {
					const free = this._store.store[item].freeText;
					const select = this._store.store[item].select1;

					if ((select && select.length > 0) || (free && free.length > 0)) {
						this.runnable = true;
					} else {
						this.runnable = false;
					}

				} else if (item === 'concernPatientStore') {
						const uploadYN = this._store.store[item].uploadYN;
						const select = this._store.store[item].select1;

						if ((select && select.length > 0) || (uploadYN && uploadYN === 'Y')) {
							this.runnable = true;
						} else {
							this.runnable = false;
						}
				}else {
					const select = this._store.store[item].select1;

					if (select && select.length > 0) {
						this.runnable = true;
					} else {
						this.runnable = false;
						break;
					}
				}
			} else {
				const category = this._store.store.basicStore.select;
				if (category === null || category === '') {
					this.runnable = false;
				}
			}
		}
	}
}
