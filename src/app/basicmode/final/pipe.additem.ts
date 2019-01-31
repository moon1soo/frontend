import { Injectable, Pipe, PipeTransform } from '@angular/core';
import * as Model from './final-result.model';

@Pipe({
	name: 'itemFilter'
})
@Injectable()
export class AddItemFilter implements PipeTransform {
	transform(items: Model.ItemModel[], category: string): any {
		return items.filter(item => item['ctgCd'] === category);
	}
}