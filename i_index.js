
'use strict';

// gulp 4.0
var Auto            = require('./autoModule');
var util            = require('util');

var r = require('@mod-c/asp_common');
// var r = require('./node_modules/@mod-c/asp_common');


function AutoClass() {
    Auto.AutoInstance.call(this, __dirname);
    
}
util.inherits(AutoClass, Auto.AutoInstance);

// 이 메소드는 모듈의 위치에 지정
AutoClass.prototype.getDirname = function() {
    return __dirname;
}


function TemplateClass() {

}

module.exports = {
    AutoClass: AutoClass,
    Tempate: TemplateClass
};