'use strict';

var util                = require('util');
var BaseTemplate     = require('./BaseTemplate');

function TemplateClass2() {
    
    this.layout_base = null;

}
util.inherits(TemplateClass2, BaseTemplate);

TemplateClass2.prototype.init = function() {
};

module.exports = TemplateClass2;