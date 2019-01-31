import { Component, ViewChild, OnInit } from '@angular/core';
import { Router, ChildrenOutletContexts } from '@angular/router';
// import { browser, element, by } from 'protractor';
import notify from 'devextreme/ui/notify';

import { TranslateService } from '@ngx-translate/core';

import { DiagramService } from '../diagram.service';
import { DiagramFunc } from '../diagram.func';
import { ItemListState } from '../../item-list.state';
import { PowermodeStoreService } from '../store/store.service';
import { ResultService } from '../patientlist/result.service';
import { DiagramState } from '../diagram.state';
import { AppService } from '../../app.service';
import { AppFunc } from '../../app.func';
import { ScenarioService } from '../scenario/scenario.service';

import * as Model from '../model/diagram.model';

declare const $: any;
import * as _ from 'lodash';
import * as backbone from 'backbone';
import * as joint from 'jointjs';
import { V, g, dia, shapes, util, layout } from 'jointjs'
import { IfObservable } from 'rxjs/observable/IfObservable';
import { FUNCTION_TYPE } from '@angular/compiler/src/output/output_ast';
import { find } from 'rxjs/operator/find';

@Component({
 	selector: 'paper-layout',
	templateUrl: './paper.component.html',
})
export class PaperComponent implements OnInit  {
	@ViewChild('sideBar') sideBar;

	workMode: string = 'edit';

	isMenuCollapsed: boolean = true;
	loading: boolean = false;
	secondaryHeight: number;
	message: string;
	isCondition: boolean = true;
	headLine: string;
	headLineOld: string;

	graph = new joint.dia.Graph();
	paper: any;
	selectionCell: any;
	selectionDataCell: Model.SelectData = null;
	selectionLink: any;
	cellClone: any;

	cellWidth = 250;
	cellHeight: number = 75;
	folderWidth: number = this.cellWidth + 20;
	storeVo: any;
	updateStoreVo: any;
	isFilter: boolean = false;
	config: any;
	focusInput: boolean = false;

	detectEditMode: string = 'P'; //Edit Mode 'P', Outpur Item 'A'
	addItemList: {dataSource: any; categoryGroup: any[]; seq: string} = {dataSource: [], categoryGroup: [], seq: 'P'};
	ptInfoList: {patient: number; upload: number} = {
		patient: null, 
		upload: null
	};
	// 화면확대 비율 select menu
	screenOption: {name: string; value: number}[] = [
		{name: '60%', value: 0.6},
		{name: '70%', value: 0.7},
		{name: '80%', value: 0.8},
		{name: '90%', value: 0.9},
		{name: '100%', value: 1.0},
		{name: '110%', value: 1.1},
		{name: '120%', value: 1.2},
		{name: '130%', value: 1.3},
		{name: '140%', value: 1.4},
		{name: '150%', value: 1.5},
	];
	screenRateNum: number = 1.0;

	constructor(
		private _translate: TranslateService,
		private _func: AppFunc,
		private _router: Router,
		private _service: DiagramService,
		private _result: ResultService,
		private _store: PowermodeStoreService,
		private _appService: AppService,
		private _queryService: ScenarioService
	) {
		sessionStorage.setItem('currentUrl', this._router.url);
	}
	ngOnInit(): void {
		const path = sessionStorage.getItem('currentUrl');

		const store = JSON.parse(sessionStorage.getItem('powermodeStore'));
		if(store) {
			this.storeVo = store;
		} else {
			this.storeVo = this._store.store;
		}		

		if(path && !~path.indexOf('basicmode')) {
			this._router.navigateByUrl(path, { skipLocationChange: true });
		} else {
			this._router.navigateByUrl("/tempAuth.do/powermode/paper", { skipLocationChange: true });
        }

		this._service.getCurUrl('paper');
		sessionStorage.setItem('prevLink', 'condition');

		// 환자명단 업로드 내역이 있을 경우, 카드에 표시
		if(this._store.store.basicStore.uploadPatients) {
			this.ptInfoList.upload = this._store.store.basicStore.uploadPatients.split(',').length;
		}

		// 언어 변경
		this._translate.use(this._appService.langInfo);
		this._appService.language$.subscribe(res => {
			this._translate.use(res);
			this.requestItemList(this.detectEditMode);
		});
		// 모드 변경 감지
		this._appService.switchStore$.subscribe(res => {
			this.storeVo = res;
			this._store.setStore = res;
		});

		//작업 단계 구독 
		this._service.stateWork$.subscribe(res => {
			// mode: run, upload, edit, output, finalRun, final
			this.workMode = res.mode;
			switch(res.mode) {
				case 'edit':
					this.editMode();
					break;
				case 'run':
					this.runQuery();
					break;
				case 'upload':
					this.runQuery();
					break;
				case 'output':
					this.outputItems();
			}
		});	
		// 페이퍼 클리어 여부 구독
		this._service.paperClear$.subscribe(res => {
			if(res) {
				this.clearPaper();
			}
		})

		setTimeout(() => {
			this.loadPaper();
		}, 10);

		// 키보드 제어
		document.addEventListener('keydown', (event) => {
			// Delete
			if(event.keyCode === 46) {
				this.deleteCell();
			}
		});
		if(store) {
			this.headLine = store.basicStore.queryFlowNm;
			this.headLineOld = store.basicStore.queryFlowNm;
        }

		// 스토어 변경여부 구독
		this._store.storeVo$.subscribe(res => {
			console.log(res);
			this.storeVo = res;
			this.headLine = res.basicStore.queryFlowNm;
			this.headLineOld = res.basicStore.queryFlowNm;
		});
		// 스토어 업데이트 내역 구독
		this._store.updateStoreVo$.subscribe(res => {
			if(res.data.uploadPatients) {
				this.updateSelectStore(res, 'upload');
			} else {
				this.updateSelectStore(res, 'restore');
			}
		});
		// 필터 선택여부 구독
		this._service.selectionData$.subscribe(res => {
			if(res.isEditable) {
				// this.isProperty = true;
				this.selectionDataCell = res.selectionDataCell;
			}
		});
		this.requestItemList(this.detectEditMode);

		// 키보드 제어
		document.querySelector('body').addEventListener('keydown', (event) => {
			if(event.ctrlKey) {
				switch(event.keyCode) {
					case 67 : this.copyCell(); break; //Ctrl + C
					case 86 : this.pasteCell(); break;  //Ctrl + V
				}
			}
		});

		// $('.btn-wordindex').on('click', function() {
		// 	$(this).closest('.wordindex').find('input').addClass('active');
		// });
	}
	// Run Query
	runQueryAct(): void {
		const store = Object.assign({}, this._store.store);
		if(this._store.validateStore()) {
			this._service.setStateWork({ mode : 'run' });
			this._result.excutePatient().subscribe(res => {

			});
		}
	}
	// Stop Query
	stopQuery(): void {
		this._result.cancelJob().subscribe(res => {
			console.log(res);
            this._service.setStateWork({ mode : 'edit' });
        });
	}
	// 리셋 스토어
    resetStore(): void {
        this._service.setIsReset(true);
    }

	// 최종결과 테이블 보기
	viewResultTable(): void {
        this._service.setStateWork({mode: 'final'});
	}

	// Add Item List  호출
	requestItemList(seq: string): void {
		this._service.addItemList(seq).subscribe(res => {
			const store = this._store.store;
			const clone = res.slice(0);
			const category: string[] = [];
			this.addItemList.dataSource = clone;
			this.addItemList.categoryGroup = [];
			this.addItemList.seq = seq;

			this.sideBar.collapsePanel();

			for(let cate of res) {
				if(cate.ctgCd && !~category.indexOf(cate.ctgCd)) {
					category.push(cate.ctgCd);
					this.addItemList.categoryGroup.push({ctgCd: cate.ctgCd, ctgNm: cate.ctgNm});
				}
			}
			if(!this.paper) {
				this.loadPaper();
				setTimeout(() => {
					this.prepareDraw(this.storeVo);
				}, 100);
			} else {
				if(seq === 'P' && !this.paper.model.get('cells').models.length) {
					this.prepareDraw(this.storeVo);
				}
			}
			this._service.setShareItemList(this.addItemList);
		});
	}
	// 제목 타이틀에 포커스 생성 시
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
	// 시나리오 제목 수정
	changeHeadline(event): void {
        this._store.shareBasicDefault({queryFlowNm: event});
        setTimeout(() => {
            const scNm = this._store.store.basicStore.queryFlowNm;
            const scId = this._store.store.basicStore.queryFlowId;
            this._queryService.editQuery(scId, scNm).subscribe(res => {});
        }, 10);
    }
	// 카드 스킨 설정
	getSkin(data: string): string {
		let color: string;
		switch(data) {
			case 'ptInfo': color = 'khaki'; break;
			case 'visit': color = 'yellow'; break;
			case 'diagnosis': color = 'green'; break;
			case 'exam': color = 'purple'; break;
			case 'medicine': color = 'orange'; break;
			case 'order': color = 'magenta'; break;
			case 'fee': color = 'dark-green'; break;
			case 'surgical': color = 'dark-purple'; break;
			case 'cc': color = 'blue'; break;
			case 'form': color = 'sky'; break;
			case 'pathology': color = 'cyon';break;
			case 'nursEav': color = 'pink'; break;
			case 'nursState': color = 'pink'; break;
			case 'nursAssm': color = 'pink'; break;
			default: color = 'blue';
		}
		return color;
	}
	loadPaper(): void {
		// 윈도우 크기 계산
		const sidebar = document.querySelector('.powermode-sidebar').clientWidth + 40;
		const right = document.querySelector('.right-component').clientWidth;
		const store = this._store;
		const graph = this.graph;

		// editor 크기 세팅
		const canvas = $('.editor-area');
		joint.shapes['html'] = {};

		// html Joint element 세팅 //포트 설정
		joint.shapes['html'].Element = joint.shapes.devs.Model.extend(_.extend({},joint.shapes.basic.Rect,{
			markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',
			// portMarkup: '<g class="port"><circle class="port-body"/><text class="port-label"/></g>',
			defaults: joint.util.deepSupplement({
				type: 'html.Element',				
				ports: {
					// 연결선 포트 설정
					groups: {
						'in': {
							attrs: {
								'.port-body': {
									stroke: '#89898a', strokeWidth: '3', r: '6', fill: 'yellow',
									magnet: 'passive'
								}
							}
						},
						'out': {
							attrs: {
								'.port-body': {
									stroke: '#89898a', strokeWidth: '3', r: '6', fill: 'blue'
								}
							}
						}
					}
				},
				attrs: {
					'.body': { stroke: 'none', 'fill-opacity': 0 },
					'.label': {display:"none"}
				}
			}, joint.shapes.devs.Model.prototype.defaults)

		}));

		// 페이퍼 설정
		// https://resources.jointjs.com/tutorial/ports 참조
		this.paper = new joint.dia.Paper({
			el: $('#editorPowermode'),
			// width: canvas.width(),
			width: 4000,
			height: canvas.height() - 30,
			model: this.graph,
			gridSize: 1,
			linkPinning: false,
			multiLinks: false,

			defaultLink: new joint.dia.Link({
				attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' } },
				labels: [
					{ position: 0.5, attrs: { rect: { width: 38, height: 26 } }}
				],
				labelMarkup: [
					`<image xlink:href="assets/styles/images/AND.png" width="38" height="26" x="-19" y="-13" class="labels-condition" alt="" />`,
				].join('')
			}),
			interactive: {
				vertexAdd: false,
				vertexRemove: false,
				arrowheadMove: false
			},
			// 연결선 validattion
			validateConnection: (cellViewS, magnetS, cellViewT, magnetT, end, linkView) => {
				if (magnetS && magnetS.getAttribute('port-group') === 'in') {
					return false
				};
				// 같은 개체 참조일 경우 false
				if (cellViewS === cellViewT) {
					return false;
				};
				if(store.store.basicStore.select) {
					const select = store.store.basicStore.select.split(',');
					const source = `group_${cellViewS.model.cid}`,
						target = `group_${cellViewT.model.cid}`;
					// 같은 개체끼리 순환하여 연결하는 것 방지
					if(~select.indexOf(source) && ~select.indexOf(target)) {
						return false;
					}
					// inport에 두 개 이상의 연결 생성되는 것 방지
					if(select.indexOf(target) > 0) {
						return false;
					}
					// 불러온 쿼리에서 output에서 두 개 이상의 선이 나가서 연결되는 것 방지
					if(~select.indexOf(source) && select.indexOf(source) !== (select.length -1)) {
						return false;
					}
				}

				return magnetT && magnetT.getAttribute('port-group') === 'in';
			},
			// 연결선 자석 효과 설정
			validateMagnet: (cellView, magnet) => {
				let port = magnet.getAttribute('port');
				let links = this.graph.getConnectedLinks(cellView.model, { outbound: true });
				let portLinks = _.filter(links, function(o) {
					return o.get('source').port == port;
				});
				if(portLinks.length > 0) {
					return false;
				}
				return magnet.getAttribute('magnet') !== 'passive';
			},
			snapLinks: { radius: 75 },
			// markAvailable: true,
			clickThreshold: 1
		});

		$(window).resize(() => {
			this.paper.setDimensions(canvas.width(), canvas.height());
		});

		// html 엘리먼트 세팅
		// https://resources.jointjs.com/tutorial/html-elements 참조
		joint.shapes['html'].ElementView = joint.shapes.devs['ModelView'];
		joint.shapes['html'].ElementView = joint.dia.ElementView.extend({
			template: [].join(''),

			initialize: function() {
				_.bindAll(this, 'updateBox');
				joint.dia.ElementView.prototype.initialize.apply(this, arguments);

				this.$box = $(_.template(this.model.get('template'))()); //box의 html	

				this.model.on('change', this.updateBox, this);
				this.model.on('remove', this.removeBox, this);

				let groupId;
				let typeofChild;
				if(this.model.get('children')) {
					typeofChild = this.model.get('children');
				} else {
					typeofChild = this.model.get('childrenGroup');
				}

				let newCid;
				for(let child of typeofChild) {
					if(child.data.item) {
						if(child.data.groupId) {
							groupId = child.data.groupId;
						}
					}
				}
				if(groupId) {
					this.model.cid = groupId.split('_')[1];
				} else {
					let arr = [];
					for(let cell of graph.getElements()) {
						arr.push(cell.cid.replace('c',''));
					}
					this.model.cid = `c${Math.max(...arr) + 1}`;
				}

				// 스토어 업데이트
				const storeTxt = {
					groupId : `group_${this.model.cid}`,
					groupNm: this.model.get('title'),
					category : [
						this.model.get('group')
					],
					item : [],
					size: JSON.stringify(this.model.get('size')),
					position: JSON.stringify(this.model.get('position')),
					filter: []
				}
				store.addGroupStore(storeTxt, this.model.get('update'));
				this.updateBox();
			},
			render: function() {
				joint.dia.ElementView.prototype.render.apply(this, arguments);
				this.paper.$el.prepend(this.$box);
				this.updateBox();
				return this;
			},
			updateBox: function() {
				let bbox = this.model.getBBox();
				let htmlStr = '', htmlGroupStr = '';

				let groupId;
				let typeofChild;
				if(this.model.get('children')) {
					typeofChild = this.model.get('children');
				} else {
					typeofChild = this.model.get('childrenGroup');
				}

				for(let child of typeofChild) {
					if(child.data) {
						if(child.data.groupId) {
							groupId = child.data.groupId;
						}
					}
				}
				if(groupId) {
					this.model.cid = groupId.split('_')[1];
				}
				// 소그룹
				if(this.model.get('children')) {
					// html 생성
					this.$box.find('label').html(`
						<span class="input-material wordindex">
							<input type="text"
								value="${this.model.get('title')}" readonly>
							<button type="button" class="btn btn-sm btn-transparent text-white">
								<i class="fal fa-pencil" aria-hidden="true"></i>
							</button>
						</span>
					`);

					for(let key of this.model.get('children')) {
						htmlStr += `
							<div class="bx"
								data-ctg-cd="${key.group}"
								data-item-nm="${key.title}"
								data-item-cd="${key.code}"
								data-filter-type="${key.filter}"><i class="bar"></i>
								<button type="button"
									class="float-right btn btn-xs btn-text-type btn-delete-item">
									<i class="fal fa-times" aria-hidden="true"></i>
									<span class="sr-only">Delete</span>
								</button>
								<h5>${key.title}</h5>
								<p class="word-index">${key.select}</p>
							</div>`;
					}

					this.$box.find('.box-item').html(htmlStr);
					this.$box.addClass(this.model.get('skin'));
					
					// 하위그룹 추가시 스토어 변경
					this.updateStore({
						idx: `group_${this.model.cid}`,
						children: this.model.get('children'),
						size: { width: bbox.width, height:bbox.height },
						position: { x: bbox.x, y: bbox.y},
						update: this.model.get('update')
					});
					this.resize(bbox.width, bbox.height);
				}
				// 대그룹
				else if(this.model.get('childrenGroup')) {
					const groupList: string[] = [];
					let color = 'green';
					// html 생성
					this.$box.find('label').html(`
						<span class="input-material wordindex">
							<input type="text" class="group"
								value="${this.model.get('title')}" readonly>
							<button type="button" class="btn btn-sm btn-transparent">
								<i class="fal fa-pencil" aria-hidden="true"></i>
							</button>
						</span>
					`);

					this.$box.find('.box-group').html('');
					for(let key of this.model.get('childrenGroup')) {
						if(!~groupList.indexOf(key.group)) {
							let color: string;
							groupList.push(key.group);

							switch(key.group) {
								case 'ptInfo': color = 'cyon'; break;
								case 'visit': color = 'yellow'; break;
								case 'diagnosis': color = 'green'; break;
								case 'exam': color = 'purple'; break;
								case 'medicine': color = 'orange'; break;
								case 'order': color = 'magenta'; break;
								case 'fee': color = 'dark-green'; break;
								case 'surgical': color = 'dark-purple'; break;
								case 'cc': color = 'blue'; break;
								case 'form': color = 'sky'; break;
								case 'nurs': color = 'cyon'; break;
								default: color = 'blue';
							}
							this.$box.find('.box-group').append(`
								<div class="html-element ${color}">
									<label>
										${key.label}
									</label>
									<div class="box-item" data-group-name="${key.group}">
										<div class="bx"
											data-ctg-cd="${key.group}"
											data-item-nm="${key.title}"
											data-item-cd="${key.code}"
											data-filter-type="${key.filter}"><i class="bar"></i>
											<button type="button"
												class="float-right btn btn-xs btn-text-type btn-delete-item">
												<i class="fal fa-times" aria-hidden="true"></i>
												<span class="sr-only">Delete</span>
											</button>
											<h5>${key.title}</h5>
											<p class="word-index">${key.select}</p>
										</div>
									<div>
								</div>`);
						} else {
							this.$box.find(`[data-group-name=${key.group}]`).append(
								`<div class="bx"
									data-ctg-cd="${key.group}"
									data-item-nm="${key.title}"
									data-item-cd="${key.code}"
									data-filter-type="${key.filter}"><i class="bar"></i>
									<button type="button"
										class="float-right btn btn-xs btn-text-type btn-delete-item">
										<i class="fal fa-times" aria-hidden="true"></i>
										<span class="sr-only">Delete</span>
									</button>
									<h5>${key.title}</h5>
									<p class="word-index">${key.select}</p>
								</div>`
							);
						}
					}
					// 하위그룹 추가시 스토어 변경
					this.updateStore({
						idx: `group_${this.model.cid}`,
						children: this.model.get('childrenGroup'),
						size: { width: bbox.width, height:bbox.height },
						position: { x: bbox.x, y: bbox.y},
						update: this.model.get('update')
					});
				}
				// html 위치 및 크기 값 업데이트
				this.$box.css({
					width: bbox.width,
					height: bbox.height,
					left: bbox.x,
					top: bbox.y,
					opacity: 1,
					transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
				});

				// 개체 클릭시 데이터 호출
				this.$box.find('.bx').on('click', (event) => {
					event.stopPropagation();
					const tar = event.target;
					$('.bx').removeClass('active');
					console.log('개체 클릭시 데이터 호출',this.model);					
					
					if(tar.tagName === 'H5' || tar.tagName === 'P') {
						// 제목이나 텍스트를 클릭했을 경우
						const index = this.$box.find('.bx').index(event.target.parentNode);
						this.requestData(tar.parentNode.dataset, this.model, index);
						event.target.parentNode.classList.add('active');
					} else if(tar.tagName === 'BUTTON' || tar.tagName === 'I') {
						// 닫기 버튼 클릭했을 경우 개체 삭제
						this.removeItem(tar.parentNode.dataset.itemCd);
					} else {
						// 상자 내 여백을 클릭했을 경우
						const index = this.$box.find('.bx').index(event.target);
						this.requestData(tar.dataset, this.model, index);
						event.target.classList.add('active');
					}
				});

				// 레이블 클릭시 글자 편집 가능토록 변경
				this.$box.find('.wordindex > button').click(function(event) {
					event.stopPropagation();
					let target = $(this).prev('input');
					target.addClass('focus');
					target.attr('readonly', false);
				});
				this.$box.find('.wordindex > input')
					.focusout(function() {
						$(this).removeClass('focus');
						$(this).attr('readonly', false);
					})
					.change(_.bind((event) => {
						this.model.set('title', $(event.target).val());
						this.updateLabel({idx: `group_${this.model.cid}`, label: $(event.target).val()});
					}, this));

				// 상자 두 개가 겹치면 흐리게 처리
				this.model.get('overlap') ? this.$box.css('opacity', 0.5) : this.$box.css('opacity', 1);

				// 상자 클릭해서 선택시 바깥에 그림자 효과
				if(this.model.get('select')) {
					this.model.get('childrenGroup') ? this.$box.find('.box-group').css('box-shadow', '0 0 10px #888') : this.$box.css('box-shadow', '0 0 10px #888');
				} else {
					this.model.get('childrenGroup') ? this.$box.find('.box-group').css('box-shadow', 'none') : this.$box.css('box-shadow', 'none');
				}
			},
			// 상자 레이블 업데이트
			updateLabel: ({idx, label}) => {
				this.updateLabel({idx, label});
			},
			// 상자 내용 변경시 스토어 업데이트
			updateStore: ({idx, children, size, position, update}: Model.storeParam) => {
				this.updateStore({idx, children, size, position, update});
			},
			// 선택한 상자 정보 업데이트
			updateSelect: (val) => {
				this.selectionDataCell = val;
			},
			// 상자 삭제
			removeBox: function(evt) {
				store.removeGroupStore(`group_${this.model.cid}`);
				this.updateSelect(null);
				this.$box.remove();
			},
			// 그룹에서 선택 상자 삭제
			removeItem: function(code: string) {
				
				let children;
				if(this.model.get('children')) {
					children = this.model.get('children');
				} else {
					children = this.model.get('childrenGroup');
				}

				if(children.length === 1) {
					this.model.remove();
				} else {
					for(let i=0; i<children.length; i++) {
						if(code === children[i].code) {
							children.splice(i, 1);
							break;
						}
					}
				}
				this.updateSelect(null);

				this.model.resize(this.model.get('size').width, this.model.get('size').height - 75);
				this.updateBox();
			},
			// 상자내 셀 클릭했을 경우 해당 데이터 호출해서 Property 창에 보여줌
			requestData: (param: any, model: any, index: number) => {
				let type: string;
				// this.selectionDataCell 정보를 Property 창으로 보냄
				this.selectionDataCell = {
					id: `group_${model.cid}`,
					index: index,
					ctgCd: param.ctgCd,
					itemNm: param.itemNm,
					itemCd: param.itemCd,
					filterType: param.filterType,
					isFilter: false,
					children: model.get('children') ? model.get('children') : model.get('childrenGroup')
				}
			}
		});

		// paper에 개체 드래그 앤 드랍하여 상자 추가
		$( "#editorPowermode" ).droppable({
			// tolerance:'pointer',
			drop: ( event, ui ) => {
				const store = this._store.store;
				if(event.target.id === 'editorPowermode' && this.detectEditMode === 'P') {
					let posx = ui.offset.left;
					let posy = ui.offset.top;
					let data = ui.helper[0].dataset;
					let isPtInfo = store.groupInfoListStore.filter(obj => {
						return ~obj.category.indexOf('ptInfo');
					});

					if(data.itemCd) {
						if(data.itemCd === 'ptNo' && isPtInfo.length) {
							// 환자기본정보 두 개 이상 추가시 경고. 환자정보는 paper 에 한 개만 존재해야 함.
							notify(this._translate.instant('renewal2017.p.alert-ptlist'), 'error', 2000);
						} else {
							// 환자정보가 중복된 경우가 아닐 경우, 화면에 상자 추가
							this.addCell('new', {
								x: posx,
								y: posy,
								height: null,
								title: data.ctgNm,
								data: [{
									title: data.itemNm,
									group: data.ctgCd,
									label: data.ctgNm,
									code: data.itemCd,
									filter: data.filterType,
									select: '',
									data: {}
								}]
							});							
						}
					}
				}
			}
		});
		let removeFocus = function() {
			$('input.focus').each(function() {
				$(this).removeClass('focus');
				$(this).blur();
			});
		};
		// 그룹화
		this.paper.on({
			'cell:pointerclick': (cellView, evt, x, y) => {
				// And, Or 아이콘 클릭시
				if (cellView.model.isLink()) {
					this.selectionLink = cellView;
					this.setCondtion(cellView, evt);
				}
			},
			'cell:pointerup': (cellView, evt, x, y) => {
				// 셀에서 마우스를 뗐을 경우
				this._store.shareStore(); //스토어 업데이트
				this.selectObject(cellView);
				this.createGroup(cellView.model, evt, x, y); //두 개 이상의 상자를 합쳐서 그룹으로 만드는 것.
				removeFocus();
			},
			'blank:pointerclick': (event) => {
				// paper의 빈 영역을 클릭했을 경우
				this.deSelectObject();
				removeFocus();
			},
			// 'blank:pointerdown': function(event) {
			// 	$( "#editorPowermode" ).css('cursor', 'grabbing');				
			// },
			// 'blank:pointerup': function(event) {
			// 	$( "#editorPowermode" ).css('cursor', 'grab');				
			// }
		});

		$('.inner-property-area').on('mousedown keypress', () => {
			// Property 영역을 마우스로 클릭하거나 키보드 이벤트를 발생시켰을 경우 상자 선택 해제
			this.deSelectObject();
		});
		// AND, OR 조건 클릭
		$('.setConditionAnd').on('click', () => {
			this.setConditionAction(this.selectionLink, 'AND');
		});
		$('.setConditionOr').on('click', () => {
			this.setConditionAction(this.selectionLink, 'OR');
		});

		this.setGroupProperty();
	}
	// 선택결과 리셋. Run query 했을 경우 모든 선택효과 해제. Property 내용도 리셋.
	resetSelect(): void {
		this.selectionDataCell = null;
		let bxList = document.querySelectorAll('.bx');
		Array.from(bxList).forEach(obj => {
			obj.classList.remove('active');
		});
	}
	// 좌측메뉴 더블클릭하여 paper에 상자 추가
	addCellByClick(data: any): void {
		this.addCell('new', {
			x: 400,
			y: 100,
			height: null,
			title: data.ctgNm,
			data: [{
				title: data.itemNm,
				group: data.ctgCd,
				label: data.ctgNm,
				code: data.itemCd,
				filter: data.filterType,
				select: '',
				data: {}
			}]
		});
	}

	// 셀 복사
	copyCell(): void {
		if(this.selectionCell) {
			this.cellClone = this.selectionCell;
		}
	}
	// 셀 붙여넣기
	pasteCell(): void {
		if(this.cellClone) {
			const cell = JSON.parse(JSON.stringify(this.cellClone.model));

			let children;
			if(cell.children) {
				children = cell.children;
			} else {
				children = cell.childrenGroup;
			}
			for(let child of children) {
				child.data.groupId = `${child.data.groupId}0`;
			}
			if(cell.children) {
				// 소그룹일 경우 상자 추가
				this.addCell('new', {
					x: cell.position.x + (this.cellWidth * 2) + 100,
					y: cell.position.y + 150,
					height: cell.size.height,
					title: cell.title,
					data: children
				});
			} else {
				// 대그룹일 경우 그룹 추가
				this.addGroup('new', {
					x: cell.position.x + (this.cellWidth * 2) + 150,
					y: cell.position.y + 150,
					height: cell.size.height,
					title: cell.title,
					data: children
				});
			}
		}
	}
	// 화면확대/축소
	screenRate(seq: string): void {
		let i = Number($('#editorPowermode').css('zoom'));
		switch(seq) {
			case 'plus':
				i += 0.1;
				break;
			case 'minus':
				i -= 0.1;
				break;
		}
		$('#editorPowermode').css({'zoom': i });
		this.screenRateNum = i;
	}
	// 화면 비율 지정
	setScreenRate(val: number): void {
		$('#editorPowermode').css({'zoom': val });
		this.screenRateNum = val;
	}
	// 스토어 내용 화면에 그릴 준비
	prepareDraw(store: any): void {
		if(store.groupInfoListStore && store.groupInfoListStore.length) {
			this.drawStore(store);
		}
	}
	// 스토어 내용 화면에 구현
	drawStore(store: any): void {
		this.graph.clear();
		const condition = store.basicStore.condition.split(',');
		let selectGroup = [];
		for(let key of store.groupInfoListStore) {
			selectGroup.push(key.groupId);
		}
		Array.from(selectGroup).forEach((sel, selIndex) => {
			const group = store.groupInfoListStore.filter(obj => {
				return obj.groupId === sel;
			});
			let arr = [];
			let children = [];
			for(let ctg of group[0].category) {
				if(!~arr.indexOf(ctg)) {
					arr.push(ctg);
				}
			}
			for(let cate of group[0].category) {
				children.push({
					title: '',
					group: cate,
					label: '',
					code: ''
				});
			}

			let cell;
			let size = JSON.parse(group[0].size);
			let position = JSON.parse(group[0].position);
			let initx;
			let inity;
			if(arr.length > 1) {
				initx = parseInt($('.powermode-sidebar').width()) + 30;
				inity = parseInt($('.az-navbar').height()) + 70;
			} else {
				initx = parseInt($('.powermode-sidebar').width());
				inity = parseInt($('.az-navbar').height()) + 25;
			}

			cell = {
				x: position ? position.x + initx : 30 + initx + (330 * selIndex),
				y: position ? position.y + inity : 30 + inity,
				height: size? size.height : 45 + (75 * group[0].item.length),
				title: group[0].groupNm,
				data: []
			};
			let itemSet: any[] = [];
			let filterset: any = [];
			let reduceFrame = group[0].item.map((obj, index) => {
				return {
					item: obj,
					category: group[0].category[index],
					groupId: group[0].groupId
				};
			});

			let isDuplicate = false;
			let uniq = reduceFrame;
			let uniqWidh = uniq = this._func._func_uniqBy(reduceFrame, 'item');

			Array.from(uniqWidh).forEach((item, index) => {
				let childset;
				for(let filter of group[0].filter) {
					if(Object.getOwnPropertyNames(filter).length) {
						if(filter.item === item['item'] && filter.category === item['category']) {
							filterset.push(filter);
						}
					} else {
						filterset.push({
							category: item['category'],
							item: item['item'],
							groupId: item['groupId']
						});
					}
				};
			});

			Array.from(filterset).forEach((filter, index) => {
				const children = this.addItemList.dataSource.filter(obj => {
					return (filter['item'] === obj.itemCd) && (filter['category'] === obj.ctgCd);
				});
				for(let child of children) {
					cell.data.push({
						title: child.itemNm,
						group: child.ctgCd,
						label: child.ctgNm,
						code: child.itemCd,
						filter: child.filterType,
						select: '',
						data: filter
					});
				}
			});

			if(arr.length > 1) {
				// 그룹일 경우 그룹 추가 및 업데이트
				this.addGroup('update', cell);
			} else {
				// 그룹 아닐 경우 상자 추가 및 업데이트
				this.addCell('update', cell);
			}

			setTimeout(() => {
				_.forEach(cell.data, (item, index) => {
					if(item.data) {
						// 상자 로드 후 데이터 선택 내역 표기
						this.updateSelectStore({
							ctgCd: item.group,
							data: item.data,
							filterType: item.filter,
							id: group[0].groupId.split('_')[1],
							index: index,
							itemCd: item.code
						}, 'open');
					}
				});
			}, 10);
		});
		// 연결선 있을 경우 연결선 설정
		if(store.basicStore.select) {
			const select = store.basicStore.select.split(',');
			select.reduce((prev, curr, index) => {
				let prevElem, currElem;

				this.graph.getElements().forEach((elem) => {
					let typeofChild;
					if(elem.get('children')) {
						typeofChild = elem.get('children');
					} else {
						typeofChild = elem.get('childrenGroup');
					}

					if(typeofChild[0].data.groupId === prev) {
						prevElem = elem.id;
					} else if(typeofChild[0].data.groupId === curr) {
						currElem = elem.id;
					}
				});
				if(condition[index]) {
					// 연결선 정보 변수 저장
					let line = new joint.dia.Link({
						source: { id: prevElem },
						target: { id: currElem },
						router: { name: 'manhattan' },
						connector: { name: 'rounded' },
						attrs: { '.connection': { 'stroke-width': 1, 'stroke': '#8f8e94' } },
						labels: [
							{ position: 0.5, attrs: { rect: { width: 38, height: 26 } }}
						],
						labelMarkup: [
							`<image xlink:href="assets/styles/images/${condition[index].toUpperCase()}.png" width="38" height="26" x="-19" y="-13" class="labels-condition" alt="" />`,
						].join('')
					});
					// 연결선 그리기
					this.graph.addCell(line);
				}

				return curr;
			});
		}
	}
	// 페이퍼 클리어
	clearPaper(): void {
		this.graph.clear();
		// this.paper.remove();
	}

	// 레이블 업데이트
	updateLabel({idx, label}): void {
		this._store.changeLabel({idx, label});
	}
	// 스토어 업데이트
	updateStore({idx, children, size, position, update}: Model.storeParam): void {	
		this._store.updateStore({idx, children, size, position, update});

		// 에디터에 개체가 있는지 없는지 체크
		if(this.paper.model.get('cells').models.length) {
			this._service.setIsEditing(false);
		} else {
			this._service.setIsEditing(true);
		}
	}
	// 스토어 업데이트 내역 카드에 반영
	updateSelectStore(param: any, seq: string) {		
		// console.log('카드에 내용반영', param, seq);
		this.graph.getElements().forEach((elem) => {
			let text = [];
			let children;
			switch(param.filterType) {
				case 'LT':
					if(param.data.selectCd && param.data.selectCd.length) {
						text = [`
							${param.data.selectCd.split('|||').length}${this._translate.instant('common.cnt')} ${param.data.condition === 'and' ?
							this._translate.instant('renewal2017.inclusion') : this._translate.instant('renewal2017.exclusion')}							
						`];
					} else {
						text = [''];
					};
					break;
				case 'PTLIST':
					text = [];
					if(param.data.selectCd && param.data.selectCd.length) {
						this.ptInfoList.patient = param.data.selectCd.split('|||').length;
					} 
					else if(param.data.uploadPatients && param.data.uploadPatients.length) {
						this.ptInfoList.upload =  param.data.uploadPatients.split(',').length;
					}

					if(this.ptInfoList.patient ||  this.ptInfoList.upload) {
						if(this.ptInfoList.patient) {
							text.push(`
								${this._translate.instant('renewal2017.concern-patient.title')} 
								${this.ptInfoList.patient ? this.ptInfoList.patient : '0'}${this._translate.instant('common.cnt')}
							`);
						} else {
							text.push('');
						}

						if(this.ptInfoList.upload) {
							text.push(`
								${this._translate.instant('renewal2017.label.upload-patient')} 
								${this.ptInfoList.upload ? this.ptInfoList.upload : '0'}${this._translate.instant('common.cnt')}
							`);
						} else {
							text.push('');
						}
					} else {
						text = ['']; 
					};
					break;
				case 'DATE':
					if(param.data.fromDt) {
						if(param.data.gubun === 'range') {
							if (param.data.toDt === null || param.data.toDt === '') {
								text = [`${param.data.fromDt} ~ 9999-12-31`];
							} else {
								text = [`${param.data.fromDt} ~ ${param.data.toDt}`];
							}
						} else {
							let reference = this.addItemList.dataSource.filter(obj => {
								return obj.ctgCd === param.data.refCtgCd && obj.itemCd === param.data.refItemCd;
							});
							// 검사시행일 기준 0일부터 60일 이내
							if((Number(param.data.fromDt) || Number(param.data.fromDt) === 0) 
								&& Number(param.data.toDt)) {
								text = [`
									${reference[0].itemNm}
									${param.data.fromDt}${this._translate.instant('renewal2017.suffix.from')}
									${param.data.toDt}${this._translate.instant('renewal2017.suffix.to')}
								`];
							// 검사시행일 기준 60일 이내
							} else if((!Number(param.data.fromDt) && Number(param.data.fromDt) !== 0) 
								&& Number(param.data.toDt)) {
								text = [`
									${reference[0].itemNm}
									${this._translate.instant('renewal2017.label.reference')}
									${param.data.toDt}${this._translate.instant('renewal2017.suffix.to')}
								`];
							} else if(Number(param.data.fromDt) 
								&& (!Number(param.data.toDt) && Number(param.data.toDt) !== 0)) {
								text = [`
									${reference[0].itemNm}
									${param.data.fromDt}${this._translate.instant('renewal2017.suffix.from')}
									${this._translate.instant('renewal2017.button.all')}
								`];
							} else if(!Number(param.data.fromDt) && !Number(param.data.toDt)) {
								text = [`
									${reference[0].itemNm}
								`];
							} 
						}
					} else {
						text = [''];
					};
					break;
				case 'AGE':
					if(param.data.fromDt || param.data.toDt) {
						text = [`${param.data.gubun} ${param.data.fromDt} ~ ${param.data.gubun} ${param.data.toDt}`];
					} else {
						text = [''];
					};
					break;
				case 'CHECK':
					if(param.data.selectCd && param.data.selectCd.length) {
						text = [`${param.data.selectCd.split('|||').join(',')}`];
					} else {
						text = [''];
					};
					break;
				case 'RADIO':
					if(param.data.selectCd && param.data.selectCd.length) {
						text = [`${param.data.selectCd}`];
					} else {
						text = [''];
					};
					break;
				case 'FREETEXT':
					if(param.data.freeText && param.data.freeText.length) {
						text = ['FreeText'];
					} else {
						text = [''];
					};
					break;
				case 'PN':
					if(param.data.pn && param.data.pn.length) {
						let textArr = param.data.pn.replace('a','±').replace('p','+').replace('n','-');

						text = [textArr];
					} else {
						text = [''];
					};
					break;
				case 'YN':
					if(param.data.selectCd) {
						param.data.selectCd === 'Y' ? text = ['Yes'] : text = ['No'];
					} else {
						text = [''];
					};
					break;
				case 'RANGE':
					if(param.data.fromDt) {
						text = [`${param.data.fromDt} ~ ${param.data.toDt}`];
					} else {
						text = [''];
					};
					break;
				default: text = [''];
			}
			// 데이터 삭제되면 text도 빈값으로 처리
			if(!Object.getOwnPropertyNames(param.data).length) {
				if(param.filterType === 'PTLIST') {
					text.splice(0, 1);
				} else {
					text = [''];
				}
			}

			let typeofChild;
			if(elem.get('children')) {
				typeofChild = elem.get('children');
			} else {
				typeofChild = elem.get('childrenGroup');
			}

			Array.from(typeofChild).forEach((child, index) => {
				let displayData = () => {
				
					child['select'] = text.join('');
					if(seq === 'upload') {
						delete param.data.uploadPatients;
					}
					child['data'] = param.data;
			
					let cellView = this.paper.findViewByModel(elem);
					cellView.model.set('update', text.join(''));
					// 텍스트 반영 후 셀 업데이트
					cellView.model.set('position', {
						x:cellView.model.get('position').x + 0.0001,
						y:cellView.model.get('position').y
					});
				};
				
				if(Object.getOwnPropertyNames(param.data).length && (child['data'] && child['data'].groupId)) {
					if(child['data'].groupId === param.data.groupId) {
						if(seq === 'open') {
							if(JSON.stringify(child['data']) === JSON.stringify(param['data'])) {
								displayData();
							}
						} else {
							typeofChild[param.index]['select'] = text.join('');
							if(seq === 'upload') {
								delete param.data.uploadPatients;
							}
							typeofChild[param.index]['data'] = param.data;

							let cellView = this.paper.findViewByModel(elem);
							cellView.model.set('update', text.join(''));
							// 텍스트 반영 후 셀 업데이트
							cellView.model.set('position', {
								x:cellView.model.get('position').x + 0.0001,
								y:cellView.model.get('position').y
							});
						}
					}
				} else {
					if(elem.cid === param.id && index === param.index) {
						displayData();
					}
				}
			});
		});
	}

	// 상자 추가
	addCell(seq: string, item: any): void {
		if(item.data.length) {
			const posx = item.x;
			const posy = item.y;
			const data = item.data;
			const height = item.height;
			const title = item.title;

			let i = 0;
			i++;
			let newX = posx - parseInt($('.powermode-sidebar').width());
			let newY = posy - parseInt($('.az-navbar').height()) -25;
			let neweHeight = height ? height : 120;
			let isPtNo = false;
			if(item.data[0].code === 'ptNo' && item.data[0].group === 'ptInfo') {
				isPtNo = true;
			} else {
				isPtNo = false;
			}
			let element = new joint.shapes['html'].Element({
				position: { x: newX, y: newY },
				size: { width: this.cellWidth, height: neweHeight },
				title: title,
				group: data[0].group,
				label: data[0].label,
				skin: this.getSkin(data[0].group),
				overlap: false,
				select: false,
				update: seq,
				inPorts: !isPtNo ? ['in1'] : [],
				outPorts: ['out1'],
				template: `
					<div class="html-element">
						<label></label>
						<div class="box-item"><div>
					</div>`,
				children: data
			});
	
			this.graph.addCells(element);

			// 드래그 중 다른 그룹 및 셀과 겹칠 경우, 그룹 생성
			this.createGroup(element, null, newX, newY);

			// 셀 겹치면 오버랩 효과(투명효과)
			this.graph.getElements().forEach((elem) => {
				elem.on('change:position', (element, newPosition) => {
					this.overlapAction(element, newPosition);
				});
			});
		}
	}
	// 그룹 추가
	addGroup(seq: string, item: any): void {
		const posx = item.x;
		const posy = item.y;
		const child = item.data;
		const height = item.height;
		const title = item.title;

		let newX = posx - parseInt($('.powermode-sidebar').width()) + 30;
		let newY = posy - parseInt($('.az-navbar').height()) -70;
		let neweHeight = height ? height : 280;

		let group = new joint.shapes['html'].Element({
			position: { x: newX, y: newY},
			size: { width: this.folderWidth, height: neweHeight },
			title: title ? title : 'Group',
			group: '',
			label: 'Group',
			select: false,
			update: seq,
			inPorts: ['in1'],
			outPorts: ['out1'],
			template: `
				<div class="html-group-folder">
					<label class="group-label"></label>
					<div class="box-group"></div>
				</div>
			`,
			childrenGroup: child
		});
		this.graph.addCells(group);
	}
	// 연결선 정보
	setGroupProperty(): void {
		// 연결선 설정
		this.graph.on('change:source change:target', (link) => {
			let sourcePort = link.get('source').port;
			let sourceId = link.get('source').id;
			let targetPort = link.get('target').port;
			let targetId = link.get('target').id;

			link.set({
				'router': { name: 'manhattan' },
				'connector': { name: 'rounded' },
				'condition': 'AND',
				'attrs': {
					'.connection': {
						stroke: '#8f8e94', 'stroke-width': 1
					}
				}
			});
		});

		// 라인 연결 시 스토어 생성
		this.paper.on('link:connect', (linkView, evt, elementViewConnected, magnet, arrowhead) => {
			this.setConditionStore();
		});
		// 연결선 끊기 이벤트 발생시
		this.graph.on('remove', (cell, collection, opt) => {
			if (cell.isLink()) {
				this.setConditionStore();
			}
		 });
	}
	// And, Or 조건 설정창 열고닫기
	setCondtion(cellView, evt): void {
		const float = $('.floating-condition-layer');

		if(float.is(':hidden')) {
			float.slideDown(200)
				.css({
					'top': evt.offsetY + 30,
					'left': evt.offsetX - 50
				});
		}
	}
	// And, Or 변경시 반영
	setConditionAction(cellView: any, seq: string): void {
		cellView.model.set({
			'condition': seq,
			'labelMarkup': `<image xlink:href="assets/styles/images/${seq.toUpperCase()}.png" width="38" height="26" x="-19" y="-13" class="labels-condition" alt="" />`
		});
		// And, Or 플로팅 창 닫음
		const float = $('.floating-condition-layer');
		if(float.is(':visible')) {
			float.slideUp(200);
		}

		return this.setConditionStore();
	}
	// 연결선 및 And, Or 조건 변경 스토어에 반영
	setConditionStore(): void {
		const links = this.graph.getLinks();
		const cells = this.graph.getElements();
		let select = [];
		let condition = [];
		let linkGroup = [];
		links.forEach((link, index) => {
			let source = this.graph.getCell(link.get('source').id);
			let typeofChild;

			if(source.get('children')) {
				typeofChild = source.get('children');
			} else if(source.get('childrenGroup')) {
				typeofChild = source.get('childrenGroup');
			}
			let tar = this.graph.getCell(link.get('target').id);
			linkGroup.push({
				source: `group_${source.cid}`,
				target: `group_${tar.cid}`,
				order: link.get('z'),
				itemNm: typeofChild[0].title,
				condition: link.get('condition') ? link.get('condition').toLowerCase(): 'and'
			});
		});

		for(let link of linkGroup) {
			let isAfter = linkGroup.filter(obj => {
				return link.target === obj.source;
			});
			let isBefore = linkGroup.filter(obj => {
				return link.source === obj.target;
			});

			if(!isBefore.length) {
				link.order = 0;
			} else if(!isAfter.length && isBefore.length) {
				link.order = 200;
			} else if(isAfter.length && isBefore.length) {
				link.order = isBefore[0].order + 1;
				isBefore[0].order = link.order - 1;
			}
		}

		let sortLinks = linkGroup.sort((a, b) => {
			if(a.order > b.order) {
				return 1;
			}
			if(a.order < b.order) {
				return -1;
			}
			return 0;
		});

		for(let key of sortLinks) {
			if(key.order === 0) {
				select.push(key.source, key.target);
				condition.push('and', key.condition);
			} else {
				select.push(key.target);
				condition.push(key.condition);
			}
		}
		return this._store.setCondition([select, condition]);
	}

	// 상자 삭제
	deleteCell(): void {
		if(this.selectionCell && this.selectionCell.model.get('select')) {
			this.selectionCell.model.remove();
		}
	}
	// 상자 선택 표시
	selectObject(cellView: any): void {
		this.graph.get('cells').find(function(cell) {
			cell.set('select', false);
		});
		cellView.model ? cellView.model.set('select', true) : cellView.set('select', true);
		this.selectionCell = cellView;
	}
	// 상자 선택 해제
	deSelectObject(): void {
		if(this.selectionCell) {
			this.selectionCell.model ? this.selectionCell.model.set('select', false) : this.selectionCell.set('select', false);
			this.selectionCell = null;
		}
		const float = $('.floating-condition-layer');
		float.is(':visible') ? float.slideUp(200) : false;
	}

	// 드래그 시 두 개체가 겹치면 호출
	overlapAction(element: any, position: {x: number; y:number}) {
		let elementBelow = this.graph.get('cells').find(function(cell) {
			if (cell instanceof joint.dia.Link) {
				return false;
			}
			// 드랍한 element가 같은 요소면 false
			if (cell.id === element.id) {
				return false;
			}
			if (cell.getBBox().containsPoint(joint.g['point'](position.x, position.y))) {
				return true;
			}
			return false;
		});
		// 두 개의 개체가 드래그하여 합쳐졌을 때
		if (elementBelow && !_.includes(this.graph.getNeighbors(elementBelow), element.model)) {
			element.set('overlap', true);
			elementBelow.set('overlap', true);
		} else {
			element.set('overlap', false);
			this.graph.get('cells').find(function(cell) {
				cell.set('overlap', false);
			});
		}
	}
	// drop 시 그룹 생성(드래그 해서 그룹 생성하기)
	createGroup(cellView: any, evt: any, x: number, y: number) {
		let elementBelow = this.graph.get('cells').find(function(cell) {
			if (cell instanceof joint.dia.Link) {
				return false;
			}
			if (cell.id === cellView.id) {
				return false;
			}
			if (cell.getBBox().containsPoint(joint.g['point'](x, y))) {
				return true;
			}
			return false;
		});
		// 두 개의 개체가 드래그하여 합쳐졌을 때
		if (elementBelow && !_.includes(this.graph.getNeighbors(elementBelow), cellView)) {
			// cellView : 드래그 개체
			// elementBelow: 드랍 개체
			let height = elementBelow.get('size').height;
			// 소그룹 생성
			if(cellView.get('group') === elementBelow.get('group')) {
				// 같은 카테고리 내에서 소그룹 생성
				const children = cellView.get('children');
				for(let child of children) {
					const groupId = elementBelow.get('children')[0].data.groupId;
					child.data.groupId = groupId;
					if(!~elementBelow.get('children').indexOf(child)) {
						elementBelow.get('children').push(child);
					}
				}
				elementBelow.resize(this.cellWidth, height + (this.cellHeight)*children.length);
				elementBelow.set('overlap', false);
				elementBelow.set('myproperty', 'foo');
				cellView.remove();
				
			} else {
				// 대그룹 생성
				if(!elementBelow.get('childrenGroup')) {
					// 다른 카테고리의 큰 그룹 생성
					const group = [];
					if(cellView.get('size')) {
						const height = cellView.get('size').height + elementBelow.get('size').height;

						for(let child of elementBelow.get('children')) {
 							group.push(child);
						}
						for(let child of cellView.get('children')) {
							group.push(child);
						}
						elementBelow.remove();
						cellView.remove();
						return this.addGroup('new', {x: x+120, y: y-100, height: height+80, data: group});
					}
				} else {
					// 큰 그룹 내에 소그룹 생성
					const child: number = cellView.get('size').height;
					const parent: number = elementBelow.get('size').height;
					const groupList: string[] = [];
					if(!~elementBelow.get('childrenGroup').indexOf(cellView.get('children')[0])) {
						const group = cellView.get('children')[0].group;
						
						if(!~groupList.indexOf(group)) {
							groupList.push(group);
							elementBelow.resize(this.folderWidth, parent + this.cellHeight);
						} else {
							elementBelow.resize(this.folderWidth, parent + child + 13);
						}
						let isLast: boolean = false;

						let childrenGroup = elementBelow.get('childrenGroup');
				
						for(let [key, value] of Object.entries(childrenGroup)) {
							if(value['group'] === group) {
								isLast = true;
							} else {
								if(isLast) {
									elementBelow.get('childrenGroup').splice(key, 0, cellView.get('children')[0]);
									break;
								} else {
									elementBelow.get('childrenGroup').push(cellView.get('children')[0]);
									break;
								}
							}
						}
						elementBelow.set('myproperty', 'foo');
						elementBelow.set('overlap', false);
					} 

					cellView.remove();
				}
			}
		}
	}

	// 에디트 모드로 전환
	editMode(): void {
		this.detectEditMode = 'P';
		this.requestItemList('P');

		$( "#editorPowermode" ).droppable( "enable" );
	}
	// 쿼리 실행
	runQuery() {
		const store = Object.assign({}, this._store.store);

		let select = [];
		store.basicStore.select ? select = store.basicStore.select.split(',') : select = [];
		this.graph.getElements().forEach((elem, index) => {
			// console.log(elem);
			let idx = `group_${elem.cid}`;
			let size;
			let posx = select.indexOf(idx) * (this.cellWidth + 80);
			elem.set('position', {
				x: posx + 30, y: 30
			});
		});
		$( "#editorPowermode" ).droppable( "disable" );
		this.resetSelect();
	}
	// Output Items 로 전환
	outputItems(): void {
		this.detectEditMode = 'A';
		this.requestItemList('A');
	}
}