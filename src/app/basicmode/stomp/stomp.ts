import { StompConfig, StompService } from '@stomp/ng2-stompjs';

declare const $: any;

const stfNo = sessionStorage.getItem('stfNo');
console.log(JSON.parse(sessionStorage.getItem('socketUrl')));
export const stompConfig: StompConfig = {
    url: JSON.parse(sessionStorage.getItem('socketUrl')),

    headers: {
        login: stfNo,
        passcode: stfNo
    },

    heartbeat_in: 1000,
    heartbeat_out: 1000,

    reconnect_delay: 0,

    debug: true
};
