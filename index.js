

var util            = require('util');
var AutoModModel    = require('r.0.1-auto-mod-model').AutoModModel;
var TemplateClass   = require('./template/template');

function AutoClass() {
    AutoModModel.call(this, __dirname, TemplateClass);
    
    // 테스트
    // this.PATT_TEMP.partials = 'template/parts/**/*.hbs'
}
util.inherits(AutoClass, AutoModModel);

// 이 메소드는 모듈의 위치에 지정
AutoClass.prototype.getDirname = function() {
    return __dirname;
}


module.exports = {
    AutoClass: AutoClass,
    TemplateClass: TemplateClass,
    // auto: new AutoClass()       // 인스턴스
};
