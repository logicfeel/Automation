'use strict';

var gulp        = require('gulp'); 
var Gulp        = require('gulp').Gulp; 
var g = new Gulp();
// gulp = g;

gulp.task('default', function() {
    console.log('-default-');
    
    // var sub =  require('sub-gulp/gulpfile.js'); 
    // sub();

    // var sub2 =  require('sub-gulp'); 
    // sub2();

    // var sub2 =  require('./modules/M1/gulpfile.js'); 
    // sub2();
var a= './modules/M1/';

    var sub2 =  require(a); 
    // var sub2 =  require('./modules/M1/'); 

    
    sub2(11);


    eval('console.log(\'-eval-\');');
    
});

gulp.run();