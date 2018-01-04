var gulp = require('gulp');             
// var concat = require('gulp-concat');
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var search = require('gulp-search');
// src(원본) 불필요 제거 : DB명


// 기본실행
gulp.task('combine-js', function () {
	return gulp.src('src/**/*.js')      // src 폴더 하위으 모든 .js 파일
	.pipe(concat('all.js'))             // 합칠 파일명 (플러그인)
	.pipe(gulp.dest('dist/js'));        // 쓰기 폴더
});


gulp.task('map-js', function () {
	return gulp.src('src/**/*.js')      // src 폴더 하위으 모든 .js 파일
	.pipe(sourcemaps.init())
	.pipe(concat('all.js'))             // 합칠 파일명 (플러그인)
	.pipe(sourcemaps.write('maps'))
	.pipe(gulp.dest('dist/js'));        // 쓰기 폴더
});

gulp.task('rename-js', function () {
	return gulp.src('src/**/*.js')      // src 폴더 하위으 모든 .js 파일
	.pipe(sourcemaps.init())
	.pipe(rename(function (path) {
		path.dirname += "/ciao";        	// 폴더 변경
		path.basename += "-goodbye";    // 파일명 변경
		path.extname = ".md";           // 확장자 변경 (* 점을 포함)
	  }))	
	.pipe(sourcemaps.write('../maps'))
	.pipe(gulp.dest('dist/js'));        // 쓰기 폴더
});

gulp.task('replace-js', function () {
	return gulp.src('src/**/*.sql')      // src 폴더 하위으 모든 .js 파일
	.pipe(replace('ALTER', 'UPDATE'))        // 바꾸기
	.pipe(gulp.dest('dist/js'));        // 쓰기 폴더
});

//----------------------------------------------
// var _match = "sstory40";

var bbb = "B";
// global._match = "sstory40";
global._match = "B";
// global.useGlobal = true;

gulp.task('clean-dbname', function () {

    // var _match = "sstory40";
    // var _match;
    var abc = 3;

    console.log('clean-dbname:' + bbb);
    console.log('clean-dbname2:' + global._match);
    
    // global._match = "sstory40";
    
    gulp.src('src/**/*.sql')
        // USE [DB명] : GO 제거
        // .pipe(replace(/USE\s\[\w+\]/g, function(match, p1, offset, string) {
        //     var ed_idx = match.indexOf("]");
        //     var make = "USE ";
        //     // global._match = match.substring(make.length + 1, ed_idx);
        //     global._match = "sstory40";
        //     // this.file._match = _match;
        //     console.log('global2:' + bbb);
        //     console.log('log:' + global._match);
        //     return '';
        // }))

        // [DB명] : 제거
        // .pipe(replace(String(global._match), function(match) {
        //     console.log('log2-1:' + global._match);
        //     console.log('log2-2:' + this.file.history);
        //     return '';
        // }))
        .pipe(replace(global._match, function(match) {
            console.log('log3-1:' + _match);
            console.log('log3-2:' + match);
            console.log('global3:' + bbb);
            return '';
        }))
        // .pipe(replace('sstory40', function(match) {
        //     console.log('log3-1:' + _match);
        //     console.log('log3-2:' + match);
        //     console.log('global3:' + bbb);
        //     return '';
        // }))
        // .pipe(replace('[sstory40].', ''))
	    .pipe(gulp.dest('dist/'));
});

gulp.task('dbuser-get', function () {

    console.log('dbuser-get');
    
    gulp.src('src/**/*.sql')
        // USE [DB명] : GO 제거
        .pipe(replace(/USE\s\[\w+\]/g, function(match, p1, offset, string) {
            var ed_idx = match.indexOf("]");
            var make = "USE ";
            // global._match = match.substring(make.length + 1, ed_idx);
            bbb = "sstory40";
            global._match = "sstory40";
            // this.file._match = _match;
            console.log('global2:' + bbb);
            console.log('log:' + global._match);
            return '';
        }))

});

gulp.task('templates', function(){
    gulp.src('src/**/*.sql')
        .pipe(search(/sstory40/g, function(item) {
            return item;
        }))
        .pipe(gulp.dest('...'));
  });


gulp.task('default', ['dbuser-get']);

