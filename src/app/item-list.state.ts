import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

interface AddItem {
    category: string;
    itemCd: string;
    store?: string;
    code1?: string;
    code2?: string;
    seq?: string;
    filter?: boolean;
    filterType?: string;
}

@Injectable()
export class ItemListState {

    // Default select item
    initConstGroup: string[] = ['ptInfo', 'ptInfo','ptInfo','ptInfo'];
	initConstItem: string[] = ['ptNo','ptNm','sexTpCd','ptBrdyDt'];

    // 최종결과 매칭
    matchAddItem: AddItem[] = [
        {
            //수진당시 나이
            category: 'visit',
            itemCd: 'ageCd',
            // store: 'basicStore',
            // code1: 'ageTpCd',
            filter: false
        },{
            // 수진(진료)일자
            category: 'visit',
            itemCd: 'pactDt',
            store: 'basicStore',
            code1: 'period1',
            code2: 'period2',
            filter: false
        },{
            // 입원시 진료과
            category: 'visit',
            itemCd: 'adsMedDeptCd',
            filter: false
        },{
            // 병원명
            category: 'visit',
            itemCd: 'hspTpNm',
            filter: false
        },{
            // 수진(퇴원포함)진료과
            category: 'visit',
            itemCd: 'dsMedDeptCd',
            store: 'medicalStore',
            code1: 'select1',
            filter: true
        },{
            // 수진진료과의최종수진일
            category: 'visit',
            itemCd: 'medHmeDt',
            filter: false
        },{
            // 수진진료의
            category: 'visit',
            itemCd: 'drStfNm',
            store: 'doctorStore',
            code1: 'select1',
            filter: true
        },{
            // 진료구분(초/재진)
            category: 'visit',
            itemCd: 'frvsRmdeTpNm',
            filter: false
        },{
            // 환자구분(외래/응급/입원)
            category: 'visit',
            itemCd: 'pactTpCd',
            // store: 'basicStore',
            // code1: 'pactTpCd',
            filter: false
        },{
            // 재원일수(응급실포함)
            category: 'visit',
            itemCd: 'plusemrgSihsDys',
            filter: false
        },{
            // 재원시간(응급실포함))
            category: 'visit',
            itemCd: 'emrgSihsHours',
            filter: false
        },{
            // 재원일수(응급실미포함)
            category: 'visit',
            itemCd: 'sihsDys',
            filter: false
        },{
            // 재원시간(응급실미포함)
            category: 'visit',
            itemCd: 'sihsHours',
            filter: false
        },{
            // 재원일수(ICU)
            category: 'visit',
            itemCd: 'icuSihsDys',
            filter: false
        },{
            // 입실시각(응급실)
            category: 'visit',
            itemCd: 'emrmInDtm',
            filter: false
        },{
            // 퇴실시각(응급실)
            category: 'visit',
            itemCd: 'emrmOutDtm',
            filter: false
        },{
            // 입원일자
            category: 'visit',
            itemCd: 'adsDt',
            filter: false
        },{
            // 퇴원일자
            category: 'visit',
            itemCd: 'dsDt',
            filter: false
        },{
            // 입원병동
            category: 'visit',
            itemCd: 'adsWdDeptCd',
            filter: false
        },{
            // 퇴원병동
            category: 'visit',
            itemCd: 'dsWdDeptCd',
            filter: false
        },{
            // 사망일시
            category: 'visit',
            itemCd: 'dthDt',
            filter: false
        },{
            // 진단일자
            category: 'diagnosis',
            itemCd: 'dgnsRegDt',
            store: 'diagnosisStore',
            code1: 'dgnsDtSt',
            code2: 'dgnsDtEd',
            filter: false
        },{
            // 진단진료과
            category: 'diagnosis',
            itemCd: 'dgnsMedDeptNm',
            store: 'diagnosisMedicalStore',
            code1: 'select1',
            filter: true
        },{
            // 원내 진단명
            category: 'diagnosis',
            itemCd: 'dgnsNm',
            store: 'diagnosisStore',
            code1: 'select1',
            filter: true
        },{
            // 검사시행일
            category: 'exam',
            itemCd: 'implDtm',
            store: 'examStore',
            code1: 'testDtSt',
            code2: 'testDtEd',
            filter: false
        },{
            // 검사명
            category: 'exam',
            itemCd: 'exmNm',
            store: 'examStore',
            code1: 'select1',
            filter: true
        },{
            // 검사세부항목명
            category: 'exam',
            itemCd: 'mdfmCpemNm',
            store: 'examResultStore',
            code1: 'select1',
            filter: true
        },{
            // 검사결과
            category: 'exam',
            itemCd: 'exrsCnte',
            store: 'examResultStore',
            code1: 'select1',
            filter: false
        },{
            // 검사 Slip Code
            category: 'exam',
            itemCd: 'ordSlipCtgNm',
            store: 'examStore',
            filter: false
        },{
            // 수술일자
            category: 'surgical',
            itemCd: 'opExptDt',
            store: 'surgicalStore',
            code1: 'srgrDtSt',
            code2: 'srgrDtEd',
            filter: false
        },{
            // 원내수술명
            category: 'surgical',
            itemCd: 'opVocNm',
            store: 'surgicalStore',
            code1: 'select1',
            filter: true
        },{
            // 수술진료과
            category: 'surgical',
            itemCd: 'medDeptNm',
            store: 'surgicalMedicalStore',
            code1: 'select1',
            filter: true
        },{
            // 집도의(수술확정당시)
            category: 'surgical',
            itemCd: 'pfdrStfNm',
            store: 'surgicalDoctorStore',
            code1: 'select1',
            filter: true
        },{
            // 수술후퇴실장소
            category: 'surgical',
            itemCd: 'pstopChotPlcTpCd',
            store: 'postOPCheckOutPlaceStore',
            code1: 'select1',
            filter: false
        },{
            // 수술진단명
            category: 'surgical',
            itemCd: 'opDgnsVocNm',
            store: 'surgicalDiagnosisStore',
            code1: 'select1',
            filter: true
        },{
            // 마취종류
            category: 'surgical',
            itemCd: 'anstKndCd',
            store: 'anesthesiaKindStore',
            code1: 'select1',
            filter: false
        },{
            // 약품처방일
            category: 'medicine',
            itemCd: 'ordDt',
            store: 'medicineStore',
            code1: 'mdprDtSt',
            code2: 'mdprDtEd',
            filter: false
        },{
            // 약품명(성분명)
            category: 'medicine',
            itemCd: 'ingrMdprNm',
            store: 'medicineStore',
            code1: 'select1',
            filter: true
        },{
            // 오더처방일자
            category: 'order',
            itemCd: 'ordDt',
            store: 'orderStore',
            code1: 'ordDtSt',
            code2: 'ordDtEd',
            filter: false
        },{
            // 오더명
            category: 'order',
            itemCd: 'ordNm',
            store: 'orderStore',
            code1: 'select1',
            filter: true
        },{
            // CC발병일
            category: 'cc',
            itemCd: 'cfcmOnstCnte',
            store: 'chiefComplaintStore',
            code1: 'ccDtSt',
            code2: 'ccDtEd',
            filter: false
        },{
            // CC명
            category: 'cc',
            itemCd: 'cfcmVocNm',
            store: 'chiefComplaintStore',
            code1: 'select1',
            filter: true
        },{
            // 서식작성일자
            category: 'form',
            itemCd: 'recDt',
            store: 'formStore',
            code1: 'formDtSt',
            code2: 'formDtEd',
            filter: false
        },{
            // 서식명
            category: 'form',
            itemCd: 'mdfmNm',
            store: 'formStore',
            code1: 'select1',
            filter: true
        },{
            // 서식항목명
            category: 'form',
            itemCd: 'mdfmCpemNm',
            store: 'formDetailStore',
            code1: 'select1',
            filter: true
        },{
            // 수가명
            category: 'fee',
            itemCd: 'ordNm',
            store: 'feeStore',
            code1: 'select1',
            filter: true
        },{
            // 수가처방일자
            category: 'fee',
            itemCd: 'ordDt',
            store: 'feeStore',
            code1: 'feeDtSt',
            code2: 'feeDtEd',
            filter: false
        },{
            // 간호진술문명
            category: 'nursState',
            itemCd: 'nrItemNm',
            store: 'nursStateStore',
            code1: 'select1',
            filter: true
        },{
            // 간호진술문 기록작성일
            category: 'nursState',
            itemCd: 'recWrtDtm',
            store: 'nursStateStore',
            code1: 'wrtDtSt',
            code2: 'wrtDtEd',
            filter: false
        },{
            // 간호진술문 부서
            category: 'nursState',
            itemCd: 'wrtrPlwkDeptNm',
            store: 'nursStateStore',
            code1: 'dept1',
            filter: false
        },{
            // 간호용어 항목명
            category: 'nursEav',
            itemCd: 'entityNm',
            store: 'nursEavStore',
            code1: 'select1',
            filter: false
        },{
            // 간호용어 속성명
            category: 'nursEav',
            itemCd: 'attributeNm',
            store: 'nursEavStore',
            code1: 'select1',
            filter: false
        },{
            // 간호용어 항목:속성:진술문명
            category: 'nursEav',
            itemCd: 'nrVocEntAtrItemNm',
            store: 'nursEavStore',
            code1: 'select1',
            filter: true
        },{
            // 간호용어 기록작성일
            category: 'nursEav',
            itemCd: 'recWrtDtm',
            store: 'nursEavStore',
            code1: 'wrtDtSt',
            code2: 'wrtDtEd',
            filter: false
        },{
            // 간호용어 부서
            category: 'nursEav',
            itemCd: 'wrtrPlwkDeptNm',
            store: 'nursEavStore',
            code1: 'dept1',
            filter: false
        },{
            // 간호환자평가 기록작성일
            category: 'nursAssm',
            itemCd: 'inptDtm',
            store: 'nursAssessmentStore',
            code1: 'wrtDtSt',
            code2: 'wrtDtEd',
            filter: false
        },{
            // 검사시행일(병리검사)
            category: 'pathology',
            itemCd: 'implDtm',
            store: 'pathologyStore',
            code1: 'testDtSt',
            code2: 'testDtEd',
            filter: false
        },{
            // 병리번호
            category: 'pathology',
            itemCd: 'pthlNo',
            filter: false
        },{
            // 병리검사결과-KEY
            category: 'pathology',
            itemCd: 'plrtLdatKey',
            store: 'pathologyStore',
            code1: 'select1',
            filter: true
        },{
            // 병리검사결과-VAL
            category: 'pathology',
            itemCd: 'plrtLdatVal',
            store: 'pathologyStore',
            code1: 'select1',
            filter: false
        },{
            // 병리 그룹번호
            category: 'pathology',
            itemCd: 'grpNo',
            store: 'pathologyStore',
            code1: 'select1',
            filter: false
        },{
            // 병리 인덱스번호
            category: 'pathology',
            itemCd: 'keyNo',
            store: 'pathologyStore',
            code1: 'select1',
            filter: false
        },{
            // 모병리번호
            category: 'pathology',
            itemCd: 'uprPthlNo',
            store: 'pathologyStore',
            code1: 'select1',
            filter: false
        },{
            // 병리 Slip Code
            category: 'pathology',
            itemCd: 'ordSlipCtgCd',
            store: 'pathologyStore',
            filter: true
        }, {
            // 방사선치료
            category: 'rediation',
            itemCd: 'rttOrdNm',
            store: 'rediationTreatmentStore',
            code1: 'select1',
            filter: true
        }, {
            // 방사선치료 - 예약일
            category: 'rediation',
            itemCd: 'rsvDtm',
            store: 'rediationTreatmentStore',
            code1: 'testDtSt',
            code2: 'testDtEd',
            filter: false
        }, {
            // 방사선치료 - 수행여부
            category: 'rediation',
            itemCd: 'trpFmtYn',
            store: 'rediationTreatmentStore',
            code1: 'yn',
            filter: false
        }, {
            // 방사선치료 치료실
            category: 'rediation',
            itemCd: 'tyrmNm',
            store: 'rediationTherapyRoomStore',
            code1: 'select1',
            filter: true
        }, {
            // 방사선치료 치료부위
            category: 'rediation',
            itemCd: 'trpRgnNm',
            store: 'rediationTherapyRegionStore',
            code1: 'select1',
            filter: true
        }, {
            // 방사선치료 담당의
            category: 'rediation',
            itemCd: 'chdrStfNm',
            store: 'rediationDoctorStore',
            code1: 'select1',
            filter: true
        }
    ];
}