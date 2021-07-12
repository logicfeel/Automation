
(function(global) {
    "use strict";

    //==============================================================
    // 1. 모듈 네임스페이스 선언
    global._W               = global._W || {};
    global._W.Collection    = global._W.Collection || {};

    //==============================================================
    // 2. 모듈 가져오기 (node | web)
    var ICollection;
    var Observer;    

    if (typeof module === "object" && typeof module.exports === "object") {
        ICollection         = require("./i-collection");
        Observer            = require("./observer");
    } else {
        ICollection         = global._W.Interface.ICollection;
        Observer            = global._W.Common.Observer;
    }

    //==============================================================
    // 3. 모듈 의존성 검사
    if (typeof Observer === "undefined") throw new Error("[Observer] module load fail...");
    if (typeof ICollection === "undefined") throw new Error("[ICollection] module load fail...");

    //==============================================================
    // 4. 모듈 구현 
    
    var BaseCollection  = (function () {
       /**
        * 컬렉션 최상위 클래스 (추상클래스)
        * @constructs Collection.BaseCollection
        * @implements {Interface.ICollection}
        * @param {Object} p_onwer 소유객체
        */
        function BaseCollection(p_onwer) { 
            
            var __elementType   = null;

            /** @private */
            this.__event        = new Observer(this, this);

            /** 
             * 소유객체
             * @protected 
             * @member {Object}
             */
            this._onwer         = p_onwer;

            /** 
             * 배열요소
             * @protected 
             * @member {Array}
             */
            this._element       = [];
            
            /** 
             * 심볼 배열입니다. 
             * @protected
             * @member {Array} 
             */
            this._symbol        = [];

            /** @member {Observer}  Collection.BaseCollection#elementType 요소타입 */
            Object.defineProperty(this, "elementType", {
                enumerable: true,
                configurable: true,
                get: function() {
                    return __elementType;
                },
                set: function(newValue) {
                    if(typeof newValue !== "function") throw new Error("Only [elementType] type 'function' can be added");
                    if(typeof newValue === "function" && typeof ["number", "string", "boolean"].indexOf(newValue.name) > -1) {
                        throw new Error("Only [elementType] type Not 'number', 'string', 'boolean' can be added");
                    }
                    __elementType = newValue;
                }
            });

            /**
             * 컬렉션 목록 
             * @member {Array}  Collection.BaseCollection#list  
             */
            Object.defineProperty(this, "list", {
                enumerable: true,
                configurable: true,
                get: function() {
                    return this._element;
                }
            });

            /**
             * 컬랙션 갯수 
             * @member {Number} Collection.BaseCollection#count 
             */
            Object.defineProperty(this, "count", {
                enumerable: true,
                configurable: true,
                get: function() {
                    return this._element.length;
                }
            });

            /** 
             * 변경(등록/삭제) 후 이벤트  
             * @event Collection.BaseCollection#onAdd 
             */
            Object.defineProperty(this, "onAdd", {
                enumerable: true,
                configurable: true,
                set: function(p_fn) {
                    this.__event.subscribe(p_fn, "add");
                }
            });

            /** 
             * 제거 이벤트
             * @event Collection.BaseCollection#onRemove
             */
            Object.defineProperty(this, "onRemove", {
                enumerable: true,
                configurable: true,
                set: function(p_fn) {
                    this.__event.subscribe(p_fn, "remove");
                }
            });

            /** 
             * 전체 제거 이벤트
             * @event Collection.BaseCollection#onClear
             */
            Object.defineProperty(this, "onClear", {
                enumerable: true,
                configurable: true,
                set: function(p_fn) {
                    this.__event.subscribe(p_fn, "clear");
                }
            });

            /** 
             * 변경(등록/삭제) 전 이벤트  
             * @event Collection.BaseCollection#onChanging 
             */
            Object.defineProperty(this, "onChanging", {
                enumerable: true,
                configurable: true,
                set: function(p_fn) {
                    this.__event.subscribe(p_fn, "changing");
                }
            });

            /** 
             * 변경(등록/삭제) 후 이벤트  
             * @event BaseCollection#onChanged 
             */
            Object.defineProperty(this, "onChanged", {
                enumerable: true,
                configurable: true,
                set: function(p_fn) {
                    this.__event.subscribe(p_fn, "changed");
                }
            });

            // 예약어 등록
            this._symbol = this._symbol.concat(["__event", "_onwer", "_element", "_symbol", "elementType", "list", "count"]);
            this._symbol = this._symbol.concat(["onAddr", "onRemove", "onClear", "onChanging", "onChanged"]);
            this._symbol = this._symbol.concat(["_getPropDescriptor", "_onAdd", "_onRemove", "_onClear", "_onChanging", "_onChanged"]);
            this._symbol = this._symbol.concat(["_remove", "add", "clear", "remove", "removeAt", "indexOf"]);

            /** implements ICollection 인터페이스 구현 */
             this._implements(ICollection);
        }
    
        /**
         * 프로퍼티 기술자 설정
         * @protected
         * @param {number} p_idx 인덱스
         */
        BaseCollection.prototype._getPropDescriptor = function(p_idx) {
            return {
                get: function() { return this._element[p_idx]; },
                set: function(newValue) {
                    
                    var typeName;

                    if (this.elementType !== null && !(newValue instanceof this.elementType)) {
                        // typeName = this.elementType.constructor.name; // REVIEW::
                        typeName = this.elementType.name || this.elementType.constructor.name;
                        throw new Error("Only [" + typeName + "] type instances can be added");
                    }
                    this._element[p_idx] = newValue; 
                },
                enumerable: true,
                configurable: true
            };
        };

        /**
         * @listens Collection.BaseCollection#onClear
         */
        BaseCollection.prototype._onAdd = function(p_idx, p_value) {
            this.__event.publish("add", p_idx, p_value); 
        };

        /**
         * @listens Collection.BaseCollection#onRemove
         */
        BaseCollection.prototype._onRemove = function(p_idx) {
            this.__event.publish("remove", p_idx); 
        };

        /** 
         *  전체삭제 이벤트 수신
         * @listens Collection.BaseCollection#onClear
         */
        BaseCollection.prototype._onClear = function() {
            this.__event.publish("clear"); 
        };

        /** 
         *  변경(등록/삭제) 전 이벤트 수신
         * @listens Collection.BaseCollection#onChanging
         */
        BaseCollection.prototype._onChanging = function() {
            this.__event.publish("changing"); 
        };

        /** 
         *  변경(등록/삭제) 후 이벤트 수신
         * @listens Collection.BaseCollection#onChanged
         */        
        BaseCollection.prototype._onChanged = function() {
            this.__event.publish("changed"); 
        };

        /** @abstract */
        BaseCollection.prototype._remove  = function() {
            throw new Error("[ _remove() ] Abstract method definition, fail...");
        };

        /** @abstract */
        BaseCollection.prototype.add  = function() {
            throw new Error("[ add() ] Abstract method definition, fail...");
        };
        
        /** 
         * 전체삭제(초기화)
         * @abstract 
         * @fires Collection.BaseCollection#onClear 
         */
        BaseCollection.prototype.clear  = function() {
            throw new Error("[ clear() ] Abstract method definition, fail...");
        };

        /**
         * 배열속성 삭제
         * @param {element} p_elem 속성명
         * @returns {number} 삭제한 인덱스
         */
        BaseCollection.prototype.remove = function(p_elem) {
            
            var idx;
            
            this._onChanging();                     // 이벤트 발생 : 변경전
            
            if (this.contains(p_elem)) {
                idx = this.indexOf(p_elem);
                this._remove(idx);
            }
            
            this._onRemove(idx);                    // 이벤트 발생 : 삭제
            this._onChanged();                      // 이벤트 발생 : 변경후

            return idx;
        };
        
        /**
         * 배열속성 삭제
         * @param {number} p_idx 인덱스
         */
        BaseCollection.prototype.removeAt = function(p_idx) {

            var obj = this._element[p_idx];
            
            this._onChanging();                     // 이벤트 발생 : 변경전
            
            if (typeof obj !== "undefined") this._remove(p_idx);

            this._onRemove();                       // 이벤트 발생 : 삭제
            this._onChanged();                      // 이벤트 발생 : 변경후
        };

        /**
         * 배열속성 여부 
         * @param {object} p_elem 속성 객체
         * @returns {boolean}
         */
        BaseCollection.prototype.contains = function(p_elem) {
            return this._element.indexOf(p_elem) > -1;
        };

        /**
         * 배열속성 인덱스 찾기
         * @param {Object} p_elem 속성 객체
         * @returns {Number}
         */
        BaseCollection.prototype.indexOf = function(p_elem) {
            return this._element.indexOf(p_elem);
        };

        return BaseCollection;
    }());
    

    //==============================================================
    // 5. 모듈 내보내기 (node | web)
    if (typeof module === "object" && typeof module.exports === "object") {     
        module.exports = BaseCollection;
    } else {
        global._W.Collection.BaseCollection = BaseCollection;
    }

}(typeof module === "object" && typeof module.exports === "object" ? global : window));