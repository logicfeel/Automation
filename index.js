var schema;

schema = {
    dbname: "abc"
};

var gulp            = require('gulp'); 

var a = require('./module/m1');

gulp.on('m1_update', function(a, b) {
    console.log('이벤트 본문 m1' + a);    
})

gulp.once('m1_update', function() {
    console.log('이벤트 본문 m1 once');    
})

gulp.task('default', function() {
    a.setPath('./module/m1/');
    a.update();
});

gulp.series('default')();





console.log('End');