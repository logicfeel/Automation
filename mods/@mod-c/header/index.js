'use strict';

// gulp 4.0
var Auto            = require('../../../');
var util            = require('util');

// var writeJsonFile   = require('write-json-file');


function AutoClass() {
    Auto.AutoModModel.call(this, __dirname);
    
}
util.inherits(AutoClass, Auto.AutoModModel);

// 이 메소드는 모듈의 위치에 지정
AutoClass.prototype.getDirname = function() {
    return __dirname;
};

// // 오버라이딩
// AutoClass.prototype.runTask = function() {

// }


// 오버라이딩
// TODO: template 바로 전으로 호출 위치 변경
AutoClass.prototype.runTask = function() {
    
    var mn_list            = require('@mod-c/mn_list');

    var o = new mn_list.TemplateClass();
    
    // o.getCompilePart('footer.hbs', 'template/@mn_list');

    o.getFooterPart('template/@mn_list');
}


// 사용자 정의 
// AutoClass.prototype.setEntity = function(name) {
    
//     var filename = this.PATH.base + 'template/entityData.json';
//     var e_data = this.load(filename);
    
//     e_data.entity = name;
//     writeJsonFile.sync(filename, e_data);
// };


module.exports = {
    AutoClass: AutoClass
};