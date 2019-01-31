import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export class SetBasic {
    rschRprvId?: string;
    period1?: string | NgbDateStruct;
    period2?: string | NgbDateStruct;
    ageTpCd?: string;
    gender: string;
    age1?: string;
    age2?: string;
    pactTpCd?: string;
    ptTpNm?: string;
    select?: string;
    condition?: string;
    [props: string]: any;
}
export class SetGroup {
    groupId: string;
    category: string[];
    item: string[];
    filter: string[];
    [props: string]: any;
}
export class StoreVo {
    basicStore: SetBasic;
    groupInfoListStore: SetGroup[];
    [props: string]: any;
}
export class StoreFinalResult {
    category: string[];
    item: string[];
    filter?: string[];
    stdDtSt: string;
    stdDtEd: string;
    [props: string]: any;
}