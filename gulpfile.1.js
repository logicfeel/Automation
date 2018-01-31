'use strict';
// gulp 3.9 기준

var gulp        = require('gulp'); 
// var search      = require("gulp-search");
var fs          = require("fs");
// var contains    = require('gulp-contains');
// var sortJson    = require('sort-json');
var sortJSON = require('gulp-json-sort').default;

var replace     = require("gulp-replace");
var sourcemaps  = require('gulp-sourcemaps');
var lazypipe    = require('lazypipe');
var rename      = require('gulp-rename');
var gulpsync    = require('gulp-sync')(gulp);
var concat      = require('gulp-concat'); 



var Transform   = require('readable-stream/transform');
var through     = require('through2');

// 상수
var PATH = {                            // 경로 배치 정보
    src: "src/**/*.sql",
    dist: "dist",
    map: "dist/map/"
};
var SETUP_FILE  = "gulp-setup.json";   // 설정 파일명

// gulp-setup.json 로딩 전역 설정
var SETUP = {
    _replace: [],
    obj_name: "qtb",
    clear: {
        use: true, 
        comment: true
    },
    options: {
        last_go: true,
        obj_type: 1, // 0:유지, 1: 제거, 2: 교체, 3:교체(있을경우) 
        obj_fnc_type: 3, // 0:유지, 2: 교체, 3:교체(있을경우) 
        ddl_create: true
    },
    replace: []
};



var REG_EXP = {
    // USE DB
    USE_OBJ_NAME: /^USE+ [\[\w]+\]*\s+GO/g,                             
    // /****  ****/
    COMMENT: /\/\*{4,}.+\*{4,}\//g,                                     
    // 첫 공백
    FIST_SPACE: /^\s*/g,
    // 마지막 공백
    LAST_SPACE: /\s+$/g,
    // 마지막 2문자 (GO)
    LAST_GO: /..\s*$/g,                                                 
    // DDL create, alter "객체명사용목록"  $1: 전체명, $2: 객체명
    DDL_OBJ: /(?:alter|create)\s+(?:proc|procedure|function|table)\s+(((?:\[|")?\w+(?:\]|")?\.)\[?\w+\]?)/gi,
    /**
     * DDL create, alter "전체DDL문"  
     * $1: 전체명, 
     * $2: 객체명 '.'포함 [객체명].
     * $3: 객체명
     */
    DDL_ALL: /(?:alter|create)\s+(?:proc|procedure|function|table)\s+(((?:\[|")?(\w+)(?:\]|")?\.)?\[?\w+\]?)/gi,
    /**
     * DML SP 
     * $1: 전체명, 
     * $2: 객체명 '.'포함 [객체명].
     * $3: 객체명
     */
    DML_SP: /(?:EXEC|EXCUTE) +(?:@\w+\s*=\s*)?(((?:\[|")?(\w+)(?:\]|")?\.)\[?\w+\]?)/gi,
    /**
     * DML FN 
     * $1: FUNCTION, TABLE 값 여부로 DDL, DML 구분 ## 필터링 후 사용 ##
     * $2: 전체명, 
     * $3: 객체명 '.'포함 [객체명].
     * $4: 객체명
     */
    DML_FN: /(\w+)?\s*(((?:\[|")?(\w+)(?:\]|")?\.)\[?\w+\]?)\s*\([^\)]*\)/gi,
    // DDL 명령
    DDL_COMMAND : /(alter|create)\s+(?=proc|procedure|function|table)/gi,
    
    // 스칼라 함수 
    _SCALER: /[\S]+\.[\w]+\(.*\)/g,
    // DML_FN 조건 + "_FN" 이름 기준으로 찾기
    _DML_FN_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_FN\w+\]?)\s*\([^\)]*\)/gi,
    // DML_FN 조건 + "_TF" 이름 기준으로 찾기
    _DML_TF_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_TF\w+\]?)\s*\([^\)]*\)/gi
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

gulp.task('test', function () {
    return gulp.src('sample.sql')
        .pipe(replace(REG_EXP.DML_FN, function(match, p1, offset, string) {
            // var setup = fs.readFileSync(SETUP_FILE);
            // var jsonSetup = JSON.parse(setup);
            // var objData = {};
            // objData.src = this.file.relative;
            // objData.string = match;
            // objData.replacement = "";
            // jsonSetup._replace.push(objData);
            // fs.writeFileSync(SETUP_FILE, JSON.stringify(jsonSetup));
            var _match;
            _match = match.replace(string, SETUP.obj_name + ".");
            return _match;
        }))
        .pipe(gulp.dest(''));
});


/** 
 * --------------------------------------------------
 * 설정파일 초기화
 */
gulp.task('init', function () {
    return gulp.src('.' + SETUP_FILE)
        .pipe(rename(SETUP_FILE))
        .pipe(gulp.dest('./'));    
});


/** 
 * --------------------------------------------------
 * SETUP_FILE._replace = [] : 초기화
 */
gulp.task('init-replace', function () {
    var setup = fs.readFileSync(SETUP_FILE);
    var jsonSetup = JSON.parse(setup);

    // 초기화
    jsonSetup._replace = [];    
    fs.writeFileSync(SETUP_FILE, JSON.stringify(jsonSetup));
});


/** 
 * --------------------------------------------------
 * 사전 작업
 */
gulp.task('get-replace', function () {    
    return gulp.src(PATH.src)
        .pipe(replace(REG_EXP.DML_SP, function(match, p1, p2, p3, offset, string) {
            var setup = fs.readFileSync(SETUP_FILE);
            var jsonSetup = JSON.parse(setup);
            var objData = {};
            var _list;
            var _match;
            

            // TODO: 조건문 추가해야함 : 일단 무조건 바꾸는걸로
            // => 테스트 했으니 해도 해도됨
            // _match = p2.replace(p3, SETUP.obj_name);
            // _match = match.replace(p2, _match);
            
            _match = objReplace(match, p1, p2, p3, SETUP.obj_name, SETUP.options.obj_type);

            objData = {
                src: this.file.relative,
                string: match,
                replacement: _match
            };
            jsonSetup._replace.push(objData);
            fs.writeFileSync(SETUP_FILE, JSON.stringify(jsonSetup));
            return match;
            })
        )
        .pipe(replace(REG_EXP.DML_FN, function(match, p1, p2, p3, p4, offset, string) {
                var setup = fs.readFileSync(SETUP_FILE);
                var jsonSetup = JSON.parse(setup);
                var objData = {};
                var _match;

                if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION') {
                    return  match;
                }  else {

                    // TODO: 조건문 추가해야함 : 일단 무조건 바꾸는걸로
                    // => 테스트 했으니 해도 해도됨
                    // _match = p3.replace(p4, SETUP.obj_name);
                    // _match = match.replace(p3, _match);

                    //  SETUP.options.obj_fnc_type (* fn은 있을 경우만 교체)
                    _match = objReplace(match, p2, p3, p4, SETUP.obj_name, SETUP.options.obj_fnc_type);
                    objData = {
                        src: this.file.relative,
                        string: match,
                        replacement: _match
                    };
                    jsonSetup._replace.push(objData);
                    fs.writeFileSync(SETUP_FILE, JSON.stringify(jsonSetup));
                }
                return match;
            })
        );
    }
);


/** 
 * --------------------------------------------------
 * 설정파일 정렬
 */
// gulp.task('sort-replace', ['get-replace'], function () {
gulp.task('sort-replace',function () {
    return gulp.src(SETUP_FILE)
        .pipe(sortJSON({ space: 2 }))
        .pipe(gulp.dest('./'));  
});


/** 
 * --------------------------------------------------
 * 사전 작업 : 동기화방식
 * - init-replace : _replace 객체 초기화
 * - get-replace : 객체형 추출
 * - sort-replace : 설정 JSON 정렬
 */
gulp.task('before-sync', gulpsync.sync(['init-replace', 'get-replace', 'sort-replace']));

// load-setup

/** 
 * --------------------------------------------------
 * 공통 함수
 */
// 객체명 교체
// flag =  0:유지, 1: 제거, 2: 교체,  3:교체(있을때만) * FN 에서 사용
function objReplace(fullName, prefix, suffix, obj, replacement, flag) {
    var _match;

    if (flag === 1 ) {          // 제거
        _match = fullName.replace(suffix, '');
    } else if (flag === 2) {    // 교체(일괄)
        if (typeof obj === 'undefined' || obj.trim() === '') {
            _match = replacement + '.' + prefix;
            _match = fullName.replace(prefix, _match);
        } else {
            _match = suffix.replace(obj, replacement);
            _match = fullName.replace(suffix, _match);
        }        
    } else if (flag === 3) {    // 3:교체(있을때만)
        if (typeof obj !== 'undefined') {
            _match = suffix.replace(obj, replacement);
            _match = fullName.replace(suffix, _match);
        }
    }
    return _match;
}

/** 
 * --------------------------------------------------
 * install 공통
 * ! 파이프 파일을 통합하기 전에 이용
 */


var _install_common = lazypipe()
    .pipe(replace, REG_EXP.DDL_COMMAND, function(match, p1, offset, string) {
        if (SETUP.options.ddl_create) {
            match = match.replace(p1, 'CREATE');
        }
        return match;
    })
    .pipe(replace, REG_EXP.DDL_ALL, function(match, p1, p2, p3, offset, string) {
        var _match;

        _match = objReplace(match, p1, p2, p3, SETUP.obj_name, SETUP.options.obj_type);
        return _match;
    })
    .pipe(replace, REG_EXP.DML_SP, function(match, p1, p2, p3, offset, string) {
        var _match;
        var _index = null;

        SETUP._replace.some(function(value, index, arr){
            if (value.string === match) {
                _index = index;
                return true;
            }
        });

        if (_index != null) _match = SETUP._replace[_index].replacement;

        return _match;
    })
    .pipe(replace, REG_EXP.DML_FN, function(match, p1, p2, p3, p4, offset, string) {
        var _match;
        var _index = null;

        SETUP._replace.some(function(value, index, arr){
            if (value.string === match) {
                _index = index;
                return true;
            }
        });

        if (_index != null) _match = SETUP._replace[_index].replacement;

        return _match;
    })
    // USE [객체명]
    .pipe(replace, REG_EXP.USE_OBJ_NAME, function(match, p1, offset, string) {
        if (SETUP.clear.use) return '';
        else return match;
    })
    // 주석 /** **/ 
    .pipe(replace, REG_EXP.COMMENT, function(match, p1, offset, string) {
        if (SETUP.clear.comment) return '';
        else return match;
    })
    // 첫 빈줄 제거
    .pipe(replace, REG_EXP.FIST_SPACE, '')    
    // 마지막 빈줄 제거
    .pipe(replace, REG_EXP.LAST_SPACE, '')
    // 정규표현 : 마지막 GO
    .pipe(replace, REG_EXP.LAST_GO, function(match, p1, offset, string) {
        if (SETUP.options.last_go && match.trim() != "GO") return match + "\n\nGO\n";
        else return match;
    })
    .pipe(function() {
        // console.log('___func__');
        return through.obj(function(file, enc, cb) {
            var result;
            var filePath = String(file.relative);
            
            if (file.isNull()) {
                // return empty file
                return cb(null, file);
            }else if(file.isBuffer()) {
                result = String(file.contents);
                SETUP.replace.forEach(function(value, index, arr) {
                    
                    // REVIEW:  !! JSON 파일은 정규식 지원 안함
                    if ((value.src instanceof RegExp && filePath.search(value.src) > -1) ||
                        value.src === filePath || value.src.length === 0) {
                        result = result.replace(value.string, value.replacement);
                    }
                });
            }
            // if (file.isStream()) {
            //   file.contents = file.contents.pipe(prefixStream(prefixText));
            // }
            
            // 파이프 파일에 저장
            file.contents = new Buffer(result);

            cb(null, file);
          });
        // return through.obj();
    });


/** 
 * --------------------------------------------------
 * _replace 초기화 및 불러오기
 */
gulp.task('load-replace', function () {
    var setup = fs.readFileSync(SETUP_FILE);
    SETUP._replace = JSON.parse(setup)._replace;
    SETUP.replace = JSON.parse(setup).replace;
    console.log('___loading setup.json___');
});


/** 
 * --------------------------------------------------
 * setup.json 로딩
 */
gulp.task('load-setup', function () {
    var setup = fs.readFileSync(SETUP_FILE);
    SETUP = JSON.parse(setup);
    console.log('___loading setup.json___');
});


/** 
 * --------------------------------------------------
 * setup.json 로딩
 */
gulp.task('save-setup', function () {
    console.log('___saving setup.json___');
    
    fs.writeFileSync(SETUP_FILE, JSON.stringify(SETUP));
   
    return gulp.src(SETUP_FILE)
        .pipe(sortJSON({ space: 2 }))
        .pipe(gulp.dest('./'));     
});


gulp.task('before-sync', gulpsync.sync(['init-replace', 'get-replace', 'sort-replace']));


/** 
 * --------------------------------------------------
 * 전체 통합파일
 */
gulp.task('install-all', ['load-replace'], function () {
    return gulp.src(PATH.src)
        // .pipe(gulp.src('sample.sql'))        // <= 이런식으로 파일 추가도 가능
        .pipe(_install_common())
        .pipe(gulp.dest(PATH.dist))
        .pipe(concat('all.sql'))
        .pipe(gulp.dest(PATH.dist));
});


/** 
 * --------------------------------------------------
 * 타입별 파일Y?
 */
gulp.task('install-type', function () {
    return gulp.src(PATH.src)
        .pipe(_install_common())
        .pipe(concat('all.sql'))
        .pipe(gulp.dest(PATH.dist));
});


/** 
 * --------------------------------------------------
 * 개별 파일
 */
gulp.task('install-unit', function () {
    return gulp.src(PATH.src)
        .pipe(_install_common())
        .pipe(gulp.dest(PATH.dist));
});


/** 
 * --------------------------------------------------
 * 설치
 */
    gulp.task('install', function () {
        return gulp.src(SETUP_FILE)
            .pipe(sortJSON({ space: 2 }))
            .pipe(gulp.dest('./'));  
    });
    




// var build = gulp.series('init', 'before');

// gulp.task('default', ['main-task']);
// gulp.task('default', ['link-task']);
// gulp.task('default', ['test']);
// gulp.task('default', ['before']);
// gulp.task('default', ['before-sync']);
gulp.task('default', ['install-all']);
// gulp.task('default', ['init']);

console.log('-default-');