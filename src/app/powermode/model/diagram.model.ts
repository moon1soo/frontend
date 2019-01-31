export class SelectData {
    id?: string;
    index?: number;
	ctgCd: string;
	itemNm: string;
	itemCd: string;
    filterType: string;
    isFilter?: boolean;
    [props: string]: any;
}
export class storeParam {
	idx: string; 
	name?: string;
	children: any; 
	size: {width: number; height: number}; 
	position: {x: number; y: number}; 
	update: string;
}