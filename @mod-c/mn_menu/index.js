'use strict';

// gulp 4.0
var Auto        = require('../../../');
var util            = require('util');



function AutoClass(basePath) {
    Auto.AutoModModel.call(this, basePath);
    
}
util.inherits(AutoClass, Auto.AutoModModel);

module.exports = {
    AutoClass: AutoClass
};