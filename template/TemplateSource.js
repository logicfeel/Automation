'use strict';

var util                = require('util');
var path                = require('path');
var LArray              = require('larray');

var AutoTemplate        = require('./BaseTemplate');


function TemplateSource(pBaseTemplate, pAttr, pPath, pContent) {

    this.base = pBaseTemplate;
    this.public = this.base._public;

    this._part = null;
    this._data = null;
    this._helper = null;
    this._decorator = null;
    
    this.attr = pAttr;
    this.path = pPath;
    // this.content = pContent.toString();
    if (pContent instanceof Buffer || typeof pContent === 'string') {
        this.content = pContent.toString();
    } else {
        this.content = pContent;
    }
}

TemplateSource.prototype.clone = function(pPath) {
    var newTS = new TemplateSource(this.base, this.attr, pPath, this.content);
    return newTS;
};


TemplateSource.prototype.partials = function(pPattern) {
    this._part = this._part ? this._part : [];
    this._part.push(pPattern);
};


TemplateSource.prototype.data = function(pPattern) {
    this._data = this._data ? this._data : [];
    this._data.push(pPattern);
};


TemplateSource.prototype.helpers = function(pPattern) {
    this._helper = this._helper ? this._helper : [];
    this._helper.push(pPattern);
};


TemplateSource.prototype.decorators = function(pPattern) {
    this._decorator = this._decorator ? this._decorator : [];
    this._decorator.push(pPattern);
};

TemplateSource.prototype.compile = function(pData) {

    // var args = Array.prototype.slice.call(arguments);
    // var compilePath = '@compile';
    var AutoBase = this.base._AutoBase;
    var pathBase = AutoBase.PATH.base;
    var _saveDir = '';
    var _this = this;
    var _dirname;

    // TODO: pCode 추소 검토 그리고 코드 값 this.AutoBase 참조 방식으로 변경
    if (this.code == 'src') {
        // _saveDir = 'src/';
        _saveDir = AutoBase.PATH['src'];
    } else if  (this.code == 'part') {
        // _saveDir = 'template/parts/';
        _saveDir = AutoBase.PATH['template_part'];
    } else if  (this.code == 'page') {
        // _saveDir = 'template/';
        _saveDir = AutoBase.PATH['template_page'];
    }
    
    // REVIEW: path 도 상대주소로 가져와야 할지?
    _dirname = path.relative(_saveDir, path.dirname(this.path));
    _dirname = _dirname ? _dirname + '/' : '';
    _saveDir = _saveDir + AutoBase.PATH['compile'] + _dirname;

    // REVIEW: 파라메터 값을로 읽어와야 함 
    return gulp.src(this.path)
        .pipe(hb({ debug: AutoBase.LOG['debug'] })
            // 아규먼트
            .data(pData)
            // 패키지 정보
            .data(pathBase + AutoBase.FILE['PKG'])
            // 기본 정보 로딩 (glob경로)
            .partials(pathBase  + AutoBase.PATT_GLOB['part'])
            .decorators(pathBase + AutoBase.PATT_GLOB['decorator'])
            .helpers(pathBase + AutoBase.PATT_GLOB['helper'])
            .data(pathBase + AutoBase.PATT_GLOB['data'])
            // 조각 추가 정보 로딩 (배열 glob 경로)
            .partials(_this._part)
            .decorators(_this._decorator)
            .helpers(_this._helper)
            .data(_this._data)
        )
        .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
        .pipe(gulp.dest(pathBase + _saveDir)
    );
};


TemplateSource.prototype.getTemplateInfo = function() {
    
    // var i = 0;
    // var _part = {};
    // var _helper = {};
    // var _decorator = {};
    // var _data = {};
    // var _propName = '';
    // var _dirname = '';
    // var _basename = '';
    // var autoBase = this. _AutoBase;

    // // gulp-hp 전달 객체 조립 
    // for(i = 0 ; this && i < this.part.length; i++) {
    //     _dirname = path.dirname(path.relative(autoBase.PATH['template_part'], this.part[i].path));
    //     _dirname  = _dirname === '.' ? '' : _dirname;   // 현재 디렉토리 일 경우 
    //     _dirname  = _dirname != '' ? _dirname + '/' : _dirname;
    //     _basename =  path.basename(this.part[i].path, autoBase.PATT_GLOB['ext']);  // 확장자 제거(.hbs)
        
    //     _part[_dirname + _basename] = this.part[i].content.toString();
    // }

    // // REVEIW: 아래 문법이 무난? 검토 _helper = this ? Object.assign({}, this.helper.slice(0, this.helper.length - 1)) : {};
    // for(i = 0 ; this && i < this.helper.length; i++) {
    //     _helper = Object.assign(_helper, this.helper[i]);
    // }

    // for(i = 0 ; this && i < this.decorator.length; i++) {
    //     _decorator = Object.assign(_decorator, this.decorator[i]);
    // }

    // for(i = 0 ; this && i < this.data.length; i++) {
    //     _data = Object.assign(_data, this.data[i]);
    // }

    return {
        part: this._part,
        helper: this._helper,
        decorator: this._decorator,
        data: this._data
    }
};


module.exports = TemplateSource;