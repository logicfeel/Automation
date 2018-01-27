'use strict';

var gulp        = require('gulp'); 
var concat      = require('gulp-concat');


// file can be a vinyl file object or a string
// when a string it will construct a new one

gulp.task('default', function () {
    console.log('module/M1/gulpfile.js  default ');

    // return gulp.src('src/*.js', { base: 'src/' })
    // return gulp.src('src/*.js', { base: 'modules/M1/src' })
    return gulp.src('modules/M1/src/*.js')
        // .pipe(concat())
        .pipe(gulp.dest('dest/'));
});


module.exports = function(file, opt) {
    console.log('module/M1/gulpfile.js  loading');
};