
'use strict';

var path            = require('path');

var PublicCollection    = require('./PublicCollection');
var LocalCollection     = require('./LocalCollection');

function BaseTempalte(pAutoTemplate) {
   
    var autoTemplate = pAutoTemplate;
    var autoBase = autoTemplate._AutoBase;
    
    this._AutoBase  = autoBase;

    this.data       = new PublicCollection('data', autoTemplate);
    this.decorator  = new PublicCollection('decorator', autoTemplate);
    this.helper     = new PublicCollection('helper', autoTemplate);
    
    this.part       = new LocalCollection('part', autoTemplate);

    this.data.pushPattern(autoBase.PATT_GLOB['data']);
    this.decorator.pushPattern(autoBase.PATT_GLOB['decorator']);
    this.helper.pushPattern(autoBase.PATT_GLOB['helper']);

    this.part.pushPattern(autoBase.PATT_GLOB['part']);
}

BaseTempalte.prototype.getTemplateInfo = function() {
    
    var i = 0;
    var _part = {};
    var _helper = {};
    var _decorator = {};
    var _data = {};
    var _propName = '';
    var _dirname = '';
    var _basename = '';
    var autoBase = this._AutoBase;

    // gulp-hp 전달 객체 조립 
    for(i = 0 ; this && i < this.part.length; i++) {
        _dirname = path.dirname(path.relative(autoBase.PATH['template_part'], this.part[i].path));
        _dirname  = _dirname === '.' ? '' : _dirname;   // 현재 디렉토리 일 경우 
        _dirname  = _dirname != '' ? _dirname + '/' : _dirname;
        _basename =  path.basename(this.part[i].path, autoBase.PATT_GLOB['ext']);  // 확장자 제거(.hbs)
        
        _part[_dirname + _basename] = this.part[i].content.toString();
    }

    // REVEIW: 아래 문법이 무난? 검토 _helper = this ? Object.assign({}, this.helper.slice(0, this.helper.length - 1)) : {};
    for(i = 0 ; this && i < this.helper.length; i++) {
        _helper = Object.assign(_helper, this.helper[i]);
    }

    for(i = 0 ; this && i < this.decorator.length; i++) {
        _decorator = Object.assign(_decorator, this.decorator[i]);
    }

    for(i = 0 ; this && i < this.data.length; i++) {
        _data = Object.assign(_data, this.data[i]);
    }
    return {
        part: _part,
        helper: _helper,
        decorator: _decorator,
        data: _data
    }
};

module.exports = BaseTempalte;