// 'use strict';

var gulp        = require('gulp'); 
// var search      = require("gulp-search");
var fs          = require("fs");
var contains = require('gulp-contains');

var replace     = require("gulp-replace");
var sourcemaps  = require('gulp-sourcemaps');

/**
 * 스칼라 목록을 가져와서 
 * gulpSetup.json의
 * _replace 에 배열 형태로 추가함 
  */

  var arr = [];
 
  gulp.task('before', function () {
    console.log('arr:' + arr.toString());
    console.log('after');

});

gulp.task('scaler', function (cb) {
    
    var setup = fs.readFileSync("gulp-setup.json");
    var jsonSetup = JSON.parse(setup);

    // gulp.src('src/**/*.sql')
    //     // regex : 스칼라 함수 
    //     .pipe(search(/[\S]+\.[\w]+\(.*\)/g, function(item) {
    //         arr.push(item);
    //         console.log('ii');
    //         return item;
            
    //     }, {
    //         path: 'dist',
    //         filename: 'scaler.json'}
    //     )
    // );

    // gulp.src('src/**/*.sql')
    // .pipe(contains({
    //     search: /[\S]+\.[\w]+\(.*\)/g,
    //     onFound: function (string, file, cb) {
    //         // string is the string that was found 
    //         // file is the vinyl file object 
    //         // cb is the through2 callback 
    //         console.log('innerdd');
    //         // return false to continue the stream 
    //     }
    // }));

    gulp.src('src/**/*.sql')
    // USE [DB명] : GO 제거
    .pipe(replace(/[\S]+\.[\w]+\(.*\)/g, function(match, p1, offset, string) {
        var ed_idx = match.indexOf("]");
        var make = "USE ";
        // global._match = match.substring(make.length + 1, ed_idx);
        bbb = "sstory40";
        global._match = "sstory40";
        // this.file._match = _match;
        console.log('global2:' + bbb);
        console.log('log:' + global._match);

        var f = "gulp-setup.json";
        var setup = fs.readFileSync(f);
        var jsonSetup = JSON.parse(setup);
        jsonSetup._replace.push(match);
        fs.writeFileSync(f, JSON.stringify(jsonSetup));
        var objData = {};
        objData.src = "";
        objData.string = "";
        objData.replacement = "";

        return match;
    }));

    console.log('inner');
        // .pipe(gulp.dest('dist'));
});




// 

// 이전 실행
// gulp.task('before', ['after']);

// gulp.task('default', gulpsync.async(['scaler', 'before']));
gulp.task('default', ['scaler', 'before']);


console.log('-End');