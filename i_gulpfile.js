'use strict';

// gulp 4.0
var gulp        = require('gulp');
var Auto        = require('.');


var i = new Auto.AutoInstance();
i.FILE.CFG = 'auto_i_module.json';

gulp.registry(i);
