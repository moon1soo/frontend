
// import * as Basic from '../basicview/basic.model';
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
    [props: string]: any;
}
export class StoreVo {
    basicStore: SetBasic;
    setHospital: TableStoreVo;
    setMedical: TableStoreVo;
    setDoctor: TableStoreVo;
    [props: string]: any;
}
export class StoreOrder {
    select1: string[];
    condition1: string[];
    freeText: string[];
    freeTextCondition: string[];
    ordDtSt: string;
    ordDtEd: string;
    [props: string]: any;    
}
export class StoreDiagnosis {
    select1: string[];
    condition1: string[];
    dgnsDtSt: string;
    dgnsDtEd: string;
    [props: string]: any;
}
export class StoreExam {
    select1: string[];
    condition1: string[];
    yn: string;
    testDtSt: string;
    testDtEd: string;
    [props: string]: any;
}
export class StoreExamResult {
    select1: string[];
    condition1: string[];
    rangeDtSt: string[];
    rangeDtEd: string[];
    pn1: string[];
    freeText: string[];
    freeTextCondition: string[];
    [props: string]: any;
}
export class StoreSurgical {
    select1: string[];
    condition1: string[];
    srgrDtSt: string;
    srgrDtEd: string;
    [props: string]: any;
}
export class StoreMedicine {
    select1: string[];
    condition1: string[];
    fmtYn1: string[];
    dyAmdQtySt: string[];
    dyAmdQtyEd: string[];
    mdprDtSt: string;
    mdprDtEd: string;
    [props: string]: any;
}
export class StoreFee {
    select1: string[];
    condition1: string[];
    feeDtSt: string;
    feeDtEd: string;
    [props: string]: any;
}
export class StoreCc {
    select1: string[];
    condition1: string[];
    ccDtSt: string;
    ccDtEd: string;
    [props: string]: any;
}
export class StoreForm {
    select1: string[];
    condition1: string[];
    rangeDtSt: string[];
    rangeDtEd: string[];
    freeText: string[];
    freeTextCondition: string[];
    yn: string;
    formDtSt: string;
    formDtEd: string;
    [props: string]: any;
}
export class StoreFormDetail {
    select1: string[];
    condition1: string[];
    rangeDtSt: string[];
    rangeDtEd: string[];
    freeText: string[];
    freeTextCondition: string[];   
    [props: string]: any;
}
export class StoreNursPlan {
    select1: string[];
    condition1: string[];
    fmtYn1: string[];
    [props: string]: any;
}
export class StoreNursEav {
    nrClsCd: string;
    select1: string[];
    condition1: string[];
    rangeDtSt: string[];
    rangeDtEd: string[];
    pn1: string[];
    freeText: string[];
    freeTextCondition: string[];
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
export class TableStoreVo {
    select1?: string[] | string; 
    condition1?: string[];   
    [props: string]: any;
}
export class StringStoreVo {
    select1?: string; 
    [props: string]: any;
}
