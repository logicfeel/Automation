

var util            = require('util');
var AutoInstance    = require('r.1.x-auto-instance').AutoInstance;
var TemplateClass   = require('./template/template');

function AutoClass() {
    AutoInstance.call(this, __dirname, TemplateClass);
    
}
util.inherits(AutoClass, AutoInstance);

// 이 메소드는 모듈의 위치에 지정
AutoClass.prototype.getDirname = function() {
    return __dirname;
}


module.exports = {
    AutoClass: AutoClass,
    TemplateClass: TemplateClass,
    // auto: new AutoClass()       // 인스턴스
};
