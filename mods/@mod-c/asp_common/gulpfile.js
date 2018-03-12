'use strict';

// gulp 4.0
var gulp        = require('gulp');
var Auto        = require('.');


var a = new Auto.AutoClass();
// a.LOG.debug = false;

gulp.registry(a);