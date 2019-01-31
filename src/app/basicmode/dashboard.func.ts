import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { element } from 'protractor';

declare const $: any;

@Injectable()
export class DashboardFunc {

	private curUrl = new Subject<string>();
	private createPatient = new Subject<boolean>();
	private runQuery = new Subject<boolean>();

	curUrl$ = this.curUrl.asObservable();
	createPatient$ = this.createPatient.asObservable();
	runQuery$ = this.runQuery.asObservable();

	// 현재위치 저장
	getCurUrl(data: string) {
		this.curUrl.next(data);	
	}	
	// Patient Create List
	setCreatePatient(data: boolean) {
		console.log(data);
		this.createPatient.next(data);
	}
	// 쿼리 실행
	setRunQuery(data: boolean) {
		this.runQuery.next(data);
	}
	// 데이터 드래그 앤 드롭
	tblDraggable() {
        $('.gridContainer tbody').draggable({			
			appendTo: ".gridSelect",
			delay: 150,
			revert: 0,
			helper: function() {
				return $("<div></div>").append($(this).find('.dx-selection').clone());
			},
			start: function(event, ui) {
				let helper = $(ui.helper);
				console.log(helper.find('.dx-selection'));
				if(helper.find('.dx-selection').length > 1) {
					helper.addClass("draggable-tr");
				} else {
					helper.addClass("draggable-tr-one");
				}
				
 				// helper.find('.dx-selection').each(function(obj, index) {
				// 	if(index > 7) {
				// 		obj.css('display', 'none');
				// 	}
				// });
			}
		}).disableSelection();
	}
	tblDraggableAct(idx: string) {
        $('#'+idx).find('tbody').draggable({
			appendTo: '.'+idx,
			delay: 150,
			revert: 0,
			helper: function() {
				return $('<div></div>').append($(this).find('.dx-selection').clone());
			},
			start: function(event, ui) {
				let helper = $(ui.helper);
				if(helper.find('.dx-selection').length > 1) {
					helper.addClass('draggable-tr');
				} else {
					helper.addClass('draggable-tr-one');
				}
			}
		});
    }
    // tblDraggable() {
    //     $('.gridContainer tbody').sortable({
	// 		connectWith: "tbody",
	// 		containment: 'window',
	// 		appendTo: ".gridSelect",
	// 		delay: 150,
	// 		items: '>.dx-selection',
	// 		revert: 0,
	// 		helper: function (e, item) {
	// 			// if (!item.hasClass('draggable-tr')) {
	// 			// 	item.addClass('draggable-tr').siblings().removeClass('draggable-tr');
	// 			// }
	// 			var elements = item.parent().children('.dx-selection').clone();
	// 			elements.addClass('draggable-tr');
	// 			elements.each(function(index) {
	// 				if(index > 5) {
	// 					$(this).css('display', 'none');
	// 				}
	// 			});
	// 			item.data('multidrag', elements)
	// 				.siblings('.dx-selection').remove();
	// 			var helper = $('<tr/>');	
	// 			return helper.append(elements);
	// 		},
	// 		stop: function (e, ui) {
	// 			console.log(e, ui);
	// 			var elements = ui.item.data('multidrag');
	// 			if(elements && elements.hasClass('draggable-tr')) {
	// 				elements.removeClass('draggable-tr');
	// 				elements.removeClass('dx-selection');
	// 			}
	// 			setTimeout(() => {
	// 				ui.item.after(elements).remove();
	// 			}, 10);

	// 			$(this).sortable("cancel");
	// 		}
	// 	}).disableSelection();
	// }	
}
