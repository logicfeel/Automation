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
var gulpif      = require('gulp-if');

var sourcemaps  = require('gulp-sourcemaps');
var rename      = require('gulp-rename');

// #########################################################
// 지역변수

// var PATH = {                            
//     src: "src/**/*.sql",
//     src_U: "src/*+(Table|U)/*.sql",
//     src_VW: "src/*VW/*.sql",
//     src_FN: "src/*FN/*.sql",
//     src_TF: "src/*TF/*.sql",
//     src_SP: "src/*SP/*.sql",
//     src_TR: "src/*TR/*.sql",
//     dist: "dist",
//     map: "dist/map/"
// };

// gulp-setup.json 로딩 전역 설정
var SETUP = {};

var PATH = {
    src: "src/**/*.sql",
    dist: "dist/"
};

// 경로 정보 (그룹)
var FILE_GROUP = {
    'ALL.sql': "src/**/*.sql",
    'U.sql': "src/*+(Table|U)/*.sql",
    'VW.sql': "src/*VW/*.sql",
    'FN.sql': "src/*FN/*.sql",
    'TF.sql': "src/*TF/*.sql",
    'TR.sql': "src/*TR/*.sql",
    'SP.sql': "src/*SP/*.sql",
    'ETC.sql': "src/*ETC/*.sql"
};

var SETUP_FILE  = 'gulp-setup.json'   // 설정 파일명
/**  설정 파일 설명
{
    "_replace": [],             @summary 사전 컴파일 자료 
    "obj_name": "DB_OBJ_NAME",  @summary 객체|DB명
    "clear": {
        "comment": false,
        "use": false
    },
    "options": {
        "obj_type": 0:유지, @default 1:제거, 2: 교체,  3:교체(있을때만)
        "obj_fnc_type": 0:유지, 2: 교체,  @default 3:교체(있을때만)  !변경시 install-before 실행해야함
        "ddl_create": true,
        "log": true,
        "last_go": true
    },
    "replace": [                @summary 사용자 교체
        {
            "string": "교체대상 String",
            "src": "대상파일 전체경로 || 공백은 전체파일대상",
            "replacement": "교체할 String"
        }
    ],
    "task": "default"
}
 */

var REG_EXP = {
    // USE DB
    //USE_OBJ_NAME: /^USE+ [\[\w]+\]*\s+GO/g, 
    // TODO: 테스트 후 교체 해야함
    USE_OBJ_NAME: /^USE\s+((?:\[|")?(\w+)(?:\]|")?)\s+GO/g,    
    // /****  ****/
    COMMENT: /\/\*{4,}.+\*{4,}\//g,                                     
    // 첫 공백
    FIST_SPACE: /^\s*/g,
    // 마지막 공백
    LAST_SPACE: /\s+$/g,
    // 마지막 2문자 (GO)
    LAST_GO: /..\s*$/g,                                                 
    /**
     * DDL create, alter "전체DDL문"  
     * @param $1: 객체명 + 접미사(.) + 접두사(기능이름)
     * @param $2: 객체명 + 접미사(.)
     * @param $3: 객체명
     */
    DDL_ALL: /(?:alter|create)\s+(?:proc|procedure|function|table)\s+(((?:\[|")?(\w+)(?:\]|")?\.)?\[?\w+\]?)/gi,
    /**
     * DML SP 
     * @param $1: 객체명 + 접미사(.) + 접두사(기능이름)
     * @param $2: 객체명 + 접미사(.)
     * @param $3: 객체명
     */
    DML_SP: /(?:EXEC|EXCUTE) +(?:@\w+\s*=\s*)?(((?:\[|")?(\w+)(?:\]|")?\.)?\[?\w+\]?)/gi,
    /**
     * DML FN 
     * @param $1: FUNCTION, TABLE 구분값 : 여부로 DDL, DML 구분 ## 필터링 후 사용 ##
     * @param $2: 객체명 + 접미사(.) + 접두사(기능이름)
     * @param $3: 객체명 + 접미사(.)
     * @param $4: 객체명
     */
    DML_FN: /(\w+)?\s*(((?:\[|")?(\w+)(?:\]|")?\.)\[?\w+\]?)\s*\([^\)]*\)/gi,
    // DDL 명령
    DDL_COMMAND: /(alter|create)\s+(proc|procedure|function|table)(?!\s\S+\sadd)/gi,
    
    // DDL create, alter "객체명사용목록"  $1: 전체명, $2: 객체명
    _DDL_OBJ: /(?:alter|create)\s+(?:proc|procedure|function|table)\s+(((?:\[|")?\w+(?:\]|")?\.)\[?\w+\]?)/gi,
    // 스칼라 함수 
    _SCALER: /[\S]+\.[\w]+\(.*\)/g,
    // DML_FN 조건 + "_FN" 이름 기준으로 찾기
    _DML_FN_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_FN\w+\]?)\s*\([^\)]*\)/gi,
    // DML_FN 조건 + "_TF" 이름 기준으로 찾기
    _DML_TF_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_TF\w+\]?)\s*\([^\)]*\)/gi
};


// ##################################################
// 공통 함수
/** 
 * --------------------------------------------------
 * 객체명 교체
 * flag =  
 * @param fullName: 원본이름
 * @param prefix: 객체명 + 접미사(.) + 접두사(기능이름)
 * @param suffix: 객체명 + 접미사(.)
 * @param obj: 객체명
 * @param replacement: 교체할 객체명
 * @param flag: 0:유지, 1: 제거, 2: 교체,  3:교체(있을때만) * FN 에서 사용
 * 
 * @return 변경된 fullName
 */
function objNameReplace(fullName, prefix, suffix, obj, replacement, flag) {
    var _fullName;

    if (flag === 1 ) {          // 제거
        _fullName = fullName.replace(suffix, '');
    } else if (flag === 2) {    // 교체(일괄)
        if (typeof obj === 'undefined' || obj.trim() === '') {
            _fullName = replacement + '.' + prefix;
            _fullName = fullName.replace(prefix, _fullName);
        } else {
            _fullName = suffix.replace(obj, replacement);
            _fullName = fullName.replace(suffix, _fullName);
        }        
    } else if (flag === 3) {    // 3:교체(있을때만)
        if (typeof obj !== 'undefined') {
            _fullName = suffix.replace(obj, replacement);
            _fullName = fullName.replace(suffix, _fullName);
        }
    }
    return _fullName;
}


// ##################################################
// task 목록


/** 
 * --------------------------------------------------
 * install before 사전 작업
 */
gulp.task('install-before', gulpsync.sync(['load-setup', 'init-replace', 'get-replace', 'save-setup']));


/** 
 * --------------------------------------------------
 * 설치
 */
gulp.task('install', gulpsync.sync(['install-before', 'install-all']));


/** 
 * --------------------------------------------------
 * 전체 통합파일
 */
// gulp.task('install-all', ['load-setup'], function () {
//     return gulp.src(PATH.src)
//         // .pipe(gulp.src('sample.sql'))        // <= 이런식으로 파일 추가도 가능
//         .pipe(_install_common())
//         .pipe(gulp.dest(PATH.dist))
//         .pipe(concat(FILE.ALL))
//         .pipe(gulp.dest(PATH.dist));
// });

 gulp.task('install-all', ['load-setup'], function () {

    // 개별 그룹별 배치
    if (SETUP.intall_group) {
        gulp.src(PATH.src)
        .pipe(_install_common())
        .pipe(gulp.dest(PATH.dist))
        .pipe(groupConcat(FILE_GROUP))          // REVEIW: 이전에 gulp.dest 하면 없어짐
        .pipe(gulp.dest(PATH.dist));
    }
    
    // 개별 파일 배치    
    if (SETUP.intall_unit) {
    gulp.src(PATH.src)
        .pipe(_install_common())
        .pipe(gulp.dest(PATH.dist));
    }
});


/** 
 * --------------------------------------------------
 * 타입별 파일Y?
 */
// gulp.task('install-type', ['load-setup'], function () {
//     return gulp.src('src/*SP/*')
//         .pipe(gulp.src('src/*FN/*'))         // <<= 전체파일이  재정렬 됨
//         .pipe(_install_common())
//         .pipe(concat(FILE.ALL))
//         .pipe(gulp.dest(PATH.dist));
// });

//
gulp.task('install-type', ['load-setup'], function () {
    return gulp.src(['src/*SP/*', 'src/*FN/*']) // REVIEW: 그룹별 정렬됨
        .pipe(_install_common())
        .pipe(concat(FILE.ALL))
        .pipe(gulp.dest(PATH.dist));
});


/** 
 * --------------------------------------------------
 * 개별 파일
 */
gulp.task('install-unit', ['load-setup'], function () {
    return gulp.src(PATH.src)
        .pipe(_install_common())
        .pipe(gulp.dest(PATH.dist));
});


/** 
 * --------------------------------------------------
 * SETUP_FILE  설정파일 초기화 : .gulp-setup.json >> gulp-setup.json
 */
gulp.task('init', function () {
    return gulp.src('.' + SETUP_FILE)
        .pipe(rename(SETUP_FILE))
        .pipe(gulp.dest('./'));    
});


/** 
 * --------------------------------------------------
 * setup.json 로딩
 */
gulp.task('init-replace', function () {
    console.log('___initing setup.json___');

    SETUP._replace = [];
});


/** 
 * --------------------------------------------------
 * setup.json 로딩
 */
gulp.task('load-setup', function () {
    console.log('___loading setup.json___');
    var setup = fs.readFileSync(SETUP_FILE);

    SETUP = JSON.parse(setup);
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


/** 
 * --------------------------------------------------
 * 사전 작업 : 교체 목록 가져옴
 */
gulp.task('get-replace', function () {    
    return gulp.src(PATH.src)
        .pipe(replace(REG_EXP.DML_SP, function(match, p1, p2, p3, offset, string) {
                var objData = {};
                var _match;
                
                // 제외 조건 : 유지 + 객체 없음
                if (SETUP.options.obj_fnc_type === 1 && typeof p3 === 'undefined') return match;
                // 제외 조건 : 있을때만 교체 + 객체 없음
                if (SETUP.options.obj_fnc_type === 3 && typeof p3 === 'undefined') return match;

                _match = objNameReplace(match, p1, p2, p3, SETUP.obj_name, SETUP.options.obj_fnc_type);
                objData = {
                    src: this.file.relative,
                    string: match,
                    replacement: _match
                };
                SETUP._replace.push(objData);
                return match;
            })
        )
        .pipe(replace(REG_EXP.DML_FN, function(match, p1, p2, p3, p4, offset, string) {
                var objData = {};
                var _match;

                if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION') {
                    return  match;
                } else {
                    //  SETUP.options.obj_fnc_type (* fn은 있을 경우만 교체)
                    _match = objNameReplace(match, p2, p3, p4, SETUP.obj_name, SETUP.options.obj_fnc_type);
                    objData = {
                        src: this.file.relative,
                        string: match,
                        replacement: _match
                    };
                    SETUP._replace.push(objData);
                }
                return match;
            })
        );
    }
);


/** 
 * --------------------------------------------------
 * install 공통
 * ! 파이프 파일을 통합하기 전에 이용
 */
var _install_common = lazypipe()
    // DDL 명령 (create, alter)
    .pipe(replace, REG_EXP.DDL_COMMAND, function(match, p1, offset, string) {
        if (SETUP.options.ddl_create) {
            match = match.replace(p1, 'CREATE');
        }
        return match;
    })
    // DDL 구문
    .pipe(replace, REG_EXP.DDL_ALL, function(match, p1, p2, p3, offset, string) {
        var _match;

        _match = objNameReplace(match, p1, p2, p3, SETUP.obj_name, SETUP.options.obj_type);
        return _match;
    })
    // DML 구문 (프로시저)
    .pipe(replace, REG_EXP.DML_SP, function(match, p1, p2, p3, offset, string) {
        var _index = null;

        if (SETUP.options.obj_fnc_type === 0) return match;     // 유지 이후 처리 안함
        
        SETUP._replace.some(function(value, index, arr){
            if (value.string === match) {
                _index = index;
                return true;
            }
        });

        if (_index != null) {
            return SETUP._replace[_index].replacement;
        } else {
            return match;
        }
    })
    // DML 구문 (스칼라, 테이블)
    .pipe(replace, REG_EXP.DML_FN, function(match, p1, p2, p3, p4, offset, string) {
        var _match;
        var _index = null;

        if (SETUP.options.obj_fnc_type === 0) return match;     // 유지 이후 처리 안함

        if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION') {
            return  match;
        } else {
            SETUP._replace.some(function(value, index, arr){
                if (value.string === match) {
                    _index = index;
                    return true;
                }
            });
            if (_index != null) _match = SETUP._replace[_index].replacement;    
        }
        return _match;
    })
    // USE [객체명]
    .pipe(replace, REG_EXP.USE_OBJ_NAME, function(match, p1, p2, offset, string) {
        var _match;

        if (SETUP.clear.use) return '';
        else {
            // 객체명 있는 경우 교체함
            _match = objNameReplace(match, null, p1, p2, SETUP.obj_name, 3); 
            return _match;
        }
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
        if (SETUP.options.last_go && match.trim() != 'GO') return match + '\n\nGO\n';
        else return match + '\n';
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



// ##################################################
// gulp.task('default', ['main-task']);
// gulp.task('default', ['link-task']);
// gulp.task('default', ['test']);
// gulp.task('default', ['before']);
// gulp.task('default', ['before-sync']);
gulp.task('default', ['install-all']);
// gulp.task('default', ['install-type']);
// gulp.task('default', ['install-before']);
// gulp.task('default', ['init']);

// console.log('-default-');
