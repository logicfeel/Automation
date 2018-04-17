'use strict';
var copyFileSync        = require('fs-copy-file-sync');     // node 에 기본 추가됨

var BaseCollection      = require('./BaseCollection');


function Namespace(pBaseTemplate) {
    
    // TODO: 타입검사 pBaseTemplate
    this._BT  = pBaseTemplate;
    this.import = this._BT._import;

    // this.part = this._CommonTemplate.part;
    this.part = new NsCollection('part', this);
    this.data = new NsCollection('data', this);
    this.helper = new NsCollection('helper', this);
    this.decorator = new NsCollection('decorator', this);
}

Namespace.prototype.import = function(pNamespace) {
    
    // TODO: pNamespace 타입 검사 
    if (!pNamespace instanceof Namespace) {
        throw new Error('타입 오류 pNamespace:' + typeof pNamespace);
    }
    
    this.import.push(pNamespace);
};


function NsCollection(pAttr, pNamespace) {

    this._SCOPE     = pAttr;
    this._Ns        = pNamespace;
    
}

NsCollection.prototype.add = function(pAttr, pBaseCollection) {
    
    if (!pBaseCollection instanceof BaseCollection) {
        throw new Error('타입 오류 pBaseCollection:' + typeof pBaseCollection);
    }

    Object.defineProperty(this, pAttr, {
        get: function() { 
            return pBaseCollection[pAttr]; 
        },
        set: function(newValue) { 
            // 1. TemplateSource 를 삽입한경우
            if (newValue instanceof TemplateSource) {
                
                // 객체 복제
                _this._items[pIdx] = newValue.clone(pathInfo.attrName, pathInfo.savePath);
                
                // 파일 복사
                copyFileSync(newValue.path, pathInfo.savePath);
            
            // 2/3. : String
            } else if (typeof newValue === 'string' ||  typeof newValue === 'function') {
                
                // TODO: 파일 동적 수정이 로그 __파일명 남겨야 함
                pBaseCollection[pAttr].content = newValue;
            
            } else {
                throw new Error('입력 타입 오류 :' + typeof newValue);
            }

            
        },
        enumerable: true,
        configurable: true
    });

};


module.exports = {
    Namespace: Namespace,
    NsCollection: NsCollection
};