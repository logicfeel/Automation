'use strict';

var util            = require('util');
// var Auto            = require('../autoModule');
// var Auto            = require('../../../../autoModule');
var temp            = require('../../../../AutoTemplate');

function TemplateClass() {
    temp.AutoTempalte.call(this);
    
}
util.inherits(TemplateClass, temp.AutoTempalte);

// 추상메소드 >> 오버라이딩 
TemplateClass.prototype.init = function() {
    console.log('TemplateClass.prototype.init');
    /**
     * 템플릿 초기화
     */

};

module.exports = {
    TemplateClass: TemplateClass
};