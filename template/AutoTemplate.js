'use strict';

var util                = require('util');
var PublicCollection    = require('./PublicCollection');
var LocalCollection     = require('./LocalCollection');
var TemplateSource      = require('./TemplateSource');
var BaseTemplate        = require('./BaseTemplate');


function AutoTemplate(pAutoBase) {
    BaseTemplate.call(this);
    
    var autoBase = pAutoBase;

    this._AB  = autoBase;

    // 기본 속성 오버라이딩
    this.PATT_GLOB['page']      = 'template/page/**/!(__*)*.hbs';
    this.PATT_GLOB['helper']    = 'template/helper/**/!(__*)*.js';
    this.PATT_GLOB['decorator'] = 'template/decorator/**/!(__*)*.js';
    this.PATT_GLOB['data']      = 'template/data/**/*.{js,json}';
    
    this.PATH['template_page']  = 'page/';
}
util.inherits(AutoTemplate, BaseTemplate);

AutoTemplate.prototype.getDirname = function() {
    return __dirname;
};

AutoTemplate.prototype.init = function() {
    // 상위 메소드 호출 : 데코레이션 패턴
    BaseTemplate.prototype.init.call(this);

    this.page       = new LocalCollection('page', this);
    this.page.pushPattern(autoBase.PATT_GLOB['page']);

    // auto PKG, CFG 데이터 지정
    this._base.data.add(this._AB.PKG);
    this._base.data.add(this._AB.CFG);
};

/**
 * 템플릿 처리전에 실행 
 * i : update >> preinstall >> (실행) >> template-all >> install
 * m : preinstall >> install >> (실행) >> template
 */
AutoTemplate.prototype.before_template = function() {
    // 추상 메소드
};

AutoTemplate.prototype.import = function(pModName, pPublic) {
    
    if (pPublic) this._public = pPublic;
    
    // TODO: 없을시 예외 처리
    return this._AB.MOD[pModName];
};


AutoTemplate.prototype.build_src = function() {
    this.build(this.src);
};

AutoTemplate.prototype.build_page = function() {
    this.build(this.page);
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

module.exports = AutoTemplate;