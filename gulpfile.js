'use strict';

var gulp        = require('gulp'); 


gulp.task('default', function() {
    console.log('-default-');
    
    var sub =  require('sub-gulp/gulpfile.js'); 
    sub();

    var sub2 =  require('sub-gulp'); 
    sub2();
    
} );