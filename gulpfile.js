// import * as _ from "lodash";
// _.padStart("Hello TypeScript!", 20, " ");

var schema;

schema = {
    dbname: "abc"
};

var gulp            = require('gulp'); 

// 경로 조정후 아래 처럼 바뀜 
// var a               = require('m1');
var a               = require('./module/m1');


// gulp.on('m1_update', function(a, b) {
//     console.log('이벤트 본문 m1' + a);    
// })

// gulp.once('m1_update', function() {
//     console.log('이벤트 본문 m1 once');    
// })

function default_pre(cb) {
    a.setPath('./module/m1/');
    a.onUpdate(function(a, b){
        console.log('이벤트 본문 gulpfile 에서 이벤트 내용 ' + a);    
    });
    console.log('default:End');
    return cb();
}

function default_update(cb) {
    // 비동기로 호출됨
    a.update();
    return cb();
}

gulp.task('default', gulp.series(default_pre, default_update));

// gulp.series('default')();


// console.log('End');

var abc = require('test');