import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { DiagramState } from '../diagram.state';

import { PowermodeStoreService } from '../store/store.service';
import { ScenarioService } from './scenario.service';
import { DiagramService } from '../diagram.service';
import { DeleteScenarioModal } from '../../modal/delete-scenario-modal.component';
import { ShareListModal } from '../../modal/share-list-modal.component';
import { Router } from '@angular/router';

@Component({
    selector: 'scenario-list',
    templateUrl: './scenario-list.component.html',
    providers: [ ScenarioService, PowermodeStoreService, DiagramState ]
})
export class ScenarioListComponent implements OnInit {
    closeResult: string;

    myQueries: any[] = [];
    sharedQueries: any[] = [];

    modifying = false;
    config: any;

    constructor(
        private _app: AppState,
        private _appService: AppService,
        private _store: PowermodeStoreService,
        private _modalService: NgbModal,
        private _service: ScenarioService,
        private _diagramService: DiagramService,
        private _router: Router,
        public activeModal: NgbActiveModal,
    ) {
        
    }
    ngOnInit() {
        sessionStorage.setItem('currentUrl', this._router.url);
        this._diagramService.getCurUrl('scenario');
        this.getMyQueryList();
        this.getSharedQueryList();
    }
    // 시나리오 목록 불러오기
    getMyQueryList() {
        this.myQueries = [];
        this._service.myQueries().subscribe(res => {
            for (let data of res) {
                const shareStfNo = data.shareStfNo.split(', ');
                
                this.myQueries.push({
                    id: data.queryFlowId,
                    nm: data.queryFlowNm,
                    dtm: data.saveDtm.substring(0, 10),
                    ctg: data.category,
                    cdt: data.condition,
                    idxs: data.indexs,
                    syn: data.shareYn,
                    sid: shareStfNo
                });
            }
        });
    }

    getSharedQueryList() {
        this.sharedQueries = [];
        this._service.sharedQueries().subscribe(res => {
            for (let data of res) {
                this.sharedQueries.push({
                    id: data.queryFlowId,
                    nm: data.queryFlowNm,
                    stf: data.stfNo,
                    dtm: data.saveDtm.substring(0, 10),
                    ctg: data.category,
                    cdt: data.condition,
                    idxs: data.indexs
                });
            }
        });
    }

    // 시나리오 삭제
    deleteQuery(event: MouseEvent, scId: string, scNm: string) {
        event.stopPropagation();
        event.preventDefault();
        const modalRef = this._modalService.open(DeleteScenarioModal);
        modalRef.componentInstance.data = scNm;
        modalRef.result.then((result) => {
            if (result === 'Confirm') {
                this._service.deleteQuery(scId).subscribe(res => {
                    if(res) {
                        this.getMyQueryList();
                    }
                });
            }
        }, (reason) => {
            this.closeResult = `Dismissed ${reason}`;
        });
    }

    // 저장된 시나리오 불러오기
    openQuery(id) {
        this._service.openQuery(id).subscribe(res => {
            if(res.basicStore) {
                let store = res;
                store.basicStore.stfNo = sessionStorage.getItem('stfNo');
                this._diagramService.setLoadStore(res);
                this._router.navigateByUrl('/tempAuth.do/powermode/paper', { skipLocationChange: true });               
            }
        });
    }

    shareList(event: MouseEvent, sid: any) {
        event.stopPropagation();
        event.preventDefault();
        
        const store = Object.assign({}, this._store.store);
        const modalRef = this._modalService.open(ShareListModal);

        let list = '';

        sid.forEach((person, index) => {
            person = `'${person.substring(0, 5)}'`;

            if (index < sid.length - 1) {
                person = person + ',';
            }

            list = list + person;
        });

        modalRef.componentInstance.data = list;
        modalRef.result.then((result) => {
            if (result === 'Confirm') {

            }
        }, (reason) => {
            this.closeResult = `Dismissed ${reason}`;
        });
    }

    onClose() {
        this._router.navigateByUrl("/tempAuth.do/powermode/paper", { skipLocationChange: true });

        const prevLink = sessionStorage.getItem('prevLink');

        // if (prevLink === 'gate' || prevLink === 'condition') {
            this._diagramService.setStateWork({ mode: 'edit' });
        // } else if (prevLink === 'interim') {
            // this._diagramService.setStateWork({ mode: 'patient' });
        // } else if (prevLink === 'final') {
            // this._diagramService.setStateWork({ mode: 'output' });
        // }
    }
}
