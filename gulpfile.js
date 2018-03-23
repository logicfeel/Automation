'use strict';

// gulp 4.0
var gulp            = require('gulp');
var auto            = require('./');


var i = new auto.AutoClass();
// i.FILE.CFG = 'auto_i_module.json';
// i.set_cfg('auto_i_module.json');

// Auto.auto = i;

gulp.registry(i);
