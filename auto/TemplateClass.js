'use strict';

var util                = require('util');
var BaseTemplate     = require('./BaseTemplate');

function TemplateClass() {
    
    this.layout_base = null;

}
util.inherits(TemplateClass, BaseTemplate);

TemplateClass.prototype.init = function() {
};

var i = new BaseTemplate();

// 뭐가 있어요?
i.init();


module.exports = TemplateClass;