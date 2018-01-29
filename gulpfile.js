'use strict';
// gulp 3.9 기준

var gulp        = require('gulp'); 
var fs          = require('fs');
var sortJSON    = require('gulp-json-sort').default;
var lazypipe    = require('lazypipe');
var replace     = require("gulp-replace");
var gulpsync    = require('gulp-sync')(gulp);
var concat      = require('gulp-concat'); 
var through     = require('through2');
var groupConcat = require('gulp-group-concat');
var clean       = require('gulp-clean');

var hb          = require('gulp-hb');

// 사용전 플러그인
var gulpif      = require('gulp-if');
var sourcemaps  = require('gulp-sourcemaps');
var rename      = require('gulp-rename');


// #########################################################
// 전역 변수

// ##################################################
// Task Excute

gulp.task('default', ['handlebar']);           // 핸들바

/** 
 * --------------------------------------------------
 * 핸들바 테스트 
 * https://cloudfour.com/thinks/the-hidden-power-of-handlebars-partials/
 */
gulp.task('handlebar', function () {
    return gulp.src('./src/pages/*.hbs')
        .pipe(hb({debug: true})
            .partials('./src/partials/**/*.hbs')
            .partials({
                far: '정의에서 부분 삽입'
            })            
            .helpers({
                bold: function(person) {
                    return person.id + " " + person.name;
                }
            })
            .data(
                {
                    title: "My First Blog Post!",
                    author: {
                        id: 47,
                        name: "Yehuda Katz"
                    },
                    body: "My first post. Wheeeee!"
              })
            .data('package.json')
        )
        .pipe(rename({
            extname: ".html"
          }))
        .pipe(gulp.dest('./dist'));
});