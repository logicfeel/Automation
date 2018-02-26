'use strict';

// 기본(부모) 로딩
var base    = require('./gulpfile');
var gulp    = require('gulp'); 
var callback;



var dep    = require('../m2/');

// ################## 이벤트 리스너 등록
gulp.on('update', function(a, b) {
    
    console.log('이벤트 본문 index.js 1.. 에서 이벤트 내용 ' + a);    
    console.log('종속 데이터 dep:' + dep.getData.tname.toString());
})

// gulp.on('updated', function(a, b) {
//     console.log('이벤트 본문 updated index.js 1.. 에서 이벤트 내용 ' + a);    
// })

// gulp.on('update', function(a, b) {
//     // TODO: 이부분은 조건 추가하던지
//     callback(a, b);
// })
// gulp.on('update', function(cb) {
//     cb();
// })


// base.update();
// gulp.series(base.update)();

module.exports = base;
// module.exports.onUpdate = function(cb) {
//     callback = cb;
// }


