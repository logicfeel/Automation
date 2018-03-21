
//####################################################
// Merge file : LArray.js

(function(G) {
    'use strict';
    var _G;     // 내부 전역

    /**
     * !! prototype 노출형 부모 (부모.call(this);  <= 불필요
     * 제한1 : var(private) 사용 못함
     * 제한2 : 생성자 전달 사용 못함
     * 제한3 : 부모.call(this) 비 호출로 초기화 안됨
     * 장점 : 중복 호출 방지 (성능 향상)  **
     * @name LAarry (LoagicArayy)
     */
    function LArray() {

        this.isDebug        = false;
        this._items         = [];
        this._SCOPE         = "LArray";
    }
    (function() {   // prototype 상속 정의
        LArray.prototype =  Object.create(Array.prototype); // Array 상속
        LArray.prototype.constructor = LArray;
        LArray.prototype.parent = Array.prototype;
    }());

    // !! 여긴 staitc 변수가 됨
    // LArray.prototype._items = [];
    // LArray.prototype._SCOPE = "LArray";
    
    LArray.prototype._init = function() {
        // PATH : 1.0.2
        // LArray.prototype._items = [];
        this._items = [];
    };
    
    LArray.prototype._setPropertie = function(pIdx, pGetCallback, pSetCallback) {

        var _getter = pGetCallback ? pGetCallback.bind(this, pIdx) : function() { return this._items[pIdx]; };
        var _setter = pSetCallback ? pSetCallback.bind(this, pIdx) : function(newValue) { this._items[pIdx] = newValue; };
        
        // var _setter = pSetCallback ? pSetCallback : function(newValue) { 
            
        //     console.log('::: > 임시 파일 복사..>>');
        //     this._items[pIdx] = newValue; 
        // };
        
        var obj = {
            get: _getter,
            set: _setter,
            enumerable: true,
            configurable: true
        };
        // var obj = {
        //     get: function() { return this._items[pIdx]; },
        //     set: function(newValue) { 
        //             console.log('::: > 임시 파일 복사..>>');
        //         this._items[pIdx] = newValue; 
        //     },
        //     enumerable: true,
        //     configurable: true
        // };
        // return obj;      

        return obj;        
    }

    LArray.prototype.setPropCallback = function(pPropName, pGetCallback, pSetCallback, pValue) {
        
        var obj = {
            enumerable: true,
            configurable: true
        };
        
        if (typeof pGetCallback === "function") {
            obj.get = pGetCallback;
        } else {    // 겟터 기본값 설정  :: PATH
            obj.get = function(){return null};
        }

        if (typeof pSetCallback === "function") {
            obj.set = pSetCallback;
        
        } else {    // 셋터 기본값 설정  :: PATH
            obj.set = function(){};
        }

        Object.defineProperty(this, pPropName, obj);
    }

    /**
     *  - pValue : (필수) 값  
     *      +  구조만 만들경우에는 null 삽입
     *  - 객체는 필수, pAttrName : (선택) 속성명
     * TODO : 키와 이름 위치 변경 검토?
     */
    LArray.prototype.pushAttr = function(pValue, pAttrName, pGetCallback, pSetCallback) {
        
        var index   = -1;
        
        this.push(pValue);
        // this._items.push(pValue);

        index = (this.length === 1) ? 0 : this.length  - 1;

        Object.defineProperty(this, [index], this._setPropertie(index, pGetCallback, pSetCallback));
        if (pAttrName) {
            Object.defineProperty(this, pAttrName, this._setPropertie(index, pGetCallback, pSetCallback));
        }
    };

    // TODO: 삭제 구현 필요
    // pAttrName (필수)
    LArray.prototype.popAttr = function(pAttrName) {
        
        var idx = this.indexOfAttr(pAttrName);

        delete this[pAttrName];                 // 내부 이름 참조 삭제
        return this.splice(idx, 1);                    // 내부 참조 삭제
        // PATH 1.0.2
        // return this._items.splice(idx, 1);      // _items 삭제
    };

    LArray.prototype.indexOfAttr = function(pAttrName) {
        
        var idx = this._items.indexOf(this[pAttrName]);
        return idx;
    };

    // index 로 속성명 찾기
    LArray.prototype.attributeOfIndex = function(pIndex) {

        for (var prop in this) {
            if ( this.hasOwnProperty(prop)){
                if (!isFinite(prop) && this[prop] === this[pIndex]) {
                    return prop;
                }
            }
        }

        return null;
    };

    // Array 오버라이딩 :: PATH 
    LArray.prototype.splice = function() {

        var params = Array.prototype.slice.call(arguments);
        
        Array.prototype.splice.apply(this._items, params)
        return Array.prototype.splice.apply(this, params);
    };

    // Array 오버라이딩 :: PATH 
    LArray.prototype.push = function() {

        var params = Array.prototype.slice.call(arguments);
        
        Array.prototype.push.apply(this._items, params);
        return Array.prototype.push.apply(this, params);
    };


    /**
     * 배포
     * node 등록(주입)  AMD (RequireJS) 방식만 사용함
     * ! 추후 CommonJS (define) 방식 추가 필요함
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports  = LArray;
        _G = global;    // node 
    } else {
        _G = G;         // web
    }

    // 전역 배포 (모듈형식)
    _G.L                    = _G.L || {};
    _G.L.class              = _G.L.class || {};
    _G.L.class.LArray       = LArray;

}(this));

