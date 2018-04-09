
'use strict';

var path            = require('path');

var PublicCollection    = require('./PublicCollection');
var LocalCollection     = require('./LocalCollection');

function PublicTemplate(pBaseTemplate) {
   
    var baseTemplate    = pBaseTemplate;
    
    this._BaseTemplate  = baseTemplate;

    this.data           = new PublicCollection('data', baseTemplate);
    this.decorator      = new PublicCollection('decorator', baseTemplate);
    this.helper         = new PublicCollection('helper', baseTemplate);
    
    this.part           = new LocalCollection('part', baseTemplate);

    this.data.pushPattern(baseTemplate.PATT_GLOB['data']);
    this.decorator.pushPattern(baseTemplate.PATT_GLOB['decorator']);
    this.helper.pushPattern(baseTemplate.PATT_GLOB['helper']);

    this.part.pushPattern(baseTemplate.PATT_GLOB['part']);
}

PublicTemplate.prototype.getTemplateInfo = function() {
    
    var i = 0;
    
    var _part = {};
    var _helper = {};
    var _decorator = {};
    var _data = {};
    var _propName = '';
    var _dirname = '';
    var _basename = '';
    var baseTemplate = this._BaseTemplate;

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

module.exports = PublicTemplate;