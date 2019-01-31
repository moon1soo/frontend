/*******************************************************************************
 * @fileName : fn_stomp.js
 * @description : Stomp 클라이언트 (required library of Stomp.js), 서버에서 제공되는 웹소켓 메세지를 sockjs 방식이므로 이에 대해 송수신하기 위해 정의.
 * @author : lyjoon
 * @since : 2017. 11. 24.
 * @version 1.0
 *  == 개정이력(Modification Information) ==
 * 
 * 수정일 수정자 내용
 * ------------------------------------------------------------------------
 * 2017.11.24. 이용준 최초생성 
 * 2017.11.29. 이용준 기능보정 & "/User" Broker 추가
 * 
 ******************************************************************************/
(function(window) {

	var fn_stomp = function() {
		var that = {};// 리터럴 함수(외부용)
		var connections = {};// connection, client 관련 저장소, endpoint 단위기준으로 생성된 개체를 재생성하기 않기위해 만듬.

		/**
		 * [option] fn_stomp 관련 설정정보, 시스템 설정(endpoint, broker-prefix 등..)과 밀접하므로 option 값 수정시 어플리케이션 내 WebSocket 설정을 참조해서 변경한다.
		 */
		const option = {
			debugMode : true // 디버깅 모드(console.log 발생유무, 변경해도됩니다.)
			, defaultEndpoint : "/wsep" // Websocket Endpoint(default websocket-endpoint : /wsep)
			, appPrefix : "/app" // Websocket send URL prefix
			// Websocket Broker URL prefix., (/user는 특정사용자 | /topic은 전체사용자를 대상으로 함)
			, brokerPrefix : [ "/user", "/topic" ]
		};

		/**
		 * oprion.brokerPrefix 를 가져오는 분기식이 여러군데 사용됨에 따라 중복코드를 제거하고자 추가한 변수.
		 * 
		 * @param isTopic : (boolean) topic 여부, true이면 "/topic" 을 반환함
		 * @return String
		 */
		var getBrokerPrefix = function(isTopic, userName) {
			//return option.brokerPrefix[1];// 노유저테스트
			return option.brokerPrefix[( (isTopic || false) ? 1:0)] + ( (isTopic || false) ? "" : ("/" + userName));
		};

		/**
		 * 내부용 변수값 체크 함수, null 혹은 undefined 을 체크해서 true/false를 리턴함 option 내 debugMode값이 true인경우에만 console.log()를 표기함
		 * 
		 * @param v : null or undefined인지 확인할 변수, 값
		 * @param a : 구분자(발생지 혹은 숫자)
		 * @param b : 변수 'v'가 뭔지 알려주는 구분자 혹은 변수명
		 * @return 빈값이면 fasle, 빈값이 아니면 true를 반환함.
		 */
		var chk = function(v, a, b) {
			var rslt = true;
			if (v === undefined || v === null) {
				if (option.debugMode) {
					var logging = "[window.fn_stomp." + a + "] :: '" + b + "' is undefined(null).";
					console.log(logging);
				}
				rslt = false;
			}
			return rslt;
		};

		/**
		 * 각 함수에서 처리결과를 던져주기 위해 생성함.
		 * 
		 * @param b : (boolean) 정상처리여부
		 * @param m : (string) 처리결과 메세지
		 * @return obj
		 */
		var returnCommand = function(b, m) {
			var obj = new Object();
			obj["RESULT"] = chk(b, "rslt", "b") ? b : true;
			obj["MSG"] = m || "정상적으로 처리되었습니다.";
			return obj;
		};

		/**
		 * 웹소켓 endpoint 연결 endpoint 연결시도 후 연결여부는 콜백함수(두번쨰 인자) 내에서 확인해야한다.(closure)
		 * 
		 * @param parameter : 파라미터 개체 
		 * - parameter.id : [필수](string) 연결하려고하는 사용자 ID 
		 * - parameter.endpoint : [필수](string) 연결하려는 웹소켓 endpoint 경로(기본값 = '/wsep') 
		 * - parameter.contextPath : [필수아님](String) WAS에 ContextPath가 지정된 경우, parameter.endpoint 경로에 조합되있는 경우 해당 Connection을 찾을 수 없으므로 별도 변수로 받는다.
		 * - parameter.callback : [필수](function) 연결이후 call-back 함수(사용자정의), 콜백함수는 인자값으로 client 개체를 받는다. 
		 * - parameter.error : [필수아님](function) 연결시도과정에서 에러가 발생에 대한 callback 함수
		 */
		that.connect = function(parameter) {
			var socket = new SockJS((parameter.contextPath || "") + (parameter.endpoint || option.defaultEndpoint));
			var client = Stomp.over(socket);
			var connect_header = {};
			if ((parameter.id || "") !== "") connect_header["id"] = parameter.id;
			//if ((parameter.passcode || "") !== "") connect_header["passcode"] = parameter.passcode;
			client.connect(connect_header, function(frame) {
				connections[parameter.endpoint] = {
					"id" : parameter.id,
					"client" : client,
					"subscribes" : []
				};
				parameter.callback(client);
			}, function(frame) {
				// alert("ERROR!");
				// 재연결시도.유형별 에러코드 확인 후 정의.
				if (chk(parameter.error, "connect", "error")) parameter.error(frame);
			});
		};

		/**
		 * 서버로 메세지전송, 응답(response)는 없다. 전달하는 메세지 내용에 관한 subscribe가 등록된 경우, 비동기
		 * 요청/응답과 비슷하게 활용가능함.
		 * 
		 * @param parameter : 파라미터 개체 
		 * - parameter.endpoint : [필수](String | stompClient) endpoint 
		 * - parameter.url : [필수](String) 서버로 보낼 url 
		 * - parameter.parameter : [필수](Object) 서버로 보낼 메세지가 정의된 리터럴 객체 - 서버 측에서 인자가 변환되지 않을경우 에러가 발생할 수 있습니다! 
		 * - parameter.callback : [필수아님](function) 서버로 메세지 보낸 뒤 응답받을 subscribe를 새로 등록한다.
		 * 
		 * @return returnCommand
		 */
		that.send = function(parameter) {
			var client = this.getClient(parameter.endpoint);
			var b = true, m = "";
			valid: {
				if (!chk(client, "send", "client")) {
					b = false;
					m = "현재 연결된 서비스에 대한 클라이언트 정보가 없습니다.";
					break valid;
				}
				if (!chk(parameter.url, "send", "parameter.url")) {
					b = false;
					m = "URL이 지정되지 않았습니다.";
					break valid;
				}
				// 파라미터(param$json)와 Controller 내 인자값(payload) 간 유형(type)이 맞지 않을경우 url에 대한 Controller를 타지 않음. 인자값 유형 converter 관련해서 좀 찾아봐야함.
				client.send(option.appPrefix + parameter.url, {}, parameter.parameter);

				// callback 함수가 정의되어있으면 subscribe를 등록(갱신, topic=false)해준다.
				if (chk(parameter.callback, "send", "parameter.callback")) {
					// prefix 지정을 위해 기등록된 Subscribe 를 검색해본다.
					var beforeSubscribe = this.getSubscribe(parameter.endpoint, parameter.url);
					var beforeSubscribeTopic = beforeSubscribe !== null ? beforeSubscribe["topic"] : false;
					this.unsubscribe(parameter.endpoint, parameter.url);// 기존 subscribe 제거.
					// subscribe 등록!
					this.subscribe({
						endpoint : parameter.endpoint,
						url : parameter.url,
						topic : beforeSubscribeTopic,
						callback : parameter.callback
					});
				}
			}
			return returnCommand(b, m);
		};

		/**
		 * subscribe(수신) 등록 endpoint 에 대한 subscribe 를 등록하여 서버에서 발생되는 메세지를 수신한다.
		 * 메세지 타입은 json으로 수신하며, 콜백함수(_callback)를 통해 확인이 가능함.
		 * 
		 * @param parameter : (Object)파라미터 개체 
		 * 	- parameter.endpoint : [필수](String | stompClient)endpoint 
		 *  - parameter.url : [필수](String)subscribe path 
		 *  - parameter.topic :[필수아님](Boolean) subscribe broker 종류가 /topic인지 여부(기본값 :true) 
		 *  - parameter.callback : [필수](function) subscribe가 등록되면 수신되는 메세지를 처리하기 위한 callback 함수
		 * @return returnCommand
		 */
		that.subscribe = function(parameter) {
			var connection = this.getConnection(parameter.endpoint || option.defaultEndpoint);
			var b = true, m = "";
			valid: {
				if (!chk(connection, "subscribe", "connection")) {
					b = false;
					m = "현재 연결된 정보가 없습니다.";
					break valid;
				}
				var client = connection["client"];
				if (!chk(client, "subscribe", "client")) {
					b = false;
					m = "현재 연결된 서비스에 대한 클라이언트 정보가 없습니다.";
					break valid;
				}
				var _url = getBrokerPrefix(parameter.topic, connection["id"]) + parameter.url;
				var subscription = client.subscribe(_url, function(message) {
						message.ack();// 메세지를 수신하였다는 신호를 서버로 날린다.
						parameter.callback(message.body);// JSON으로 파싱해서 쓰세요!
					}
					, {id : _url, ack : "client"}// id는 고유한 값으로 지정되면 향후 subscribe를 변경하는데 용이하다.
				);

				// parameter.topic값에 의해 url이 분기될 수 있으므로 혼동을방지하고자 추가해둠-> (추가된 값은 getSubscribe, unsubscribe 에서 사용함)
				subscription["topic"] = parameter.topic;
				connection["subscribes"].push(subscription);
				that.setConnection(parameter.endpoint, connection);
			}
			return returnCommand(b, m);
		};

		/**
		 * 등록된 subscribe 제거 연결된 endpoint가 없거나 등록된 subscribe가 없을경우 별다른 예외를 발생하지 않고 콘솔-로깅처리함 -> chk();
		 * 
		 * @param endpoint endpoint 정보
		 * @param url
		 * @return this
		 */
		that.unsubscribe = function(endpoint, url) {
			valid: {
				var subscribe = this.getSubscribe(endpoint, url);
				if (chk(subscribe, "unsubscribe", "subscribe")) {
					subscribe.unsubscribe();
				}
			}
		};

		/**
		 * endpoint에 대한 client를 반환함.
		 * 
		 * @param endpoint
		 * @return client
		 */
		that.getClient = function(endpoint) {
			var connection = this.getConnection(endpoint || option.defaultEndpoint);
			return chk(connection, "getClient", "connection") ? connection["client"]
					: null;
		};

		/**
		 * endpoint & subscribeUrl 에 대한 subscribe를 반환함
		 * 
		 * @param endpoint
		 * @param url : endpoint에 대한 connection 변수에 등록된 subscribe 식별값(url)
		 */
		that.getSubscribe = function(endpoint, url) {
			var connection = this.getConnection(endpoint || option.defaultEndpoint);
			var subscribe = null;
			valid: {
				if (!chk(connection, "getSubscribe", "connection")) break valid;
				var subscribeList = connection["subscribes"];
				if (!chk(subscribeList, "getSubscribe"), "subscribeList") 
					subscribeList.some(function(v) {
						var _url = getBrokerPrefix(v.topic, connection["id"]) + url
						if (v["id"] === _url) {
							subscribe = v;
							return true;
						}
					});
			}
			return subscribe;
		}

		/**
		 * endpoint에 대한 connection을 반환함.
		 * 
		 * @param endpoint
		 * @return getConnection, null이 반환될수 있음
		 */
		that.getConnection = function(endpoint) {
			var key = (typeof (endpoint) === 'string' ? endpoint : endpoint.ws.url.substring(endpoint.ws.url.lastIndexOf("/"), endpoint.ws.url.length));
			chk(key, "getConnection", "key");
			return connections[key];
		};

		/**
		 * connection 저장
		 * 
		 * @param endpoint
		 * @param connection
		 */
		that.setConnection = function(endpoint, connection) {
			var key = (typeof (endpoint) === 'string' ? endpoint : endpoint.ws.url.substring(endpoint.ws.url.lastIndexOf("/"), endpoint.ws.url.length));
			connections[key] = connection;
		};

		/**
		 * endpoint 연결종료 해당 endpoint 에 대한 subscribe도 종료된다.
		 * 
		 * @param endpoint
		 */
		that.disconnect = function(endpoint) {
			var client = this.getClient(endpoint || option.defaultEndpoint);
			if (chk(client, "disconnect", 'client')) {
				client.disconnect(function() {
					connections[endpoint] = null;
				});
			}
		};

		/**
		 * endpoint에 대한 연결이 유효한지 확인함
		 * 
		 * @param endpoint : WebSocket 서버 EndPoint 정보(문자열) 혹은 이미 만들어진 EndPoint(SockJS) 개체
		 * @return endpoint 연결정보가 없는경우 null | endPoint가 연결된 경우 true | 연결되지 않은경우 false 반환
		 */
		that.isConnected = function(endpoint) {
			var rslt = false;
			var client = this.getClient(endpoint || option.defaultEndpoint);
			valid: {
				if (!chk(client, "isConnected", "client")) break valid;
				rslt = client.connected;
			}
			return rslt;
		};

		/**
		 * endpoint에 대한 id를 리턴함
		 * 
		 * @param endpoint
		 * @return (string) id
		 */
		that.getId = function(endpoint) {
			var resultId = null;
			var connection = this.getConnection(endpoint || option.defaultEndpoint);
			valid: {
				if (chk(connection, "getId", "connection")) break valid;
				resultId = connection["id"];
			}
			return resultId;
		};

		// 리터럴 개체 반환(생성).
		return that;
	}();

	window.fn_stomp = fn_stomp;

})(window);