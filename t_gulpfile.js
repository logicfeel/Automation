'use strict';

// gulp 4.0
var gulp        = require('gulp');
var Auto        = require('./t_index.js');


var i = new Auto.AutoClass();
i.FILE.CFG = 'auto_i_module.json';
i.set_cfg('auto_i_module.json');

gulp.registry(i);
