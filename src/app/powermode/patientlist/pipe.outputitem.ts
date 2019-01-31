import { Injectable, Pipe, PipeTransform } from '@angular/core';

export class ItemModel {
    dataField: string; 
    caption: string; 
    category: string; 
    [props: string]: any;
}

@Pipe({
	name: 'outputItemFilter'
})
@Injectable()
export class OutputItemFilter implements PipeTransform {
	transform(items: ItemModel[], category: string): any {
		return items.filter((item) => {
            return item['category'] === category;
        });
	}
}