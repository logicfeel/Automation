'use strict';

// gulp 4.0
var Auto            = require('../../../');
var util            = require('util');


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
AutoClass.prototype.getEntity = function() {
    // console.log('__filename', __filename);
    return 'MENU';
    
};


module.exports = {
    AutoClass: AutoClass
};