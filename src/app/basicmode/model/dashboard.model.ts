import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

// select
export class Select {
    name: string;
    value: string;
    [props: string]: any;
}
// export class Date {
//     year: number;
//     month: number;
//     day: number;
// }

// 기본 성별나이설정
export class basicDefault {
    hspTpCd: string;
    lclTpCd: string;
	rschRprvId?: string;
	period1?: NgbDateStruct|string;
	period2?: NgbDateStruct|string;
	gender: string;
	ageTpCd?: string;
	age1?: string;
	age2?: string;
	pactTpCdIn?: boolean;
	pactTpCdOut?: boolean;
	pactTpCdEm?: boolean;
	[props: string]: any;
}

// 병원
export class HospitalList {
    hspTpCd: string;
    hspTpNm: string;
    lclTpCd: string;
    lclTpNm: string;
    [props: string]: any;
}
// 수진진료과
export class MedicalList {
    medDeptCd: string;
    medDeptNm: string;
    medDeptCd1: string;
    lclTpCd: string;
    hspTpCd: string;
    hspTpNm: string;
    [props: string]: any;
}
// 수진 진료의
export class DoctorList {
    drStfNo: string;
    drStfNm: string;
    medDeptNm: string;
    [props: string]: any;
}
// 진단명 검색
export class DiagnosisList {
    dgnsIcd10Cd?: string;
    dgnsNm: string;
    dgnsVocId: string;
    icd10EngNm?: string;
    [props: string]: any;
}
// 진단수술 - 진단진료과
export class DiagMedicalList {
    medDeptCd: string;
    medDeptNm: string;
    medDeptCd1: string;
    [props: string]: any;
}
// 오더
export class OrderList {
    lclTpCd : string;
    hspTpCd : string;
    hspTpNm : string;
    ordCd : string;
    ordNm :  string;
    ordNm2 :  string;
    ordGrpCd : string;
    ordGrpNm : string;
    [props: string]: any;
}
// 수가
export class FeeList {
    ordCd?: string;
    ordNm?: string;
    ordGrpNm?: string;
    [props: string]: any;
}
// 검사
export class ExamList {
    lclTpCd: string;
    hspTpCd: string;
    hspTpNm: string;
    exmCd: string;
    exmNm: string;
    exmNm1: string;
    slipNm: string;
    slipNm1: string;
    pnlExmCd: string;
    pnlExmNm: string;
    pnlExmNm1: string;
    [props: string]: any;
}
// 약품
export class MedicineList {
    lclTpCd: string;
	hspTpCd: string;
	hspTpNm: string;
	gnrMdprNm: string;
	gnrMdprNm2: string;
	kpemMdprNm: string;
	kpemMdprNm2: string;
	atcIngrNm: string;
	atcIngrNm2: string;
	mdprCd: string;
    mdprId: string;
    [props: string]: any;
}
// 수술
export class SurgicalList {
    opVocId: string;
	opVocNm: string;
	opVocNm1: string;
    opIcd9CmCd: string;
    [props: string]: any;
}
// cc
export class CcList {
    cfcmVocId: string;
    cfcmVocNm: string;
    hspTpCd: string;
    lclTpCd: string;
    [props: string]: any;
}
// 서식
export class FormList {
    recDt: string;
    mdfmId: string;
    mdfmNm: string;
    mdfmNm1: string;
    mdfmClsCd: string;
    mdfmClsNm: string;
    mdfMedDeptNm: string;
    hspTpCd: string;
    lclTpCd: string;
    [props: string]: any;
}

// 서식 세부
export class FormDetailList {
    recDt: string;
    mdfmId: string;
    mdfmNm: string;
    mdfmNm1: string;
    mdfmClsCd: string;
    mdfmClsNm: string;
    mdfMedDeptNm: string;
    hspTpCd: string;
    lclTpCd: string;
    [props: string]: any;
}

// 진단수술 - 수술진단명
export class SurDiag {
    dgnsVocId: string;
    dgnsNm: string;
    dgnsVocNm1: string;
    dgnsIcd10Cd: string;
    icd10KorNm: string;
    icd10EngNm: string;
    icd10EngNm1: string;
    snomedCd: string;
    [props: string]: any;
}
// 진단수술 - 수술진료과
export class SurMedical {
    medDeptCd: string;
    medDeptNm: string;
    medDeptCd1: string;
    [props: string]: any;
}
// 진단수술 - 수술집도의
export class SurDoctor {
    drStfNo: string;
	drStfNm: string;
	medDeptNm: string;
    medDeptCd: string;
    [props: string]: any;
}
// 수술상세 - 수술 후 퇴실장소
export class PartiSur {
    opOutCd: string;
    opOutNm: string;
    [props: string]: any;
}
// 수술상세 - 마취 종류
export class PartiAnesth {
    anstKndCd: string;
    anstKndNm: string;
    [props: string]: any;
}
// 간호기록부서
export class NursDept {
    deptCd: string;
    deptNm: string;
    [props: string]: any;
}
// 간호기록부서
export class NursStateDept {
    deptCd: string;
    deptNm: string;
    [props: string]: any;
}
// 간호진단 - 간호사정
export class NursCircum {
    nrstKndCd: string;
	nrstId: string;
	nrstNm: string;
    nrstNm1: string;
    [props: string]: any;
}
// 간호진단 - 간호진단
export class NursDiag {
    nrstKndCd: string;
	nrstId: string;
	nrstNm: string;
    nrstNm1: string;
    [props: string]: any;
}
// 간호진단 - 간호계획
export class NursPlan {
    nrstKndCd: string;
	nrstId: string;
	nrstNm: string;
    nrstNm1: string;
    [props: string]: any;
}
// 간호진단 - 간호진술
export class NursState {
    nrstId: string;
	nrstNm: string;
	nrstNm1: string;
	nrstKndCd: string;
	nrstKndNm: string;
    [props: string]: any;
}
// 간호진단 - 간호진술EAV
export class NursStateEav {
    nrstId: string;
	nrstId2: string;
	nrstNm: string;
	nrstNm1: string;
	nrstKndCd: string;
	nrstKndNm: string;
	nrVocEntId: string;
	nrVocEntNm: string;
	nrVocEntNm1: string;
	nrVocAtrId: string;
	nrVocAtrNm: string;
    nrVocAtrNm1: string;
    [props: string]: any;
}
// 용어 EAV
export class NursEav {
    nrVocEntId: string;
	nrVocEntNm: string;
	nrVocEntNm1: string;
	nrVocAtrId: string;
	nrVocAtrNm: string;
	nrVocAtrNm1: string;
	nrItemId: string;
	nrItemNm: string;
	nrItemNm1: string;
	nrClsCd: string;
    nrClsNm: string;
    [props: string]: any;
}

// 용어 EAV 항목
export class NursEavItems {
    nrVocEntId: string;
	nrVocEntNm: string;
	nrVocEntNm1: string;
	nrVocAtrId: string;
	nrVocAtrNm: string;
	nrVocAtrNm1: string;
	nrItemId: string;
	nrItemNm: string;
	nrItemNm1: string;
	nrClsCd: string;
    nrClsNm: string;
    [props: string]: any;    
}

// 간호사정평가
export class NursAssm {
  [props: string]: any;
}

// 내 쿼리 불러오기
export class myQueries {
  [props: string]: any;
}

// 공유된 쿼리 불러오기
export class sharedQueries {
    [props: string]: any;
}

// IRB 목록 불러오기
export class irbApproval {
    [props: string]: any;
}

export class PathList {
    [props: string]: any;
}

export class ConcernList {
    [props: string]: any;
}

export class RediationList {
    [props: string]: any;
}

export class RediationRoomList {
    [props: string]: any;
}

export class RediationRegionList {
    [props: string]: any;
}

export class RediationDoctorList {
    [props: string]: any;
}