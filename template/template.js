'use strict';

var util            = require('util');
// var auto            = require('../autoModule');
var temp            = require('../AutoTemplate');

function TemplateClass(pAutoBase) {
    temp.AutoTempalte.call(this, pAutoBase);
    
}
util.inherits(TemplateClass, temp.AutoTempalte);

// 추상메소드 >> 오버라이딩 
TemplateClass.prototype.init = function() {
    console.log('TemplateClass.prototype.init');
    /**
     * 템플릿 초기화
     */

    this.setPart_su_sub('제목이요' , '작성자요');
    
    // 작동함
    // this.src['testTemplate.sql'].partials('auto_i_module.json');
    // this.src['testTemplate.sql'].partials('auto_module.json');
    // this.src['testTemplate.sql'].decorators('d_t.js');
    // this.src['testTemplate.sql'].helpers('d_t.js');
    // this.src['testTemplate.sql'].data('auto_i_module.json');
    // this.src['testTemplate.sql'].data('auto_module.json');
    // this.src['testTemplate.sql'].compile({ names: [10, 20, 30], namep: "KKK"}); // 컴파일 테스트

    // 복사 진행
    this.src['testTemplate.sql'] = this.template['mainTem.asp'];
    // this.src['testTemplate.sql'] = 'aa';

    console.log(':::::::::::::');
};

/**
 * su/sub 조각 설정
 * @param {*} titile 타이틀
 * @param {*} anthor 작성자
 */
TemplateClass.prototype.setPart_su_sub = function(titile, anthor) {
    console.log('su/sub 조각 설정');
};

module.exports = {
    TemplateClass: TemplateClass

};