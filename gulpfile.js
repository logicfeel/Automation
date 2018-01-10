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
    // 스칼라 함수
    SCALER: /[\S]+\.[\w]+\(.*\)/g,
    // DDL create, alter 문의 객체명  $1: 전체명, $2: 객체명
    DDL_OBJ: /(?:alter|create)\s+(?:proc|procedure|function|table)\s+(((?:\[|")?\w+(?:\]|")?\.)\[?\w+\]?)/gi,
    // DML 전체 객체
    DML_OBJ: "",
    // DML SP $1: 전체명, $2: 객체명
    DML_SP: /(?:EXEC|EXCUTE) +(?:@\w+=\s*)?(((?:\[|")?\w+(?:\]|")?\.)\[?\w+\]?)/gi,
    // $1: FUNCTION, TABLE 값 여부로 DDL, DML 구분
    // $2: 전체명
    // $3: 객체명
    DML_FN: /(\w+)?\W+(((?:\[|")?\w+(?:\]|")?\.)\[?\w+\]?)\s*\([^\)]*\)/gi,
    // DML_FN 조건 + "_FN" 이름 기준으로 찾기
    DML_FN_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_FN\w+\]?)\s*\([^\)]*\)/gi,
    // DML_FN 조건 + "_TF" 이름 기준으로 찾기
    DML_TF_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_TF\w+\]?)\s*\([^\)]*\)/gi,
    
};


/**
 * 스칼라 함수 추출 => _replace: [..] 저장
 */
gulp.task('scaler-get', function (cb) {

    var setup = fs.readFileSync(SETUP_FILE);
    var jsonSetup = JSON.parse(setup);

    // 초기화
    jsonSetup._replace = [];    
    fs.writeFileSync(SETUP_FILE, JSON.stringify(jsonSetup));

    return gulp.src('src/**/*.sql')
        // 정규표현 : 스칼라 함수 
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





var contentSet = lazypipe()
    // 정규표현 : USE DB 
    .pipe(replace, REG_EXP.USE_OBJ_NAME, function(match, p1, offset, string) {
            if (SETUP.clear.use) return '';
            else return match;
    })
    // 정규표현 : 주석 /** **/ 
    .pipe(replace, REG_EXP.COMMENT, function(match, p1, offset, string) {
        if (SETUP.clear.comment) return '';
        else return match;
    })
    // // 정규표현 : SET ANSI_NULLS
    // .pipe(replace, /\bSET ANSI.+\sGO/g, function(match, p1, offset, string) {
    //     if (SETUP.clear.set_ansi_null) return '';
    //     else return match;
    // })
    // // 정규표현 : SET QUOTED 
    // .pipe(replace, /\bSET QUOTED.+\sGO/g, function(match, p1, offset, string) {
    //     if (SETUP.clear.set_quoted) return '';
    //     else return match;
    // })
    // 정규표현 : 마지막 빈줄 제거
    .pipe(replace, REG_EXP.LAST_SPACE, '')
    // 정규표현 : 마지막 GO
    .pipe(replace, REG_EXP.LAST_GO, function(match, p1, offset, string) {
        if (SETUP.options.last_go && match.trim() != "GO") return match + "\n\nGO\n";
        else return match;
    });
    // // 정규표현 : DB명 (스칼라 제외)
    // .pipe(replace, /\/(?:\*+).+\*+\//g, function(match, p1, offset, string) {
    //     if (SETUP.clear.comment) return '';
    //     else return match;
    // });



gulp.task('link2-task', ['before-task'], function () {
    return gulp.src('src/FN/*.sql')
        .pipe(contentSet())
        .pipe(gulp.dest('dist/FN'));
});

gulp.task('link-task', ['link2-task'], function () {
    console.log('main');
});

gulp.task('test',function () {
    return gulp.src('sample.sql')
        .pipe(replace(REG_EXP.DML_FN, function(match, p1, offset, string) {
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

// gulp.task('default', ['main-task']);
// gulp.task('default', ['link-task']);
gulp.task('default', ['test']);

console.log('-default-');
