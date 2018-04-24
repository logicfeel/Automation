'use strict';

var copyFileSync        = require('fs-copy-file-sync');     // node 에 기본 추가됨

var BaseCollection      = require('./BaseCollection');


function Namespace(pBaseTemplate) {
    
    // TODO: 타입검사 pBaseTemplate
    this._BT    = pBaseTemplate;
    // this.import = this._BT._using;

    // this.part = this._CommonTemplate.part;
    this.part = new NsCollection('part', this);
    this.data = new NsCollection('data', this);
    this.helper = new NsCollection('helper', this);
    this.decorator = new NsCollection('decorator', this);
}

// Namespace.prototype.using = function(pNamespace) {
    
//     // TODO: pNamespace 타입 검사 
//     if (!pNamespace instanceof Namespace) {
//         throw new Error('타입 오류 pNamespace:' + typeof pNamespace);
//     }
    
//     this._BT._using.push(pNamespace);
// };

Namespace.prototype.getNamespaceInfo = function() {
    
    var i = 0;
    
    var _part = {};
    var _helper = {};
    var _decorator = {};
    var _data = {};
    var _propName = '';
    var _dirname = '';
    var _basename = '';
    var baseTemplate = this._BT;
    var obj;    
    var data = this.data;
    var part = this.part;
    var helper = this.helper;
    var decorator = this.decorator;
    var prohibitName = ['_Ns', '_SCOPE'];
    var prop;

    
    for (prop in part) {
        if (part.hasOwnProperty(prop) && prohibitName.indexOf(prop) < 0) {

            _part = Object.assign(_part, part[prop].content);
        }
    }
/*
    // REVEIW: 아래 문법이 무난? 검토 _helper = this ? Object.assign({}, this.helper.slice(0, this.helper.length - 1)) : {};
    for(i = 0 ; this && i < this.helper.length; i++) {
        _helper = Object.assign(_helper, this.helper[i].content);
    }

    for(i = 0 ; this && i < this.decorator.length; i++) {
        _decorator = Object.assign(_decorator, this.decorator[i].content);
    }
*/

    // var nm = '';
    var namespace;

    for (prop in data) {
        if (data.hasOwnProperty(prop) && prohibitName.indexOf(prop) < 0) {

            namespace = { ns: {}};
            setNamespace(namespace['ns'], prop, data[prop].content);
            _data = Object.assign(_data, namespace);
        }
    }

    // 객체 이름을 객체로 만드는 함수 (네임스페이스)
    function setNamespace(pNS, pStr, pObj) {
        var parts = pStr.split('.');
        var parent = pNS;

        if (parts[0] === 'ns') {
            parts =parts.slice(1);
        }

        for (var i = 0; i < parts.length; i++) {
            if (typeof parent[parts[i]] === 'undefined') {
                if (i === parts.length - 1) {
                    parent[parts[i]] = pObj;
                } else {
                    parent[parts[i]] = {};
                }
            }
            parent = parent[parts[i]];
        }
        return parent;
    }

    return {
        part: _part,
        helper: _helper,
        decorator: _decorator,
        data: _data
    }
};

// ####################################################

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