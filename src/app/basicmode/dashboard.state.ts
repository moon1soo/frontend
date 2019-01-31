import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class DashboardState {
    
    // 선택할 수 있는 최대 row 갯수
    // maxRows: number = 2000000000000;
    // minRows: number = 40;   
    maxAddRows: number = 99999999;

    // 메시지 관리
    message = {
        hospital: this._translate.instant('renewal2017.p.message-hospital'),
        visit: this._translate.instant('renewal2017.p.message-visit'),
        doctor: this._translate.instant('renewal2017.p.message-doctor'),
        diagnosis: this._translate.instant('research.patient.no'),
        diagMed: '',
        exam: this._translate.instant('renewal2017.p.message-exam')
    }
    // 스토어 타입 관리
    stringArrayType: string[] = ['freeText', 'freeTextCondition', 'rangeDtEd', 'rangeDtSt', 'pn1'];
    stringType: string[] = [
        'yn', 
        'fmtYn1',
        'dgnsDtSt',
        'dgnsDtEd',
        'testDtSt',
        'testDtEd',
        'pathDtSt',
        'pathDtEd',
        'srgrDtSt',
        'srgrDtEd',
        'mdprDtSt',
        'mdprDtEd',
        'ordDtSt',
        'ordDtEd',
        'feeDtSt',
        'feeDtEd',
        'ccDtSt',
        'ccDtEd',
        'formDtSt',
        'formDtEd',
        'nrClsCd',
        'wrtDtSt',
        'wrtDtEd',
        'ifflCtg',
        'ifflFrom',
        'ifflTo',
        'bdsrCtg',
        'bdsrFrom',
        'bdsrTo',
        'cmmOldCtg',
        'cmmOldFrom',
        'cmmOldTo',
        'apcOldCtg',
        'apcOldFrom',
        'apcOldTo',
        'mtCtg',
        'mtFrom',
        'mtTo',
        'cmmCtg',
        'cmmFrom',
        'cmmTo',
        'apcCtg',
        'apcFrom',
        'apcTo',
        'chldCtg',
        'chldFrom',
        'chldTo',
        'dept1',
        'uploadYN',
    ];
    hospitalBasicStore = ['hspTpCd','ptBrdyDtEd','ptBrdyDtSt'];
    visitInBasicStore = ['age1','age2','ageTpCd','pactTpCd','ptTpNm','period1','period2'];
    visitInBasicStoreVar = ['age1','age2','ptTpNm','period1','period2'];

    // Process Overview 카테고리 관리
    processGroup: any[] = [
        { concernPatient: 'concernPatientStore'},
		{ visit: 'medicalStore,doctorStore' },
		{ diagnosis: 'diagnosisStore,diagnosisMedicalStore' },
        { exam: 'examStore,examResultStore' },
        { pathology: 'pathologyStore'},
		{ medicine: 'medicineStore'},
        { order: 'orderStore' },
        { fee: 'feeStore'},
		{ surgical: 'surgicalMedicalStore,surgicalDiagnosisStore,surgicalDoctorStore,surgicalStore,postOPCheckOutPlaceStore,anesthesiaKindStore' },
		{ cc: 'chiefComplaintStore' },
        { form: 'formStore,formDetailStore' },
        { nursEav: 'nursEavStore,nursEavItemsStore,nursDeptStore'},
        { nursDiag: 'nursCircumstanceStore,nursDiagnosisStore,nursPlanStore,nursDeptStore' },
        { nursState: 'nursStateStore,nursStateEavStore,nursDeptStore' },
        { nursAssm: 'nursAssessmentStore,nursDeptStore' },
        { rediation: 'rediationTreatmentStore,rediationTherapyRoomStore,rediationTherapyRegionStore,rediationDoctorStore' }
    ];

    // 중간결과/최종결과 생성
    createJob: any = {
        final: 'work/execute/final.json',
        interim: 'work/execute/result.json'
    };

    // SQL Reader Url
    sqlReader: any = {
        patient: 'work/result/ptInfo.json?',
        visit: 'work/result/visit.json?',
        diagnosis: 'work/result/diagnosis.json?',
        exam: 'work/result/exam.json?',
        examResult: 'work/result/examResult.json?',
        pathology: 'work/result/pathology.json?',
        medicine: 'work/result/medicine.json?',
        order: 'work/result/order.json?',
        fee: 'work/result/fee.json?',
        surgical: 'work/result/surgical.json?',
        cc: 'work/result/cc.json?',
        form: 'work/result/form.json?',
        nursDiag: 'work/result/nursDiag.json?',
        nursState: 'work/result/nursState.json?',
        nursEav: 'work/result/nursEav.json?',
        nursAssm: 'work/result/nursAssm.json?',
        concernPatient: 'work/result/concernPatient.json?',
        rediation: 'work/result/rediation.json?',
        final: 'work/result/finalResult.json?'
    };

    // SQL Viewer
    sqlViewer: any = {
        patient: 'getInterimResultPatientListSqlView.json',
        visit: 'getInterimResultVisitSqlView.json',
        diagnosis: 'getInterimResultDiagnosisSqlView.json',
        exam: 'getInterimResultExamSqlView.json',
        examResult: 'getInterimResultExamResultSqlView.json',
        pathology: 'getInterimResultPathologySqlView.json',
        medicine: 'getInterimResultMedicineSqlView.json',
        order: 'getInterimResultOrderSqlView.json',
        fee: 'getInterimResultFeeSqlView.json',
        surgical: 'getInterimResultSurgicalSqlView.json',
        cc: 'getInterimResultChiefComplaintSqlView.json',
        form: 'getInterimResultFormSqlView.json',
        nursDiag: 'getInterimResultNursDiagnosisSqlView.json',
        nursState: 'getInterimResultNursStateSqlView.json',
        nursEav: 'getInterimResultNursEavSqlView.json',
        nursAssm: 'getInterimResultNursAssessmentSqlView.json',
        concernPatient: 'getInterimResultConcernPatientSqlView.json',
        rediation: 'getInterimResultRediationSqlView.json',
        final: 'getFinalResultSqlView.json'
    };
    // 중간결과 Count
    resultCount: any = {
        patient: 'work/count/ptInfo.json',
        visit: 'work/count/visit.json',
        diagnosis: 'work/count/diagnosis.json',
        exam: 'work/count/exam.json',
        examResult: 'work/count/examResult.json',
        pathology: 'work/count/pathology.json',
        medicine: 'work/count/medicine.json',
        order: 'work/count/order.json',
        fee: 'work/count/fee.json',
        surgical: 'work/count/surgical.json',
        cc: 'work/count/cc.json',
        form: 'work/count/form.json',
        nursDiag: 'work/count/nursDiag.json',
        nursState: 'work/count/nursState.json',
        nursEav: 'work/count/nursEav.json',
        nursAssm: 'work/count/nursAssm.json',
        concernPatient: 'work/count/concernPatient.json',
        rediation: 'work/count/rediation.json',
        final: 'work/count/finalResult.json'
    };
    // 엑셀 파일 생성
    createExcel: any = {
        patient: 'getInterimResultPatientListExcel.json',
        visit: 'getInterimResultVisitExcel.json',
        diagnosis: 'getInterimResultDiagnosisExcel.json',
        exam: 'getInterimResultExamExcel.json',
        examResult: 'getInterimResultExamResultExcel.json',
        pathology: 'getInterimResultPathologyExcel.json',
        medicine: 'getInterimResultMedicineExcel.json',
        order: 'getInterimResultOrderExcel.json',
        fee: 'getInterimResultFeeExcel.json',
        surgical: 'getInterimResultSurgicalExcel.json',
        cc: 'getInterimResultChiefComplaintExcel.json',
        form: 'getInterimResultFormExcel.json',
        nursDiag: '',
        nursState: '',
        nursEav: '',
        nursAssm: '',
        concernPatient: '',
        rediation: '',
        final: ''
    };
    // 나이대/성별 데이터
    countByAge: any = {
        patient: 'getInterimResultPatientListCountByAge.json',
    }   
    
    // 중간결과 예외 항목 관리
    exceptResult: string[] = [
        'basicStore',
        'hospitalStore',
        'finalResultStore'
    ];

    // code 관리
    code: any = {
        hospital: {
            url: 'getHospitalList.json',
            storage: 'hospitalStore',
            idx: 'hspTpCd',
            name: 'hspTpNm'
        },
        medical: {
            url: 'getMedicalList.json',
            storage: 'medicalStore',
            idx: 'medDeptCd',
            name: 'medDeptNm'
        },
        doctor: {
            url: 'getDoctorList.json',
            storage: 'doctorStore',
            idx: 'drStfNo',
            name: 'drStfNm'
        },
        diagnosis: {
            url: 'getDiagnosisList.json',
            storage: 'diagnosisStore',
            idx: 'dgnsVocId',
            name: 'dgnsNm'
        },
        diagMed: {
            url: 'getDiagnosisMedicalList.json',
            storage: 'diagnosisMedicalStore',
            idx: 'medDeptCd',
            name: 'medDeptNm'
        },
        exam: {
            url: 'getExamList.json',
            storage: 'examStore',
            idx: 'exmCd',
            name: 'exmNm'
        },
        examResult: {
            url: 'getExamDetailList.json',
            storage: 'examResultStore',
            idx: 'allexamMdfmCpemId',
            name: 'exmNm'
        },
        examDetail: {
            url: 'getExamDetailList.json',
            storage: 'examDetailStore',
            idx: 'exmCd',
            name: ''
        },
        pathology: {
            url: 'getPathologyList.json',
            storage: 'pathologyStore',
            idx: 'plrtLdatKey',
            name: 'plrtLdatKey'
        },
        pathologySlip: {
            url: 'getPathologySlipList.json',
            storage: '',
            idx: 'ordSlipCtgCd',
            name: 'ordSlipCtgCd'
        },
        pathologyAutoComplete: {
            url: 'getPathologyAutoCompleteList.json',
            storage: 'pathologyAutoCompleteStore',
            idx: 'priLdatVal',
            name: 'priLdatVal'
        },
        medicine: {
            url: 'getMedicineList.json',
            storage: 'medicineStore',
            idx: 'mdprCd',
            name: 'kpemMdprNm'
        },
        order: {
            url: 'getOrderList.json',
            storage: 'orderStore',
            idx: 'ordCd',
            name: 'ordNm'
        },
        fee: {
            url: 'getFeeList.json',
            storage: 'feeStore',
            idx: 'ordCd',
            name: 'ordNm'
        },
        surgical: {
            url: 'getSurgicalList.json',
            storage: 'surgicalStore',
            idx: 'opVocId',
            name: 'opVocNm'
        },
        surDiag: {
            url: 'getSurgicalDiagnosisList.json',
            storage: 'surgicalDiagnosisStore',
            idx: 'dgnsVocId',
            name: 'dgnsNm'
        },
        surMed: {
            url: 'getSurgicalMedicalList.json',
            storage: 'surgicalMedicalStore',
            idx: 'medDeptCd',
            name: 'medDeptNm'
        },
        surDoc: {
            url: 'getSurgicalDoctorList.json',
            storage: 'surgicalDoctorStore',
            idx: 'drStfNo',
            name: 'drStfNm'
        },
        partiSur: {
            url: 'getPostOPCheckOutPlaceList.json',
            storage: 'postOPCheckOutPlaceStore',
            idx: 'opOutCd',
            name: 'opOutNm'
        },
        partiAnesth: {
            url: 'getAnesthesiaKindList.json',
            storage: 'anesthesiaKindStore',
            idx: 'anstKndCd',
            name: 'anstKndNm'
        },
        cc: {
            url: 'getChiefComplaintList.json',
            storage: 'chiefComplaintStore',
            idx: 'cfcmVocId',
            name: 'cfcmVocNm'
        },
        form: {
            url: 'getFormList.json',
            storage: 'formStore',
            idx: 'mdfmId',
            name: 'mdfmNm'
        },
        formDetail: {
            url: 'getFormDetailList.json',
            storage: 'formDetailStore',
            idx: 'allmdfmCpemId',
            name: 'mdfmNm'
        },
        nursStateDept: {
            url: 'getNursDeptList.json',
            storage: 'nursStateStore',
            idx: 'deptCd',
            name: 'deptNm'
        },
        nursCircum: {
            url: 'getNursCircumstanceList.json',
            storage: 'nursCircumstanceStore',
            idx: 'nrstId',
            name: 'nrstNm'
        },
        nursDiag: {
            url: 'getNursDiagnosisList.json',
            storage: 'nursDiagnosisStore',
            idx: 'nrstId',
            name: 'nrstNm'
        },
        nursPlan: {
            url: 'getNursPlanList.json',
            storage: 'nursPlanStore',
            idx: 'nrstId',
            name: 'nrstNm'
        },
        nursEav: {
            url: 'getNursEavList.json',
            storage: 'nursEavStore',
            idx: 'nrVocEntAtrItemId',
            name: 'nrVocEntNm'
        },
        nursEavItems: {
            url: 'getNursEavItemList.json',
            storage: 'nursEavItemsStore',
            idx: 'nrVocEntAtrItemId',
            name: 'nrVocEntNm'
        },
        nursState: {
            url: 'getNursStateList.json',
            storage: 'nursStateStore',
            idx: 'nrstId',
            name: 'nrstNm'
        },
        nursStateEav: {
            url: 'getNursStateEavList.json',
            storage: 'nursStateEavStore',
            idx: 'nrstAtrId',
            name: 'nrstNm'
        },
        nursAssm: {
            url: 'getNursCircumstanceList.json',
            storage: 'nursAssessmentStore',
            idx: 'nrstId',
            name: 'nrstNm'
        },
        concernPatient: {
            url: 'getConcernPatientList.json',
            storage: 'concernPatientStore',
            idx: 'ptNo',
            name: 'ptNo'
        },
        rediation: {
            url: 'getRediationTreatmentList.json',
            storage: 'rediationTreatmentStore',
            idx: 'ordCd',
            name: 'ordNm'
        },
        rediationRoom: {
            url: 'getRediationTherapyRoomList.json',
            storage: 'rediationTherapyRoomStore',
            idx: 'tyrmCd',
            name: 'tyrmNm'
        },
        rediationRegion: {
            url: 'getRediationTherapyRegionList.json',
            storage: 'rediationTherapyRegionStore',
            idx: 'trpRgnCd',
            name: 'trpRgnNm'
        },
        rediationDoctor: {
            url: 'getRediationDoctorList.json',
            storage: 'rediationDoctorStore',
            idx: 'drStfNo',
            name: 'drStfNm'
        },
        final: {
            storage: 'finalResultStore'

        }
    }

    // 조건문 셀렉트
    condition: any[] = [
        {name: 'and', value: 'and'},
        {name: 'or', value: 'or'},
        {name: 'not', value: 'not'}
    ];   
    constructor(
        private _translate: TranslateService
    ) {
        
    }
}
