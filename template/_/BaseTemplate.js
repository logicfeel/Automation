'use strict';

var EventEmitter        = require('events').EventEmitter;
var util                = require('util');
var handlebars          = require('handlebars');
var handlebarsWax       = require('handlebars-wax');
var fs                  = require('fs');
var path                = require('path');

var LArray              = require('larray');

var TemplateSource      = require('./Sources').TemplateSource;
var Scope               = require('./Scope');
var PublicCollection    = require('./PublicCollection');
var LocalCollection     = require('./LocalCollection');
var Namespace           = require('./Namespaces').Namespace;


function BaseTemplate(pBasePath) {
    EventEmitter.call(this);
    
    var _this = this;
    
    // 절대경로
    var absolute = pBasePath ? pBasePath : this.getDirname();
    // 상대경로
    var relative;

    var _PATH = {
        absolute: '',               // REVIEW: __dirname 으로 대체 가능한지 검토?
        base: '',
        src: 'src/',
        part: 'part/',
        data: 'data/',
        helper: 'helper/',
        decorator: 'decorator/'
    };

    var _PATT_GLOB = {
        // ext: '.hbs',                               // 템플릿 파일 확장자
        src: '{{1}}**/!(__*)*.hbs',                 // 일반 배치 소스 (__시작하는 파일은 제외)
        part: '{{1}}**/!(__*)*.{hbs,js}',          // partical명 : 파일명
        data: '{{1}}**/*.{js,json}',               // data명 : 파일명.객체명  TODO: data/ 폴더 명 사용 불필요 할듯 이미 구분됨
        helper: '{{1}}**/!(__*)*.js',            // helper(메소드)명 : export 객체명
        decorator: '{{1}}**/!(__*)*.js'       // decorators(메소드)명 : export 객체명            

    };

    // [0] 정규식, [1] 캡쳐번호 : 속명명 추출
    // REG_EXP => REG_EXP
    var _REG_EXP = {
        src:        ['(?:.*{{1}})([\\w|/|-|.|@]*)(?:.hbs)/\b', 'gi', '$1'], 
        part:       ['(?:.*{{1}})([\\w|/|-|.|@]*)(?:.hbs|.js)\\b', 'gi', '$1'], 
        data:       ['(?:.*{{1}})([\\w|/|-|.]*)(?:.js|.json)\\b', 'gi', '$1'], 
        helper:     ['(?:.*{{1}})([\\w|/|-|.]*)(?:.js)\\b', 'gi', '$1'], 
        decorator:  ['(?:.*{{1}})([\\w|/|-|.]*)(?:.js)\\b', 'gi', '$1']
    };
    
    // 폴더명
    // REVIEW: 뒤에 '/' 빠져야 맞을듯  @compile
    this.DIR = {
        compile: '@compile/'
    };

    this.FILE_EXT = {
        templete: '.hbs'
    };

    absolute = absolute ? absolute.replace(/\\/g,'/') + '/' : '';    // 접근 '/' 경로 변경
    relative = path.relative(process.cwd(), absolute);
    relative = relative ? relative.replace(/\\/g,'/') + '/' : '';    // 접근 '/' 경로 변경
    
    // _PATH 기본값 설정 
    _PATH['absolute'] = absolute;
    _PATH['base'] = relative;




    this.PATH = {};
    
    // PATH 프로퍼티 설정 공통 함수
    function __PATH_Properties(pProp) {
        return {
            get: function() { return _PATH['base'] + _PATH[pProp] },
            set: function(newValue) { _PATH[pProp] = newValue },
            enumerable: true,
            configurable: true
        };
    }

    Object.defineProperties(this.PATH, {
        absolute: {
            get: function() { return _PATH.absolute },
            set: function(newValue) { _PATH.absolute = newValue },
            enumerable: true,
            configurable: true
        },        
        base: {
            get: function() { return _PATH.base },
            set: function(newValue) { _PATH.base = newValue },
            enumerable: true,
            configurable: true
        },
        src:        __PATH_Properties('src'),
        part:       __PATH_Properties('part'),
        data:       __PATH_Properties('data'),
        helper:     __PATH_Properties('helper'),
        decorator:  __PATH_Properties('decorator')
    });


    // GLOB 검색 패턴
    // TODO: PATT_GLOB => GLOB 로 변경하던지 다른이름 이로 변경 검토?
    // this.PATT_GLOB = {
    //     ext: '.hbs',                               // 템플릿 파일 확장자
    //     src: 'src/**/!(__*)*.hbs',                 // 일반 배치 소스 (__시작하는 파일은 제외)
    //     part: 'part/**/!(__*)*.{hbs,js}',          // partical명 : 파일명
    //     data: 'data/**/*.{js,json}',               // data명 : 파일명.객체명  TODO: data/ 폴더 명 사용 불필요 할듯 이미 구분됨
    //     helper: 'helper/**/!(__*)*.js',            // helper(메소드)명 : export 객체명
    //     decorator: 'decorator/**/!(__*)*.js'       // decorators(메소드)명 : export 객체명            

    // };
    
    this.PATT_GLOB = {};

    // PATT_GLOB 프로퍼티 설정 공통 함수
    function __PATH_GLOB_Properties(pProp) {
        return  {
            get: function() { return _PATT_GLOB[pProp].replace('{{1}}', _this.PATH[pProp]) },
            set: function(newValue) { throw new Error('에러 : PATH.* 를 통해서 수정'); },
            enumerable: true,
            configurable: true
        };
    }
    
    Object.defineProperties(this.PATT_GLOB, {
        src:        __PATH_GLOB_Properties('src'),
        part:       __PATH_GLOB_Properties('part'),
        data:       __PATH_GLOB_Properties('data'),
        helper:     __PATH_GLOB_Properties('helper'),
        decorator:  __PATH_GLOB_Properties('decorator')
    });

    // Object.defineProperty(this.PATT_GLOB, 'src', {
    //     // get: function() { return _this._PATH['src'] + '**/!(__*)*.hbs'; },
    //     get: function() { return 'template/page/**/!(__*)*.hbs'; },
    //     enumerable: true,
    //     configurable: true
    // });

    // var _REG_EXP = {
    //     src:        [/(?:.*{{1}})([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'], 
    //     // page:       [/(?:.*template\/page\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'], 
    //     part:       [/(?:.*{{1}})([\w\/\-.@]*)(?:\.hbs|\.js)\b/gi, '$1'], 
    //     data:       [/(?:.*{{1}})([\w\/\-.]*)(?:\.js|\.json)\b/gi, '$1'], 
    //     helper:     [/(?:.*{{1}})([\w\/\-.]*)(?:\.js)\b/gi, '$1'], 
    //     decorator:  [/(?:.*{{1}})([\w\/\-.]*)(?:\.js)\b/gi, '$1']
    // };


    
    this.REG_EXP = {};

    // REG_EXP 프로퍼티 설정 공통 함수
    function __REG_EXP_Properties(pProp) {
        return   {
            get: function() { 
                var str = _REG_EXP[pProp][0].replace('{{1}}', _this.PATH[pProp]);
                var reg = new RegExp(str, _REG_EXP[pProp][1]);
                return [reg, _REG_EXP.src[1], _REG_EXP[pProp][2]];
             },
            set: function(newValue) { throw new Error('에러 : PATH.* 를 통해서 수정'); },
            enumerable: true,
            configurable: true
        };
    }

    Object.defineProperties(this.REG_EXP, {
        src:        __REG_EXP_Properties('src'),
        part:       __REG_EXP_Properties('part'),
        data:       __REG_EXP_Properties('data'),
        helper:     __REG_EXP_Properties('helper'),
        decorator:  __REG_EXP_Properties('decorator')  
    });

    // 구획(구분) 문자
    // TODO : DELIMITER  => SECTION (section) 을 맞을지 검토
    this.DELIMITER = {
        part:        '/',
        data:        '.',
        helper:      '-',
        decorator:   '-'
    };

    
    this._public    = null;
    this._base      = null;
    this._import    = [];

    this.src        = null;
    this.data       = null;
    this.decorator  = null;
    this.helper     = null;
    this.part       = null;
    this.ns         = new Namespace(this);
    this.namespace  = this.ns;
    
}
util.inherits(BaseTemplate, EventEmitter);

BaseTemplate.prototype.init = function() {

    // 템플릿의 기본 public 템플릿 (고정)
    this._base      = new Scope(this);
    
    // 템플릿 build, compile 시 사용되는 public 템플릿 (동적)
    this._public    = this._base;
// console.log('##########################');
    this.src        = new LocalCollection('src', this);
    this.src.pushPattern(this.PATT_GLOB['src']);
// console.log('src::'+ this.src.length);
// console.log('##########################');
    // 참조 연결
    // this.data       = this._base.data;
    
    Object.defineProperty(this, 'data', {
        get: function() { return this._base.data; },
        set: function(newValue) { this._base.data = newValue; },
        enumerable: true,
        configurable: true
    });

    this.decorator  = this._base.decorator;
    this.helper     = this._base.helper;
    
    // this.part       = this._base.part;
    Object.defineProperty(this, 'part', {
        get: function() { return this._base.part; },
        set: function(newValue) { this._base.part = newValue; },
        enumerable: true,
        configurable: true
    });

};

// TODO: pPublic 명칭 적정한 걸로 교체
BaseTemplate.prototype.import = function(pBaseTemplate, pPublic) {
    
    // TODO: 타입검사 BaseTemplate, Scope

    if (pPublic) pBaseTemplate._public = pPublic._base;
    
    return pBaseTemplate;
};

BaseTemplate.prototype.build = function(pLocalCollection) {

    // this.init();

    var hbObj = this._public.getTemplateInfo();

    // TODO: 타입 검사
    var local = pLocalCollection ? pLocalCollection : this.src;

    for(var i = 0; i < local.length; i++) {

        var hb = handlebars.create();
        var wax = handlebarsWax(hb);

        // 전역
        wax.partials(hbObj.part);
        wax.helpers(hbObj.helpers);
        wax.decorators(hbObj.decorator);
        wax.data(hbObj.data);
   
        // 지역
        wax.partials(local[i]._part);
        wax.helpers(local[i]._helper);
        wax.decorators(local[i]._decorator);
        wax.data(local[i]._data);

        var template = wax.compile(local[i].content);
        
        console.log(template());
    }
    // console.log('build():'+ local.length);
    // console.log('src:'+ this.src.length);
};


/**
 * gulp 오류 출력
 * TODO: 위치 조정
 * @param {*} errName 오류 구분 명칭
 * @param {*} message 오류 메세지
 */
function gulpError(message, errName) {
    // 제사한 오류 출력
    // if (this.ERR_LEVEL === 1) {
    //     throw new gutil.PluginError({
    //         plugin: errName,
    //         message: message
    //     });                
    // } else {
        throw new Error(message);
    // }
}



module.exports = BaseTemplate;