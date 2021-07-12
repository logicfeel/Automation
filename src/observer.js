(function(global) {

    "use strict";

    //==============================================================
    // 1. 모듈 네임스페이스 선언
    global._W               = global._W || {};
    global._W.Common        = global._W.Common || {};

    //==============================================================
    // 2. 모듈 가져오기 (node | web)
    if (typeof module === "object" && typeof module.exports === "object") {     
    } else {
    }

    //==============================================================Á
    // 3. 의존성 검사

    //==============================================================
    // 4. 모듈 구현    
    
    var Observer = (function () {
        /**
         * @constructs _W.Common.Observer
         * @classdesc 구독자 클래스, 이벤트에 활용
         * @param {obejct} p_onwer Observer 클래스의 소유 함수 또는 클래스
         * @param {object} p_this 함수 호출 본문에서 this 역활 publish.apply(p_this, ...)
         */
        function Observer(p_onwer, p_this) {

            this.isDebug = false;

            /**
             * 등록함수의 this 
             * @member {Object}   
             */
            this._this = p_this;    

            /** 
             * 이벤트의 소유자
             * @protected
             * @member {Object}   
             */
            this._onwer = p_onwer;
            
            /**
             * 전역 구독자
             * @member {Object}
             */
            this.subscribers = {
                any: []
            };
            
            /** 
             * 이벤트 전파 설정 (기본값:true)
             * @member {Boolean}
             */
            this.propagation    = true;

            /** 
             * 단일 구독자 모드, 마지막 등록 구독자만 활성화 (기본값:true)  
             * @member {Boolean} 
             */
            this.isMultiMode    = true;
        }

        /**
         * 구독 신청
         * 이벤트 "p_code"를 입력하지 않으면 전역(any)에 등록 된다.
         * @param {function} p_fn  구독 콜백 함수
         * @param {?string} p_code 구독 코드명 : 기본값 "any"
         */
        Observer.prototype.subscribe = function(p_fn, p_code) {
            p_code = p_code || 'any';

            var subscribers = null;

            if (typeof p_fn === "undefined") throw new Error("p_fn param request fail...");
            if (typeof p_fn !== "function") throw new Error("Only [p_fn] type 'function' can be added");

            // 싱글모드일 경우 기존내용 모두 제거
            if (!this.isMultiMode) this.unsubscribeAll(p_code);

            if (typeof this.subscribers[p_code] === "undefined") {
                this.subscribers[p_code] = [];
            }
            subscribers = this.subscribers[p_code];
            subscribers.push(p_fn);
        };
        
        /**
         * @desc 이벤트 "p_code"를 입력하지 않으면 전역(any)에서 취소 된다.
         * @param {function} p_fn [필수] 이벤트 콜백 함수
         * @param {?string} p_code 이벤트 코드명 : 기본값 "any"
         */
        Observer.prototype.unsubscribe = function(p_fn, p_code) {
            p_code = p_code || "any";

            if (typeof p_fn === "undefined") throw new Error("p_fn param request fail...");

            if (this.subscribers[p_code]) {
                for (var i = 0; i < this.subscribers[p_code].length; i++) {
                    if (this.subscribers[p_code][i] === p_fn) {
                        this.subscribers[p_code].splice(i, 1);
                    }
                }
            }
        };

        /**
         * 
         * @param {?string} p_code 이벤트 코드명
         * @desc 
         *  - p_code 입력하면 해당 콜백함수들 구독 취소한다.
         *  - p_code 를 입력하지 않으면 전체 등록된 이벤트가 취소된다.
         */
        Observer.prototype.unsubscribeAll = function(p_code) {

            if (typeof p_code === "undefined") {     // 전체 구독 삭제
                this.subscribers = {any: []};
            } else {                        // 코드명 구독(함수) 전체 삭제
                delete this.subscribers[p_code];
            }
        };

        /**
         * @desc 구독 함수 호출
         * @param {?string} p_code 이벤트 코드명 : 기본값 "any"
         */
        Observer.prototype.publish = function(p_code) {
            p_code = p_code || "any";
            
            var args = Array.prototype.slice.call(arguments);
            var params = args.length >= 1 ? args.splice(1) : [];

            // this.propagation = true;    // 이벤트 전파

            if (p_code in this.subscribers) {
                for (var i = 0; i < this.subscribers[p_code].length; i++) {
                    if (typeof this.subscribers[p_code][i] === "function") {
                        // this.subscribers[p_code][i].call(this._this, this._onwer);  // REVIEW:: _onwer 인수 확인필요! >> 전달파라메터 
                        this.subscribers[p_code][i].apply(this._this, params);
                    }
                }
            }
            
            if (this.isDebug) {
                console.log("publish() 이벤트 발생 [" + this._this.constructor.name + "] type:" + p_code);
            }
        };

        Observer.prototype.stopPropagation = function() {
            this.propagation = false;
        }

        return Observer;
        
    }());

    //==============================================================
    // 5. 모듈 내보내기 (node | web)
    if (typeof module === "object" && typeof module.exports === "object") {     
        module.exports = Observer;
    } else {
        global._W.Common.Observer = Observer;
    }

}(typeof module === "object" && typeof module.exports === "object" ? global : window));