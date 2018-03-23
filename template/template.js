'use strict';

var util            = require('util');
var AutoTempalte    = require('r.0.1-auto-mod-model').AutoTempalte;

function TemplateClass(pAutoBase) {
    AutoTempalte.call(this, pAutoBase);
    
}
util.inherits(TemplateClass, AutoTempalte);

// 추상메소드 >> 오버라이딩 
TemplateClass.prototype.init = function() {
    console.log('TemplateClass.prototype.init');
    /**
     * 템플릿 초기화
     */

    // this.setPart_su_sub('제목이요' , '작성자요');
    
    this.src['pages/page-one.html'].compile({private:"PRI.."});
    this.src['testTemplate.sql'].compile({private:"PRI.."});

    // 작동함
    // this.src['testTemplate.sql'].partials('auto_i_module.json');
    // this.src['testTemplate.sql'].partials('auto_module.json');
    // this.src['testTemplate.sql'].decorators('d_t.js');
    // this.src['testTemplate.sql'].helpers('d_t.js');
    // this.src['testTemplate.sql'].data('auto_i_module.json');
    // this.src['testTemplate.sql'].data('auto_module.json');
    // this.src['testTemplate.sql'].compile({ names: [10, 20, 30], namep: "KKK"}); // 컴파일 테스트

    // 복사 진행
    // this.src['testTemplate.sql'] = this.template['mainTem.asp'];

    // 이후 테스트 
    // this.src.push('inner.asp.hbs');
    // this.src['inner.asp.hbs'] = this.template['publish_test.asp.hbs'];

    console.log(':::::::::::::');
};

// 추상메소드 >> 오버라이딩 
TemplateClass.prototype.before_template = function() {
    // console.log('TemplateClass.prototype.before_template');
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
};


/**
 * su/sub 조각 설정
 * @param {*} titile 타이틀
 * @param {*} anthor 작성자
 */
TemplateClass.prototype.setPart_su_sub = function(titile, anthor) {
    // console.log('su/sub 조각 설정');
};

module.exports = TemplateClass;