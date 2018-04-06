'use strict';

var EventEmitter        = require('events').EventEmitter;
var util                = require('util');
var PublicCollection    = require('./');
var LocalCollection     = require('./LocalCollection');
var TemplateSource      = require('./TemplateSource');
var BaseTemplate        = require('./BaseTemplate');


function AutoTempalte(pAutoBase) {
    EventEmitter.call(this);
    
    var autoBase = pAutoBase;

    this._AutoBase  = autoBase;
    
    this._base      = new BaseTemplate(this);
    this._public    = this._base;
    this.src        = new LocalCollection('src', this);
    this.page       = new LocalCollection('page', this);
    
    this.src.pushPattern(autoBase.PATT_GLOB['src']);
    this.page.pushPattern(autoBase.PATT_GLOB['page']);

    // 참조 연결
    this.data       = this._base.data;
    this.decorator  = this._base.decorator;
    this.helper     = this._base.helper;
    this.part       = this._base.part;
}
util.inherits(AutoTempalte, EventEmitter);


AutoTempalte.prototype.init = function() {
    // 추상 메소드
};

/**
 * 템플릿 처리전에 실행 
 * i : update >> preinstall >> (실행) >> template-all >> install
 * m : preinstall >> install >> (실행) >> template
 */
AutoTempalte.prototype.before_template = function() {
    // 추상 메소드
};

AutoTempalte.prototype.import = function(pModName, pPublic) {
    
    if (pPublic) this._public = pPublic;
    
    // TODO: 없을시 예외 처리
    return this._AutoBase.MOD[pModName];
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

module.exports = AutoTempalte;