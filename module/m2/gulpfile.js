'use strict';


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
var callback = require('gulp-fncallback');

var PKG = require('./package');

// #########################################################
// 전역 변수

var base = '';
var mod = PKG.name + ':';
/** 
 * --------------------------------------------------
 * 핸들바 테스트 
 * https://cloudfour.com/thinks/the-hidden-power-of-handlebars-partials/
 */
gulp.task(mod + 'update', gulp.series(function () {
    
    // var base = 'module/m1/';
    // var base = '';

    // console.log('이벤트 발생:m1:update');
    // gulp.emit('m1_update',  function(e){
        
    // });
    // gulp.emit('m1_update');
    // gulp.on('m1_update', function() {
    //     console.log('이벤트 본문 m1');    
    // })
    
    // gulp.once('m1_update', function() {
    //     console.log('이벤트 본문 m1 once');    
    // })


    return gulp.src(base + 'src/**/*.hbs')
        .pipe(hb({debug: true})
            .partials('./template/partials/**/*.hbs')
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
            .data(base + 'template/**/*.json')
        )

        // .pipe(gulp.emit('m1_update', function(){}))
        // .emit('m1_update').on('error', function(e){
        //     this.emit('end', e);
        // })
        // .pipe(this.emit('eee').on('error', function(){}))
        .pipe(rename({
            extname: ".asp"
          }))
        // .pipe(gulp.emit('m1_update'))          
        // .pipe(function(e) {
        //     // console.log('___func__');
        //     // return through.obj(function(file, enc, cb) {
        //     //     cb(null, file);
        //     // });
        //   return through.obj();
        // })              
        // .pipe(function() {
        //     // gulp.emit('m1_update', function(e){});
        //     // return cb();
        //     return through.obj(function(file, enc, cb) {
        //         console.log(file.path);
        //         return cb(null, file);
        //     });
        // })
        // .pipe(this.emit('m1_update', function(e){}))
        // .on('error', function(e){})
        
        // .pipe(gulp.dest('./dist').emit('m1_update'));
        .pipe(gulp.dest('./dist'))
        .pipe(callback(function (file, enc, cb) {
            
            // 처리 파일 수만 큼 처리됨
            // 이벤트 발생
            gulp.emit('update', 10, 2);
            // console.log(file);
            cb();
        }));
        
    }, function updated(cb){
        gulp.emit('updated', 20, 2);
        return cb();
    })
);

// 같은 결과
var IDX = require('./index');
// var IDX = require('.');
// var IDX = require('./');

// ##################################################
// Task Excute

// 단독 실행시 시작 위치
gulp.task('default', gulp.series([mod + 'update', function updated(cb){
    gulp.emit('updated', 20, 2);
    return cb();
}]));           // 핸들바

module.exports.update = gulp.series([mod +'update']);
module.exports.setPath = function(basePath) {
    base   = basePath;
};
// module.exports.setMod = function(modName) {
//     mod = modName ? 'modName:' : '';
// };
module.exports.getData = require('./template/t');
module.exports.onUpdate = function(cb) {
    gulp.on('updated', function(a, b) {
        // TODO: 이부분은 조건 추가하던지
        cb(a, b);
    })
}