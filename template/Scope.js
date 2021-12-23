
'use strict';

var path                = require('path');
var deepmerge           = require('deepmerge');

var PublicCollection    = require('./PublicCollection');
var LocalCollection     = require('./LocalCollection');
var BaseCollection      = require('./BaseCollection');
var TemplateSource      = require('./Sources').TemplateSource;

function Scope(pBaseTemplate) {
   
    var baseTemplate    = pBaseTemplate;
    
    this._BT  = baseTemplate;
    // this._namespace = {
    //     part: [],
    //     data: [],
    //     helper: [],
    //     decorator: []
    // };

    // this.ns = new Namespace(this);
    var _this = this;

    // this.data           = new PublicCollection('data', baseTemplate);
    // this.data.set       = function(value) {
    //     console.log('GOGO');
    // };

    // this.part           = new LocalCollection('part', baseTemplate);
    var _part           = new LocalCollection('part', baseTemplate);
    Object.defineProperty(this, 'part', {
        get: function() { 
            // console.log('GET >>>');
            return _part; 
        },
        set: function(newValue) { 
            if (this._this != newValue) {
                if (newValue instanceof BaseCollection) {
                    // 생성후 복사 진행함 : 여러개
                } else if (newValue instanceof TemplateSource) {
                    // 생성후 복사 진행함 : 한개    
                } else {
                    // 예외 발생 : 정해지지 않음 값
                }
    
            }
            // console.log('SET >>>');
            _part = newValue;
        },
        enumerable: true,
        configurable: true
    });

    
    // 상위 컬렉션 정의 getter/setter  
    var _data = new PublicCollection('data', baseTemplate);
    Object.defineProperty(this, 'data', {
        get: function() { 
            // console.log('GET >>>');
            return _data; 
        },
        set: function(newValue) { 
            if (this._this != newValue) {
                if (newValue instanceof BaseCollection) {
                    // 생성후 복사 진행함 : 여러개
                } else if (newValue instanceof TemplateSource) {
                    // 생성후 복사 진행함 : 한개    
                } else {
                    // 예외 발생 : 정해지지 않음 값
                }
    
            }
            // console.log('SET >>>');
            _data = newValue;
        },
        enumerable: true,
        configurable: true
    });

    this.helper         = new PublicCollection('helper', baseTemplate);
    this.decorator      = new PublicCollection('decorator', baseTemplate);
    


    // 폴더기준 기본 정보 등록
    this.part.pushPattern(baseTemplate.PATT_GLOB['part']);
    this.data.pushPattern(baseTemplate.PATT_GLOB['data']);
    this.decorator.pushPattern(baseTemplate.PATT_GLOB['decorator']);
    this.helper.pushPattern(baseTemplate.PATT_GLOB['helper']);
}

Scope.prototype.getTemplateInfo = function() {
    
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

    function recursiveAttr(attr, content) {
        
        var buff = {};
        
        if (typeof content === 'function' || typeof content === 'string') {
            buff[attr] = content;
        } else if (typeof content === 'object') {
            for(var prop in content) {
                if (content.hasOwnProperty(prop)) {
                    
                    if (typeof content[prop] === 'object') {
                        buff = recursiveAttr(prop, content[prop]);
                    } else {
                        buff[prop] = content[prop];
                    }
                }
            }
        }
        
        return buff;
    }

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
        obj = {};
        // REVIEW 확인 필요
        obj[this.helper[i].attr] = this.helper[i].content;
        _helper = Object.assign(_helper, obj);
    }

    for(i = 0 ; this && i < this.decorator.length; i++) {
        obj = {};
        obj[this.decorator[i].attr] = this.decorator[i].content;
        _decorator = Object.assign(_decorator, obj);
    }

    for(i = 0 ; this && i < this.data.length; i++) {
        obj = {};
        var __attr = this.data[i].attr.toString();

        // 폴더속성의 경우 병합 (네임스페이스 포함)
        if ( __attr.indexOf('.') > 0 ) {
            setNamespaceOut(obj, __attr, this.data[i].content);
        } else {
            obj[this.data[i].attr] = this.data[i].content;
        }
        
        _data = deepmerge(_data, obj, { arrayMerge: overwriteMerge });
        // _data = Object.assign(_data, obj);
    }

    // 객체 이름을 객체로 만드는 함수 (네임스페이스)
    function setNamespaceOut(pNS, pStr, pObj) {
        var parts = pStr.split('.');
        var parent = pNS;

        // if (parts[0] === 'ns') {
        //     parts =parts.slice(1);
        // }

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
    
    // 콜백 함수
    function overwriteMerge(destinationArray, sourceArray, options) {
        return sourceArray
    }

    return {
        part: _part,
        helper: _helper,
        decorator: _decorator,
        data: _data
    }
};


module.exports = Scope;