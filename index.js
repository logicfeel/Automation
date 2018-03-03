'use strict';

var util            = require('util');
var EventEmitter    = require('events');


function AutoBase() {
    EventEmitter.call(this);

    this.CONFIG = null;
    this.PKG = null;
    this.LOG = null;

}
util.inherits(AutoBase, EventEmitter);


AutoBase.prototype.src = "전역속성";

AutoBase.prototype.init = function() {
};

AutoBase.prototype.default = function() {
};

AutoBase.prototype.update = function() {
};

AutoBase.prototype.preinstall = function() {
};

AutoBase.prototype.install = function() {
};


//#####################################
// AutoModule
function AutoModule() {

}
util.inherits(AutoModule, AutoBase);


//#####################################
// AutoModuleModel
function AutoModuleModel() {
    
}
util.inherits(AutoModuleModel, AutoModule);


//#####################################
// 테스트
var a = new AutoBase();


console.log('End');