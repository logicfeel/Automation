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
var rename      = require('gulp-rename');

// TODO: 핸들바 추가 해야함
var hb          = require('gulp-hb');

// 사용전 플러그인
// var gulpif      = require('gulp-if');
// var sourcemaps  = require('gulp-sourcemaps');



// #########################################################
// 전역 변수

var MODULE_VISION   = "1.0.0";
var MODULE_NAME     = "gulp-module";

// gulp-setup.json 로딩 전역 설정
var CONFIG      = null;
var LOG_FLAG    = true;     // 로그 표시
var DEBUG_HBS   = true;     // 템플릿 디버깅 로그 표시

// 기본 경로 (필수)
var PATH = {
    base: "",
    src: "src/**/*.sql",
    dist: "dist/",
    template: {
        ext: ".sql",        // 기본 변환 확장자
        dist: "dist/",      // 덮어씀 
        src: "src/**/*.hbs",
        partials: "template/**/*.hbs",
        helpers: "template/*.js",
        data: "template/*.json"
    }
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

var CONFIG_FILE  = 'gulp-module.json';   // 설정 파일명
/**  설정 파일 설명
    {
        "_replace": [],             @summary 사전 컴파일 자료 
        "version": "1.0.0",         @summary 스키마 파일 버전
        "obj_name": "DB_OBJ_NAME",  @summary 객체|DB명
        "prefix_name": "",          @summary 함수|프로시저|테이블명 접두사(앞)
        "suffix_name": "",          @summary 함수|프로시저|테이블명 접미사(뒤)
        "clear": {
            "comment": false,       @summary 자동 생성 주석 제거 유무
            "use": true             @summary USE [DB] 제거 유무    
        },
        "options": {
            "obj_type": 1,          @summary DDL문 객체명 옵션
                                    0:유지, *1:제거, 2: 교체,  3:교체(있을때만) 
            "obj_fnc_type": 3,      @summary 함수,프로시저 객체명 옵션
                                    0:유지, 2: 교체,  *3:교체(있을때만)  !변경시 install-before 실행해야함
            "ddl_create": true,     @summary ALTER >> CREATE 변경 여부
            "log": true,
            "intall_group": true,   @summary 타입(그룹)별 파일 설치, * 전체 포함
            "intall_unit": true,    @summary 개별 파일 설치
            "last_go": true         @summary 파일 마지막에 구분자 GO 추가 유무
        },
        "replace": [                @summary 사용자 교체
            {
                "string": "",       @summary 사용자 교체 대상
                "src": "",          @summary 사용자 대상파일, *''공백은 제한 없음
                "replacement": ""   @summary 사용자 교체 이름
            }
        ],
        "task": "default"
    }
 */

var REG_EXP = {
    // USE [객체|DB명]
    USE_OBJ_NAME: /^\s*USE\s+((?:\[|")?(\w+)(?:\]|")?)\s+GO/g,    
    // 시스템 4줄 이상 주석 /****  ****/
    COMMENT: /\/\*{4,}.+\*{4,}\//g,                                     
    // 첫 공백
    FIST_SPACE: /^\s*/g,
    // 마지막 공백
    LAST_SPACE: /\s+$/g,
    // 마지막 2문자 (GO)
    LAST_GO: /..\s*$/g,                                                 
    /**
     * DDL 명령 alter => create
     * @param $1: CREATE | ALTER  
     * @param $2: TABLE | PROC | PROCEDURE | FUNCTION 
     */    
    DDL_COMMAND: /(alter|create)\s+(proc|procedure|function|table)(?!\s\S+\s*(add|with))/gi,
    /**
     * DDL create, alter "전체DDL문"  
     * @param $1: 객체명 + 접미사(.) + 타겟명
     * @param $2: 객체명 + 접미사(.)
     * @param $3: 객체명
     * @param $4: 타겟명 : 함수|프로시저|테이블명
     */
    DDL_ALL: /(?:(?:alter|create)\s+(?:proc|procedure|function|table)|references)\s+(((?:\[|")?(\w+)(?:\]|")?\.)?\[?(\w+)\]?)/gi,
    /**
     * DML SP 
     * @param $1: 객체명 + 접미사(.) + 타겟명
     * @param $2: 객체명 + 접미사(.)
     * @param $3: 객체명
     * @param $4: 타겟명 : 함수|프로시저|테이블명
     */
    DML_SP: /(?:EXEC|EXCUTE) +(?:@\w+\s*=\s*)?(((?:\[|")?(\w+)(?:\]|")?\.)?\[?(\w+)\]?)/gi,
    /**
     * DML FN 
     * @param $1: FUNCTION, TABLE 구분값 : 여부로 DDL, DML 구분 ## 필터링 후 사용 ##
     * @param $2: 객체명 + 접미사(.) + 타겟명
     * @param $3: 객체명 + 접미사(.)
     * @param $4: 객체명
     * @param $5: 타겟명 : 함수|프로시저|테이블명
     */
    DML_FN: /(\w+)?\s*(((?:\[|")?(\w+)(?:\]|")?\.)\[?(\w+)\]?)\s*\([^\)]*\)/gi,
    
    // 테스트 정규식
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
 * @param fullName:     (*필수) 원본이름 
 * @param prefix:       (*선택) 객체명 + 접두사(.) + 타겟명
 * @param suffix:       (*선택) 객체명 + 접미사(.)
 * @param obj:          (*선택) 객체명 
 * @param replacement:  (*필수) 교체할 객체명 
 * @param flag:         (*필수) 0:유지, 1: 제거, 2: 교체,  3:교체(있을때만) * FN 에서 사용
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
 * default 태스크
 */
// gulp.task('default', gulpsync.sync(['preinstall', 'install']));

// 디버깅 시
// gulp.task('default', ['init']);              // 초기화 (설정 파일 초기화, 배치폴더 제거)
// gulp.task('default', ['preinstall']);        // 통합 실행
// gulp.task('default', ['install']);           // 배포
gulp.task('default', ['template']);          // 템플릿

/** 
 * --------------------------------------------------
 * preinstall 설정파일 구성
 */
gulp.task('preinstall', gulpsync.sync(['load-config', 'build-config-replace']), function() {

        fs.writeFileSync(CONFIG_FILE, JSON.stringify(CONFIG));
    
        return gulp.src(PATH.base + CONFIG_FILE)
            .pipe(sortJSON({ space: 2 }))
            .pipe(gulp.dest(PATH.base + './'));    
    }
);

/** 
 * --------------------------------------------------
 * 설정 로딩
 */
gulp.task('load-config', function() {
        var setup;

        if (LOG_FLAG) console.log('___loading '+ CONFIG_FILE + '___');
    
        // 설정객체가 없는 경우
        if (!CONFIG) {
            setup = fs.readFileSync(CONFIG_FILE);

            CONFIG = JSON.parse(setup);
        }
    }
);

/** 
 * --------------------------------------------------
 * 설정파일 구성 (_replace 영역)
 */
gulp.task('build-config-replace', function() {

    CONFIG._replace = [];

    return gulp.src(PATH.base + PATH.src)
        .pipe(replace(REG_EXP.DML_SP, function(match, p1, p2, p3, p4, offset, string) {
                var objData = {};
                var _match;
                
                // 제외 조건 : 유지 + 객체 없음
                if (CONFIG.options.obj_fnc_type === 1 && typeof p3 === 'undefined') return match;
                // 제외 조건 : 있을때만 교체 + 객체 없음
                if (CONFIG.options.obj_fnc_type === 3 && typeof p3 === 'undefined') return match;

                _match = objNameReplace(match, p1, p2, p3, CONFIG.obj_name, CONFIG.options.obj_fnc_type);

                if (CONFIG.prefix_name.length > 0 ||  CONFIG.suffix_name.length > 0) {
                    _match = _match.replace(p4, CONFIG.prefix_name + p4 + CONFIG.suffix_name);
                }
        
                objData = {
                    src: this.file.relative,
                    string: match,
                    replacement: _match
                };
                CONFIG._replace.push(objData);
                return match;
            })
        )
        .pipe(replace(REG_EXP.DML_FN, function(match, p1, p2, p3, p4, p5, offset, string) {
                var objData = {};
                var _match;

                if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION' ||
                    p1.toUpperCase().trim() === 'REFERENCES') {
                    return  match;
                } else {
                    //  CONFIG.options.obj_fnc_type (* fn은 있을 경우만 교체)
                    _match = objNameReplace(match, p2, p3, p4, CONFIG.obj_name, CONFIG.options.obj_fnc_type);
                    
                    if (CONFIG.prefix_name.length > 0 ||  CONFIG.suffix_name.length > 0) {
                        _match = _match.replace(p5, CONFIG.prefix_name + p5 + CONFIG.suffix_name);
                    }

                    objData = {
                        src: this.file.relative,
                        string: match,
                        replacement: _match
                    };
                    CONFIG._replace.push(objData);
                }
                return match;
            })
        );
    }
);


/** 
 * --------------------------------------------------
 * 설치
 */
gulp.task('install', ['load-config'], function() {

        // 개별 그룹별 배치 (전체 포함)
        if (CONFIG.options.intall_group) {
            gulp.src(PATH.base + PATH.src)
                .pipe(_install_common())
                .pipe(groupConcat(FILE_GROUP))          // REVEIW: 이전에 gulp.dest 하면 없어짐
                .pipe(gulp.dest(PATH.base + PATH.dist));
        }
        
        // 개별 파일 배치
        if (CONFIG.options.intall_unit) {
            gulp.src(PATH.base + PATH.src)
                .pipe(_install_common())
                .pipe(gulp.dest(PATH.base + PATH.dist));
        }

        // 템플릿 *덮기
        if (CONFIG.options.template_overlap) {
            template_hbs();
        }
    }
);

/** 
 * --------------------------------------------------
 * 템플릿
 */
gulp.task('template', ['load-config'], template_hbs);


/** 
 * --------------------------------------------------
 * CONFIG_FILE  설정파일 초기화 : .gulp-setup.json >복사> gulp-setup.json
 */
gulp.task('init', ['clean-dist'], function () {
    return gulp.src(PATH.base + '.' + CONFIG_FILE)
        .pipe(rename(CONFIG_FILE))
        .pipe(gulp.dest(PATH.base + './'));    
});


/** 
 * --------------------------------------------------
 * 설치 폴더(dist) 제거
 */
gulp.task('clean-dist', function () {
    return gulp.src(PATH.base + PATH.dist, {read: false})
      .pipe(clean());
});


/** 
 * --------------------------------------------------
 * install 공통
 * ! 파이프 파일을 통합하기 전에 이용
 */
var _install_common = lazypipe()
    // DDL 명령 (create, alter)
    .pipe(replace, REG_EXP.DDL_COMMAND, function(match, p1, offset, string) {
        if (CONFIG.options.ddl_create) {
            match = match.replace(p1, 'CREATE');
        }
        return match;
    })
    // DDL 구문 (객체명)
    .pipe(replace, REG_EXP.DDL_ALL, function(match, p1, p2, p3, p4, offset, string) {
        var _match;

        _match = objNameReplace(match, p1, p2, p3, CONFIG.obj_name, CONFIG.options.obj_type);
        
        if (CONFIG.prefix_name.length > 0 ||  CONFIG.suffix_name.length > 0) {
            _match = _match.replace(p4, CONFIG.prefix_name + p4 + CONFIG.suffix_name);
        }
        return _match;
    })
    // DML 구문 (프로시저)
    .pipe(replace, REG_EXP.DML_SP, function(match, p1, p2, p3, p4, offset, string) {
        var _index = null;
        var _targetName = '';
        var _match = '';

        // _replace에서 타겟명 변경 안된것 처리
        if (CONFIG.prefix_name.length > 0 ||  CONFIG.suffix_name.length > 0) {
            _targetName = CONFIG.prefix_name + p4 + CONFIG.suffix_name;
            _match = match.replace(p4, _targetName);
        } else {
            _match = match;
        }

        if (CONFIG.options.obj_fnc_type === 0) return _match;     // 유지 이후 처리 안함

        CONFIG._replace.some(function(value, index, arr){
            if (value.string === match) {
                _index = index;
                return true;
            }
        });

        if (_index != null) {
            return CONFIG._replace[_index].replacement;
        } else {
            return _match;
        }
    })
    // DML 구문 (스칼라, 테이블)
    .pipe(replace, REG_EXP.DML_FN, function(match, p1, p2, p3, p4, p5, offset, string) {
        var _match;
        var _index = null;

        if (CONFIG.options.obj_fnc_type === 0) return match;     // 유지 이후 처리 안함

        if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION' ||
            p1.toUpperCase().trim() === 'REFERENCES') {
            return  match;
        } else {
            CONFIG._replace.some(function(value, index, arr){
                if (value.string === match) {
                    _index = index;
                    return true;
                }
            });
            if (_index != null) _match = CONFIG._replace[_index].replacement;    
        }
        return _match;
    })
    // USE [객체명]
    .pipe(replace, REG_EXP.USE_OBJ_NAME, function(match, p1, p2, offset, string) {
        var _match;

        if (CONFIG.clear.use) return '';
        else {
            // 객체명 있는 경우 교체함
            _match = objNameReplace(match, null, p1, p2, CONFIG.obj_name, 3); 
            return _match;
        }
    })
    // 주석 /** **/ 
    .pipe(replace, REG_EXP.COMMENT, function(match, p1, offset, string) {
        if (CONFIG.clear.comment) return '';
        else return match;
    })
    // 첫 빈줄 제거
    .pipe(replace, REG_EXP.FIST_SPACE, '')    
    // 마지막 빈줄 제거
    .pipe(replace, REG_EXP.LAST_SPACE, '')
    // 정규표현 : 마지막 GO
    .pipe(replace, REG_EXP.LAST_GO, function(match, p1, offset, string) {
        if (CONFIG.options.last_go && match.trim() != 'GO') return match + '\n\nGO--Auto\n\n';
        else return match + '--End\n\n';
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
                CONFIG.replace.forEach(function(value, index, arr) {
                    
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


function template_hbs() {
    return gulp.src(PATH.base + PATH.template.src)
        .pipe(hb({debug: DEBUG_HBS})
            .partials(PATH.base + PATH.template.partials)
            .helpers(PATH.base + PATH.template.helpers)
            .data(PATH.base + PATH.template.data)
        )
        .pipe(rename({extname: PATH.template.ext}))
        .pipe(gulp.dest(PATH.base + PATH.template.dist));    
}


/** 
 * --------------------------------------------------
 * 핸들바 테스트 
 * https://cloudfour.com/thinks/the-hidden-power-of-handlebars-partials/
 */


 gulp.task('handlebars', function () {
    return gulp.src(PATH.base + './src/**/*.hbs')
        .pipe(hb({debug: true})
            .partials('./src/assets/partials/**/*.hbs')
            .partials({
                layout: '{{#*inline \"nav\"}} My Nav {{/inline}}',
                far: 'ㄻㄻㄻㄹ'
            })            
            .helpers('./src/assets/helpers/*.js')
            .helpers({
                bold: function(person) {
                    return person.id + " " + person.name;
                },
                list: function(items, options) {
                    var out = "<ul>";
                  
                    // for(var i=0, l=items.length; i<l; i++) {
                    //   out = out + "<li>" + options.fn(items[i]) + "</li>";
                    // }
                    out = out + "<li>" + options.fn(items) + "</li>";
                    return out + "</ul>";
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
        )
        .pipe(gulp.dest('./web'));
});


module.exports = {
    setPath: function(basePath, distPath) {
        PATH.base   = basePath ? basePath: PATH.base;
        PATH.dist   = distPath ? distPath: PATH.dist;
    },
    getConfig: function() {
        return CONFIG;
    },
    setConfig: function(config) {
        CONFIG = config;
    }
};