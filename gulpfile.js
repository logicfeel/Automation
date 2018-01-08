'use strict';

var gulp        = require('gulp'); 
// var search      = require("gulp-search");
var fs          = require("fs");
var contains    = require('gulp-contains');
// var sortJson    = require('sort-json');
var sortJSON = require('gulp-json-sort').default;

var replace     = require("gulp-replace");
var sourcemaps  = require('gulp-sourcemaps');
var lazypipe    = require('lazypipe');


var SETUP_FILE = "gulp-setup.json";   // 설정 파일명


/**
 * 스칼라 함수 추출 => _replace: [..] 저장
 */
gulp.task('scaler-get', function (cb) {

    var setup = fs.readFileSync(SETUP_FILE);
    var jsonSetup = JSON.parse(setup);

    jsonSetup._replace = [];    // 초기화
    fs.writeFileSync(SETUP_FILE, JSON.stringify(jsonSetup));

    return gulp.src('src/**/*.sql')
        // USE [DB명] : GO 제거
        .pipe(replace(/[\S]+\.[\w]+\(.*\)/g, function(match, p1, offset, string) {
            var setup = fs.readFileSync(SETUP_FILE);
            var jsonSetup = JSON.parse(setup);
            var objData = {};
            objData.src = this.file.relative;
            objData.string = match;
            objData.replacement = "";
            jsonSetup._replace.push(objData);
            fs.writeFileSync(SETUP_FILE, JSON.stringify(jsonSetup));
            return match;
        })
    );
});

/**
 * FN 병합
 */
gulp.task('before-task', ['scaler-get'], function () {
    return gulp.src('gulp-setup.json')
        .pipe(sortJSON({ space: 2 }))
        .pipe(gulp.dest('./'));
});

/**
 * 사전 작업
 * JSON 정렬
 */
gulp.task('before-task', ['scaler-get'], function () {
    return gulp.src('gulp-setup.json')
        .pipe(sortJSON({ space: 2 }))
        .pipe(gulp.dest('./'));
});

/**
 * 주 작업
 */
gulp.task('main-task', ['before-task'], function () {
    console.log('main');
});



var SETUP = {};
SETUP.clear = {};
SETUP.clear.use = true;

var contentSet = lazypipe()
    // USE DB 제거 
    .pipe(replace, /^USE+ [\[\w]+\]*\s+GO/g, function(match, p1, offset, string) {
            if (SETUP.clear.use) return '';
            else return match;
        });


gulp.task('link2-task', ['before-task'], function () {
    return gulp.src('src/FN/*.sql')
        .pipe(contentSet())
        .pipe(gulp.dest('dist/FN'));
});

gulp.task('link-task', ['link2-task'], function () {
    console.log('main');
});



// gulp.task('default', ['main-task']);
gulp.task('default', ['link-task']);


console.log('-default-');
