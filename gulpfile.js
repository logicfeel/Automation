'use strict';

var gulp        = require('gulp'); 
// var Gulp        = require('gulp').Gulp; 
// var g = new Gulp();
// gulp = g;
// var gulp        = require('gulp'); 

require('gulp-submodule')(gulp);
var mod = gulp.submodule('modules/M1/');
console.log('Mod returns ' + mod);

// var gulpModule = require('gulp-module');

var path   = require('path'); 

// var nodemodulespath   = require('node-modules-path'); 
// var requiredPath = require('required-path');


// var fs          = require('fs');
// var sortJSON    = require('gulp-json-sort').default;
// var lazypipe    = require('lazypipe');
// var replace     = require("gulp-replace");
// var gulpsync    = require('gulp-sync')(gulp);
// var concat      = require('gulp-concat'); 
// var through     = require('through2');
// var groupConcat = require('gulp-group-concat');
// var clean       = require('gulp-clean');

// // var hb          = require('gulp-hb');

// // 사용전 플러그인
// var gulpif      = require('gulp-if');
// var sourcemaps  = require('gulp-sourcemaps');
// var rename      = require('gulp-rename');


var aaa = {abc: "aaa"};

function objSearch(obj, name, value){
    var prop;

    for (prop in obj){
        if (typeof obj[prop] === 'object'){
            objSearch(obj[prop], name, value);
        } else {
            if (prop.indexOf(name) > -1 && name.length > 0 ) {
                console.log('name:' + prop);
                console.log('value:' + obj[prop]);
            }
            if (String(obj[prop]).indexOf(value) > -1 && value.length > 0 ) {
                console.log('name:' + prop);
                console.log('value:' + obj[prop]);
            }
        }
    }
}
function getModuleDirName(){
}


// objSearch(process, "M1", "M1");
// objSearch(process, "M1", "");
// objSearch(process, "", "M1");
// objSearch(aaa, "M1", "aa");
// objSearch(require, "M1", "M1");
gulp.task('default2', function() {
    console.log('-default-');
});
gulp.task('default3', function() {
    console.log('-default-');
});

gulp.task('default', ['modules/M1/:default'], function() {
    console.log('-default-');
    
    // var sub =  require('sub-gulp/gulpfile.js'); 
    // sub();

    // var sub2 =  require('sub-gulp'); 
    // sub2();

    // var sub2 =  require('./modules/M1/gulpfile.js'); 
    // sub2();
    var modPath = 'modules/M1/';
    var modPathfile = './modules/M1/gulpfile.js';
    var mod;
    
    // modPath = './modules/M1/';
    // mod = require(modPathfile); 
    // mod(modPath, "install/", "default");


    // modPath = './modules/M2/';
    // mod = require(modPath); 
    // mod(modPath, "install/sub/", "default");
    // var namespace = require(modPathfile)(gulp);
    // var namespace = require(modPathfile);

    // gulpModule.load(modPath + 'gulpfile.js', gulp);


    // mod(modPath, "install");
    // mod(modPath);

    // var aa = requiredPath(a);
    
    // eval('var sub2 = require(\''+ a + '\');sub2(11);');
    eval('console.log(\'-eval-\');');
    
});

// gulp.run();
console.log('-default-');