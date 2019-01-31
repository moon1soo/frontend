import { Injectable, Pipe, PipeTransform } from '@angular/core';

export class ItemModel {
    ctgCd: string;
    ctgNm: string;
    tabNm: string;
    tabAlias: string;
    setSeq: string;
    itemCd: string;
    itemNm: string;
    itemColNm: string;
    [props: string]: any;
}

@Pipe({
	name: 'itemFilter'
})
@Injectable()
export class AddItemFilter implements PipeTransform {
	transform(items: ItemModel[], category: string, keyword: string): any {
		return items.filter((item) => {
            if(!keyword) {
                return item['ctgCd'] === category;
            } else {
                return item['ctgCd'] === category && ~item['itemNm'].indexOf(keyword);
            }
        });
	}
}