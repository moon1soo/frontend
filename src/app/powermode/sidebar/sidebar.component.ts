import { Component, OnInit,Input, Output, OnChanges, SimpleChanges, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import { DxTreeListModule } from 'devextreme-angular';
import { NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { ItemListState } from '../../item-list.state';
import { DiagramService } from '../diagram.service';
import { ResultService } from '../patientlist/result.service';
import { PowermodeStoreService } from '../store/store.service';

declare const $: any;

interface InpGroup {
	categoryCd: string;
	categoryNm: string;
	columnCd: string;
	columnNm: string;
	columnAliasCd: string;
	tableCd: string;
	seq: string;
	[props: string]: any;
}
interface ItemModel {
	dataSource: any; 
	categoryGroup: any[]; 
	seq: string
}

@Component({
	selector: 'sidebar-layout',
	templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit, OnChanges {
	// @Input('itemList') itemList: {dataSource: any; categoryGroup: any[]; seq: string};	
	@Output() addCell = new EventEmitter();
	@ViewChild('acc') acc;

	activeId: string;
	seqCode: string;

	itemList: ItemModel;

	showHoverElem:boolean;
    hoverElemHeight:number;
	hoverElemTop:number;
	dataSourceClone: any[];
	categoryGroupClone: any[];

	fieldSearchTxt: string;
	finishLoad: boolean = false;
	closeOther: boolean = true;

	resultForm: FormGroup = new FormGroup({});

	// addItemData: ItemModel;

	constructor(
		private _diagramService: DiagramService,
		private _service: ResultService,
		private _state: ItemListState,
		private _store: PowermodeStoreService
	) {
		
	}
	@Input('itemList') set addItemList(value: {dataSource: any; categoryGroup: any[]; seq: string}) {
		// if(value.categoryGroup.length) {
		// 	for(let val of value.categoryGroup) {
		// 		console.log(val.ctgCd);
		// 		if(val.ctgCd === 'ptInfo') {
		// 			// console.log(key);
		// 			// value.categoryGroup.splice(key, 1);
		// 		}
		// 	}
		// }		
		this.itemList = value;
		console.log(value);
		// this.makeInpGroup(value);
	}
	get dataSource(): ItemModel {
		return this.itemList;	
	}

	ngOnInit(): void {
		this._service.patientResult$.subscribe(res => {
            this.finishLoad = true;
		});		
		this.dataSourceClone = this.itemList.dataSource.slice(0);
		this.categoryGroupClone = this.itemList.categoryGroup.slice(0);		

		this._diagramService.itemList$.subscribe(res => {
			// console.log('사이드메뉴 정보 변경', res);
			this.dataSourceClone = res.dataSource.slice(0);
			this.categoryGroupClone = res.categoryGroup.slice(0);		
			this.makeInpGroup(res.dataSource.slice(0));
			if(res.seq === 'P') {
				this.sortableItem();
			}
		});

		// 칼럼 삭제정보 구독
		this._service.removeColInfo$.subscribe(res => {
			for(let key of this.dataSourceClone) {
				if(key.ctgCd === res.category && key.itemCd === res.dataField) {
					key.isChecked = false;
				}
			}
		});		

		setTimeout(() => {
			this.activeId = this.acc.activeIds[0];
		}, 10);	
	}

	ngOnChanges(changes: SimpleChanges): void {
		// if(changes.itemList.currentValue.dataSource.length) {
		// 	// this.itemList = changes.itemList.currentValue;
		// 	this.dataSourceClone = changes.itemList.currentValue.dataSource.slice(0);
		// 	this.categoryGroupClone = changes.itemList.currentValue.categoryGroup.slice(0);
		// }
	}
	// 체크박스 목록 생성
    makeInpGroup(value: any): void {
		const items = this._store.store.finalResultStore;
		// console.log('체크박스 목록', value);
		if(items) {
			for (let data of value) {
				let control: FormControl = new FormControl('');
				let ctrlNm: string;
				if(data.filterType) {
					ctrlNm = `${data.ctgCd}|${data.itemCd}|${data.itemNm}|${data.ltUseYn}|${data.filterType}`;
				} else {
					ctrlNm = `${data.ctgCd}|${data.itemCd}|${data.itemNm}|${data.ltUseYn}|`;
				}

				this.resultForm.addControl(ctrlNm, control);
				data.isChecked = false;

				if(~this._state.initConstItem.indexOf(data.itemCd)
					&& ~this._state.initConstGroup.indexOf(data.ctgCd)) {
					data.isChecked = true;
					data.isDisabled = true;
					// this.resultForm.controls[`${data.ctgCd}|${data.itemCd}|${data.itemNm}|`].disable();
				} else {
					if(items.item && ~items.item.indexOf(data.itemCd)
						&& items.category && ~items.category.indexOf(data.ctgCd)) {
						data.isChecked = true;
						data.isDisabled = false;
					} else {
						data.isChecked = false;
						data.isDisabled = false;
					}
				}
			}			
		}
		setTimeout(() => {
			this.watchForm();
		}, 10);
	}

	// 체크내역 공유	
	watchForm(): void {
		this.resultForm.valueChanges
			.debounceTime(400)
			.distinctUntilChanged()
			.subscribe(res => {
                const arr = Object.keys(res).filter((key) => {
                    return res[key] === true;
				});
				
				let ptInfo = [];
				let spreadCol = [];
				for(let mem of arr) {
					let head = mem.split('|')[0];
					if(head === 'ptInfo') {
						ptInfo.unshift(mem);
					} else {
						spreadCol.push(mem);
					}
				}

				let arrReorder = ptInfo.concat(spreadCol);
			
				let column = arrReorder.map(obj => {
					let rObj = {};
					let split = obj.split('|');
					rObj['category'] = split[0];
					rObj['dataField'] = split[1];
					rObj['caption'] = split[2];
					rObj['ltUseYn'] = split[3];
					rObj['filterType'] = split[4];
					if(~this._state.initConstItem.indexOf(split[1])) { 
						rObj['default'] = true 
					}

					return rObj;
				});
				this._service.setColumnList(column);
		});
	}

	sortableItem(): void {
		setTimeout(() => {
			$('.powermode-sublist-item').draggable({
				revert: 'invalid',
				containment: 'window',
				scroll: false,
				helper: 'clone',
				start: function(event, ui) {
					ui.helper.addClass('dragging');
					$('.powermode-sidebar-nav').css('overflow','visible');
				},
				stop: function (e, ui) {
					$('.powermode-sidebar-nav').css('overflow','auto');
				}
			});
			$('.powermode-sublist-item').on('dblclick', (event) => {
				this.addCell.emit(event.currentTarget.dataset);
			});
		}, 10);
		// this.activeId = this.seqCode;
	}
	// 아코디언 메뉴 변경
	beforeChange(event: NgbPanelChangeEvent) {
		// console.log(event);
		this.activeId = event.panelId;
	}

	collapsePanel(): void {
		this.acc.activeIds = [];
	}

	// 필터 열기
	openFilter(event: MouseEvent, data: any): void {
		const selectionDataCell = {
			ctgCd: data.ctgCd,
			itemNm: data.itemNm,
			itemCd: data.itemCd,
			filterType: data.filterType,
			isFilter: true
		}
		this._diagramService.setselectionData(selectionDataCell);
	}
	// 필드 검색
	fieldSearch(event: string): void {
		if(event.length) {
			let filter = this.itemList.dataSource.filter((item) => {
				return event.length && ~item.itemNm.indexOf(event);
			});

			let arr = [];
			for(let item of filter) {
				if(!~arr.indexOf(item.ctgCd)) {
					arr.push(item.ctgCd);
				}
			}
			let newCate = this.itemList.categoryGroup.filter((item) => {
				return ~arr.indexOf(item.ctgCd);
			});
			this.dataSourceClone = filter;
			this.categoryGroupClone = newCate;
			this.closeOther = false;
			this.acc.activeIds = arr.map(i => `toggle-${i}`);

		} else {
			this.dataSourceClone = this.itemList.dataSource;
			this.categoryGroupClone = this.itemList.categoryGroup;
			this.closeOther = true;
			this.acc.activeIds = [];
		}
	}
}
