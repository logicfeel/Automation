'use strict';

var EventEmitter        = require('events').EventEmitter;
var util                = require('util');
var handlebars          = require('handlebars');
var handlebarsWax       = require('handlebars-wax');
var fs                  = require('fs');

var LArray              = require('larray');

var TemplateSource      = require('./Sources').TemplateSource;
var CommonScope         = require('./CommonScope');
var PublicCollection    = require('./PublicCollection');
var LocalCollection     = require('./LocalCollection');
var Namespace           = require('./Namespaces').Namespace;


function BaseTemplate() {
    EventEmitter.call(this);
    
    var _this = this;

    this.PATH = {
        base: '',
        map: 'map/',
        src: 'src/',
        compile: '@compile/',
        template: 'template/',
        template_part: 'part/',
        template_data: 'data/',
        template_help: 'helper/',
        template_deco: 'decorator/'
    };
    
    // 템플릿 패턴
    this.PATT_GLOB = {
        ext: '.hbs',                               // 템플릿 파일 확장자
        dist: 'publish/',                          // 템플릿 배포 폴더 
        src: 'src/**/!(__*)*.hbs',                 // 일반 배치 소스 (__시작하는 파일은 제외)
        part: 'part/**/!(__*)*.{hbs,js}',          // partical명 : 파일명
        helper: 'helper/**/!(__*)*.js',            // helper(메소드)명 : export 객체명
        decorator: 'decorator/**/!(__*)*.js',      // decorators(메소드)명 : export 객체명            
        data: 'data/**/*.{js,json}'                // data명 : 파일명.객체명  TODO: data/ 폴더 명 사용 불필요 할듯 이미 구분됨
    };

    // Object.defineProperty(this.PATT_GLOB, 'src', {
    //     // get: function() { return _this.PATH['src'] + '**/!(__*)*.hbs'; },
    //     get: function() { return 'template/page/**/!(__*)*.hbs'; },
    //     enumerable: true,
    //     configurable: true
    // });

    // [0] 정규식, [1] 캡쳐번호 : 속명명 추출
    this.REG_EXP = {
        src:        [/(?:.*src\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'], 
        // page:       [/(?:.*template\/page\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'], 
        part:       [/(?:.*part\/)([\w\/\-.@]*)(?:\.hbs|\.js)\b/gi, '$1'], 
        data:       [/(?:.*data\/)([\w\/\-.]*)(?:\.js|\.json)\b/gi, '$1'], 
        helper:     [/(?:.*helper\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'], 
        decorator:  [/(?:.*decorator\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1']
    };

    
    this._public    = null;
    this._base      = null;
    this.src        = null;
    this.data       = null;
    this.decorator  = null;
    this.helper     = null;
    this.part       = null;

    this.ns         = new Namespace(this);

    this._import     = [];
}
util.inherits(BaseTemplate, EventEmitter);

BaseTemplate.prototype.init = function() {

    // 템플릿의 기본 public 템플릿 (고정)
    this._base      = new CommonScope(this);
    
    // 템플릿 build, compile 시 사용되는 public 템플릿 (동적)
    this._public    = this._base;

    this.src        = new LocalCollection('src', this);
    this.src.pushPattern(this.PATT_GLOB['src']);

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
    
    // TODO: 타입검사 BaseTemplate, CommonScope

    if (pPublic) pBaseTemplate._public = pPublic._base;
    
    return pBaseTemplate;
};

BaseTemplate.prototype.build = function(pLocalCollection) {

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