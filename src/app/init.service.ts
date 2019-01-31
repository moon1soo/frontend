import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class InitService {
	private initUrl;

	constructor(private http: Http) {

	}
	
	public getHost() {
		return this.initUrl; 
	}

	public load(): Promise<any> {
		let asseturl;
		if(~window.location.href.indexOf('localhost:4200')) {
			asseturl = '../assets/host.json';
		} else {
			asseturl = 'assets/host.json';
        }
		return new Promise(resolve => {
			this.http.get(asseturl).map(r => r.json())
				.subscribe(response => { 
					console.log(response);
					this.initUrl = response;
					sessionStorage.setItem('socketUrl', JSON.stringify(response.socket));
					resolve();
				});
			
		});
	}
}