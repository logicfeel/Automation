'use strict';
// gulp 3.9 기준

var gulp        = require('gulp'); 
// var search      = require("gulp-search");
var fs          = require("fs");
var contains    = require('gulp-contains');
// var sortJson    = require('sort-json');
var sortJSON = require('gulp-json-sort').default;

var replace     = require("gulp-replace");
var sourcemaps  = require('gulp-sourcemaps');
var lazypipe    = require('lazypipe');
var rename      = require('gulp-rename');

var SETUP_FILE = "gulp-setup.json";   // 설정 파일명

var SETUP = {
    file: "gulp-setup.json",
    obj_name: "qtb",
    clear: {
        use: true, 
        comment: true,
        set_ansi_null: true,
        set_quoted: true
    },
    options: {
        last_go: true,
        ddl_create: true
    }
};

var REG_EXP = {
    // USE DB
    USE_OBJ_NAME: /^USE+ [\[\w]+\]*\s+GO/g,                             
    // /****  ****/
    COMMENT: /\/\*{4,}.+\*{4,}\//g,                                     
    // 마지막 줄바꿈 공백
    LAST_SPACE: /\s+$/g,                                                
    // 마지막 2문자 (GO)
    LAST_GO: /..\s*$/g,                                                 
    // DDL create, alter "객체명사용목록"  $1: 전체명, $2: 객체명
    DDL_OBJ: /(?:alter|create)\s+(?:proc|procedure|function|table)\s+(((?:\[|")?\w+(?:\]|")?\.)\[?\w+\]?)/gi,
    // DDL create, alter "전체DDL문"  $1: 전체명, $2: 객체명 (*객체명 없을시 공백)
    DDL_ALL: /(?:alter|create)\s+(?:proc|procedure|function|table)\s+(((?:\[|")?\w+(?:\]|")?\.)?\[?\w+\]?)/gi,
    // DML SP $1: 전체명, $2: 객체명
    DML_SP: /(?:EXEC|EXCUTE) +(?:@\w+=\s*)?(((?:\[|")?\w+(?:\]|")?\.)\[?\w+\]?)/gi,
    // $1: FUNCTION, TABLE 값 여부로 DDL, DML 구분 ## 필터링 후 사용 ##
    // $2: 전체명
    // $3: 객체명
    DML_FN: /(\w+)?\W+(((?:\[|")?\w+(?:\]|")?\.)\[?\w+\]?)\s*\([^\)]*\)/gi,

    // 스칼라 함수
    _SCALER: /[\S]+\.[\w]+\(.*\)/g,
    // DML_FN 조건 + "_FN" 이름 기준으로 찾기
    _DML_FN_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_FN\w+\]?)\s*\([^\)]*\)/gi,
    // DML_FN 조건 + "_TF" 이름 기준으로 찾기
    _DML_TF_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_TF\w+\]?)\s*\([^\)]*\)/gi
};


/** 
 * --------------------------------------------------
 * 설정파일 초기화
 */
gulp.task('init', function () {
    return gulp.src('.' + SETUP.file)
        .pipe(rename(SETUP.file))
        .pipe(gulp.dest('./'));    
});

// var build = gulp.series('init', 'before');

// gulp.task('default', ['main-task']);
// gulp.task('default', ['link-task']);
// gulp.task('default', ['test']);
gulp.task('default', ['before']);
// gulp.task('default', ['init']);

console.log('-default-');
