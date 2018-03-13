
'use strict';

// gulp 4.0
var Auto            = require('.');
var util            = require('util');

var mn_menu         = require('@mod-c/mn_menu');
var asp_common      = require('@mod-c/asp_common');


function AutoClass() {
    Auto.AutoModModel.call(this, __dirname);
    
}
util.inherits(AutoClass, Auto.AutoModModel);

// 이 메소드는 모듈의 위치에 지정
AutoClass.prototype.getDirname = function() {
    return __dirname;
}

// 오버라이딩
AutoClass.prototype.runTask = function() {

}



// 사용자 정의 
// 템플릿 메소드 패턴으로 분리 시킴
// REVIEW: 상속이 꼭 필요 한 이유가 있는가?
AutoClass.prototype.init = function(gulpInst) {
    Auto.AutoModModel.prototype.init.call(this, gulpInst);

    var a = new mn_menu.AutoClass();
    var b = new asp_common.AutoClass();
    // console.log('__filename', __filename);
    var entityName = a.getEntity();
    b.setEntity(entityName);

};

AutoClass.prototype._Entity = function() {
    
};


function TemplateClass() {

}

module.exports = {
    AutoClass: AutoClass,
    Tempate: TemplateClass
};