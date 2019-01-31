import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DxDataGridModule } from 'devextreme-angular';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { ClickOutsideModule } from 'ng-click-outside';

import { RediationSearchComponent } from '../rediationview/rediation-search/rediation-search.component';
import { RediationServerComponent } from '../rediationview/rediation-search/rediation-server.component';
import { RediationClientComponent } from '../rediationview/rediation-search/rediation-client.component';
import { RediationFilterComponent } from '../rediationview/rediation-search/rediation-filter.component';
import { RediationRoomSearchComponent } from '../rediationview/rediation-room/rediation-room-search.component';
import { RediationRoomServerComponent } from '../rediationview/rediation-room/rediation-room-server.component';
import { RediationRoomClientComponent } from '../rediationview/rediation-room/rediation-room-client.component';
import { RediationRoomFilterComponent } from '../rediationview/rediation-room/rediation-room-filter.component';
import { RediationRegionSearchComponent } from '../rediationview/rediation-region/rediation-region-search.component';
import { RediationRegionServerComponent } from '../rediationview/rediation-region/rediation-region-server.component';
import { RediationRegionClientComponent } from '../rediationview/rediation-region/rediation-region-client.component';
import { RediationRegionFilterComponent } from '../rediationview/rediation-region/rediation-region-filter.component';
import { RediationDoctorSearchComponent } from '../rediationview/rediation-doctor/rediation-doctor-search.component';
import { RediationDoctorServerComponent } from '../rediationview/rediation-doctor/rediation-doctor-server.component';
import { RediationDoctorClientComponent } from '../rediationview/rediation-doctor/rediation-doctor-client.component';
import { RediationDoctorFilterComponent } from '../rediationview/rediation-doctor/rediation-doctor-filter.component';


export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
    imports: [
        CommonModule,
		FormsModule,
		HttpModule,
		ReactiveFormsModule,
		NgbModule.forRoot(),
		TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
		DxDataGridModule,
        SplitPaneModule,
        ClickOutsideModule
    ],
    exports: [
        RediationSearchComponent,
        RediationServerComponent,
        RediationClientComponent,
        RediationFilterComponent,
        RediationRoomSearchComponent,
        RediationRoomServerComponent,
        RediationRoomClientComponent,
        RediationRoomFilterComponent,
        RediationRegionSearchComponent,
        RediationRegionServerComponent,
        RediationRegionClientComponent,
        RediationRegionFilterComponent,
        RediationDoctorSearchComponent,
        RediationDoctorServerComponent,
        RediationDoctorClientComponent,
        RediationDoctorFilterComponent
    ],
    declarations: [
        RediationSearchComponent,
        RediationServerComponent,
        RediationClientComponent,
        RediationFilterComponent,
        RediationRoomSearchComponent,
        RediationRoomServerComponent,
        RediationRoomClientComponent,
        RediationRoomFilterComponent,
        RediationRegionSearchComponent,
        RediationRegionServerComponent,
        RediationRegionClientComponent,
        RediationRegionFilterComponent,
        RediationDoctorSearchComponent,
        RediationDoctorServerComponent,
        RediationDoctorClientComponent,
        RediationDoctorFilterComponent
    ]
})
export class SharedRediationModule { }
