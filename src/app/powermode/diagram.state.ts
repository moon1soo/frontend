import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

@Injectable()
export class DiagramState {
    // 한 번에 드래그 가능한 row
    maxAddRows: number = 1000;
    
    ajaxUrl = {
        sql: 'getAllGroupInfoResultSqlView.json',
        finalSql: 'getGroupInfoFinalResultSqlView.json',
        getRefData: 'getRefDateList.json',
        irbUrl: 'getIRBApprovalList.json',
        irbLog: 'getIRBLogInsert.json',
        selectFilter: 'getSelectedGroupFilterCodeList.json',
        ltList: 'getLookUpDataList.json',
        itemList: 'getFinalAddItemList.json',
        ptInfoList: 'getConcernPatientList.json'
    };
    // queryFlow Url 관리
    queryFlowUrl = {
        list: 'getQueryFlowAllListForPowerMode.json',
        detailList: 'getQueryFlowDetailListForPowerMode.json',
        sharedList: 'getQueryFlowSharedListForPowerMode.json',
        save: 'getQueryFlowSaveForPowerMode.json',
        update: 'getQueryFlowUpdate.json',
        delete: 'getQueryFlowDelete.json'
    };
    // SQL Reader Url
    sqlReader: any = {
        create: 'work/execute/result.json',
        query: 'work/result/ptInfo.json',
        count: 'work/count/ptInfo.json',
        excel: 'work/execute/excel/ptInfo.json',
        cancelJob: 'work/cancel.json',
        finalCreate: 'work/execute/final.json',
        finalQuery: 'work/result/finalResult.json',
        finalCount: 'work/count/finalResult.json',
        finalexcel: 'work/execute/excel/finalResult.json'
    };    
}