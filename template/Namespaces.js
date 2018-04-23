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

Namespace.prototype.getTemplateInfo = function() {
    
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
/*
    // gulp-hp 전달 객체 조립 
    for(i = 0 ; this && i < this.part.length; i++) {
        // _dirname = path.dirname(path.relative(baseTemplate.PATH['template_part'], this.part[i].path));
        // _dirname  = _dirname === '.' ? '' : _dirname;   // 현재 디렉토리 일 경우 
        // _dirname  = _dirname != '' ? _dirname + '/' : _dirname;
        // _basename =  path.basename(this.part[i].path, baseTemplate.PATT_GLOB['ext']);  // 확장자 제거(.hbs)
        
        // buff = {};
        // buff[this.part[i].attr] = this.part[i].content;
        
        _part = Object.assign(_part, recursiveAttr(this.part[i].attr, this.part[i].content));
    }

    // REVEIW: 아래 문법이 무난? 검토 _helper = this ? Object.assign({}, this.helper.slice(0, this.helper.length - 1)) : {};
    for(i = 0 ; this && i < this.helper.length; i++) {
        _helper = Object.assign(_helper, this.helper[i].content);
    }

    for(i = 0 ; this && i < this.decorator.length; i++) {
        _decorator = Object.assign(_decorator, this.decorator[i].content);
    }
*/
    var data = this.data;
    var prohibitName = ['_Ns', '_SCOPE'];
    // var nm = '';
    var NS = {};

    for (var prop in data) {
        if (data.hasOwnProperty(prop) && prohibitName.indexOf(prop) < 0) {

            // nm = prop.split('.');
            NS = {};

            obj = setNamespace(prop, this.data[prop].content);
            // obj = this.data[prop].content;
            // obj[prop] = this.data[prop].content;
            _data = Object.assign(_data, NS);

            console.log(prop);
            // if (typeof content[prop] === 'object') {
            //     buff = recursiveAttr(prop, content[prop]);
            // } else {
            //     buff[prop] = content[prop];
            // }
        }
    }
    // function namespaceSub(pStr) {
    //     var parts = pStr.split('.');
        
    //     if (parts[0] === 'ns') {
    //         parts =parts.slice(1);
    //     }
    //     return parts.co
    // }

    // 객체 이름을 객체로 만드는 함수
    function setNamespace(pStr, pObj) {
        var parts = pStr.split('.');
        var parent = NS;

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

    // for(i = 0 ; this && i < this.data.length; i++) {
    //     obj = {};
    //     obj[this.data[i].attr] = this.data[i].content;
    //     _data = Object.assign(_data, obj);
    // }

    return {
        part: _part,
        helper: _helper,
        decorator: _decorator,
        data: {ns: _data}
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