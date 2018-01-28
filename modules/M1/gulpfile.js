'use strict';

var gulp        = require('gulp'); 
var Gulp        = require('gulp').Gulp; 
var g = new Gulp();
gulp = g;

var concat      = require('gulp-concat');

var SETUP = "*D*";

// file can be a vinyl file object or a string
// when a string it will construct a new one

gulp.task('defaultss', function () {
    console.log('module/M1/gulpfile.js  task.default ' + SETUP);

    // return gulp.src('src/*.js', { base: 'src/' })
    // return gulp.src('src/*.js', { base: 'modules/M1/src' })
    return gulp.src('modules/M1/src/*.js')
        // .pipe(concat())
        .pipe(gulp.dest('dest/'));
});

gulp.task('default', function () {
    console.log('..... task.default ' + SETUP);
});

// module.exports = function(file, opt) {
//     console.log('module/M1/gulpfile.js  loading');
//     gulp.run('defaultss');
// };

module.exports = function(setup) {
    console.log('module/M1/gulpfile.js  loading');
    SETUP = setup;
    gulp.run('defaultss');
};

// module.exports = gulp;