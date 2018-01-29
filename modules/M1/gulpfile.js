'use strict';

var gulp        = require('gulp'); 
var Gulp        = require('gulp').Gulp; 
// var g = new Gulp();
// gulp = g;

var concat      = require('gulp-concat');

var SETUP = "*D*";

// 기본 경로 (필수)
var PATH = {
    base: "",
    src: "src/**/*.js",
    dist: "dist/"
};


// file can be a vinyl file object or a string
// when a string it will construct a new one

gulp.task('default', function () {
    console.log('module/M1/gulpfile.js  task.default ' + SETUP);
    
    // var _src = PATH.base + PATH.src;
    // var _src =  'modules/M1/src/**/*.js';
    var _src =  'modules/M1/' + PATH.src;


    // return gulp.src('src/*.js', { base: 'src/' })
    // return gulp.src('src/*.js', { base: 'modules/M1/src' })
    // var path = PATH.base + PATH.src;
    
    return gulp.src(_src)
        .pipe(gulp.dest(PATH.dist));
});

// gulp.task('default', function () {
//     console.log('..... task.default ' + SETUP);
// });

// module.exports = function(file, opt) {
//     console.log('module/M1/gulpfile.js  loading');
//     gulp.run('defaultss');
// };

// module.exports = function(prefixPath, distPath, task) {
//     console.log('module/M1/gulpfile.js  run');
    
//     PATH.base   = prefixPath ? prefixPath: PATH.base;
//     PATH.dist   = distPath ? distPath: PATH.dist;
//     var _task = task ? task : 'default';

//     gulp.run(_task);
// };

// module.exports = require('gulp-module').define('moduleName', function (gulp, runSequence) {
//     // Regular gulpfile here. 
//     // Do not re-import gulp or runSequence, use the arguments instead. 
//     // Use regular task names, e.g. default, build, coffee. 
//     gulp.task('default', function () {
//         console.log('module/M1/gulpfile.js  task.default ' + SETUP);
        
//         var _src = PATH.base + PATH.src;
//         // var _src =  'modules/M1/src/**/*.js';
    
    
//         // return gulp.src('src/*.js', { base: 'src/' })
//         // return gulp.src('src/*.js', { base: 'modules/M1/src' })
//         // var path = PATH.base + PATH.src;
        
//         return gulp.src(_src)
//             .pipe(gulp.dest(PATH.dist));
//     });    
// };

// module.exports = require('gulp-module').define('module', function (gulp, runSequence) {

//     gulp.task('coffee', function () {
//         // Becomes 'module:coffee'

//     });

//     gulp.task('compass', function () {
//         // Becomes 'module:compass'
//     });

//     gulp.task('test', function () {
//         // Becomes 'module:test'
//     });

//     gulp.task('build', function (cb) {
//         // Becomes 'module:build'
//         // runSequence can still use non-namespaced tasks within module definition
//         // and will namespace them automatically at runtime.
//         runSequence('clean', ['coffee', 'compass'], 'test', cb);
//     });

//     gulp.task('default', ['build']);  // Becomes 'module:default'.
//     // In direct execution additional task 'default' is defined that runs a
//     // 'module:default' task as a dependency.
//     // return gulp;

// });

// module.exports = gulp;

module.exports = "for giggles!";