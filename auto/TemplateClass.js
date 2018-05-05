'use strict';

var util                = require('util');
var BaseTemplate     = require('./BaseTemplate');

function TemplateClass() {
    
    this.layout_base = null;

}
util.inherits(TemplateClass, BaseTemplate);

TemplateClass.prototype.init = function() {
};

module.exports = TemplateClass;