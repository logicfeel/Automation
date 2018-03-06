'use strict';

var util            = require('util');
var gulp            = require('gulp');  // gulp 4.0 기준
var DefaultRegistry = require('undertaker-registry');
var gutil           = require("gulp-util");
var rename          = require('gulp-rename');
var clean           = require('gulp-clean');
var fs              = require('fs');
var sortJSON        = require('gulp-json-sort').default;
var lazypipe        = require('lazypipe');
var replace         = require("gulp-replace");
var concat          = require('gulp-concat'); 
var through         = require('through2');
var groupConcat     = require('gulp-group-concat');
var hb              = require('gulp-hb');


function AutoBase() {
    DefaultRegistry.call(this);

    this.CFG = null;
    this.PKG = null;
    this.PATH = {
        base: '',
        nodes: 'node_modules/',
        module: '../**/@mod*/',
        i_module: '../**/@instance/'
    };
}
util.inherits(AutoBase, DefaultRegistry);

// 전역 속성
AutoBase.prototype.ERR_LEVEL = 0;

AutoBase.prototype.LOG = {
    silent: true,      // gulp 로그 비활성화
    notresult: false,   // 설치 모듈/파일 정보 (마지막)
    debug: true,       // 디버깅시 상세 콘솔 로그 표시
    sub: false          // 서브 모듈 여부
};

AutoBase.prototype.FILE = {
    CFG: 'auto_module.json',
    PKG: 'package.json',
    MAP: 'installemap.json',
    GULP: 'gulpfile.js'
};

/**
 * undertaker-registry 태스크 등록
 * @param {*} gulpInst gulp 공유
 */
AutoBase.prototype.init = function(gulpInst) {
    if (this.LOG.debug) console.log('AutoBase.prototype.init');

    gulpInst.task('reset', gulpInst.series(this.reset, this._reset_dist));

    // 추상 태스크
    gulpInst.task('update', gulpInst.series(this.update));
    
    // 추상 태스크
    gulpInst.task('preinstall', gulpInst.series(this.preinstall));
    
    // 추상 태스크
    gulpInst.task('install', gulpInst.series(this.install));
    
    // 추상 태스크
    gulpInst.task('default', gulpInst.series(this.default));
};


/**
 * 오버라이딩  overriding
 * @param {*} name 테스트명
 * @param {*} fn 호출 함수, 내부 연결 함수, 또는 사용자 주입 함수
 */
AutoBase.prototype.set  =function set(name, fn) {
    var task = this._tasks[name] = fn.bind(this);
    return task;
};


AutoBase.prototype.reset = function(cb) {
  if (this.LOG.debug) console.log('AutoBase.prototype.reset');
  
  return gulp.src(this.PATH.base + '.' + this.FILE.CFG)
    .pipe(rename(this.FILE.CFG))
    .pipe(gulp.dest(this.PATH.base + './'));
};


AutoBase.prototype._reset_dist = function(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._reset_dist');

    return gulp.src([this.PATH.base + this.PATH.dist, this.PATH.base + this.PATH.map], {read: false, allowEmpty :  true})
        .pipe(clean());
};


AutoBase.prototype._save_cfg = function(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._save_cfg');

    // TODO: gulp 사용 안하는 방식으로 변경
    fs.writeFileSync(this.FILE.CFG, JSON.stringify(CONFIG));
        
    return gulp.src(PATH.base + this.FILE.CFG)
        .pipe(sortJSON({ space: 2 }))
        .pipe(gulp.dest(PATH.base + './'));
};


AutoBase.prototype.update = function(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype.update');
    // TODO: 에러 처리 예외 추가
    return cb();
};

AutoBase.prototype.preinstall = function(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype.preinstall');
    // TODO: 에러 처리 예외 추가
    return cb();
};

AutoBase.prototype.install = function(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype.install');
    // TODO: 에러 처리 예외 추가
    return cb();
};

AutoBase.prototype.default = function(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype.default');
    // TODO: 에러 처리 예외 추가
    return cb();
};


//#####################################
// AutoInstance
function AutoInstance() {
    AutoBase.call(this);    
    
    // 오버라이딩
    this.PATH['dist'] = 'install/';
    this.PATH['map'] = 'map/';
}
util.inherits(AutoInstance, AutoBase);


AutoInstance.prototype.init = function(gulpInst) {
    AutoBase.prototype.init.call(this, gulpInst);
    if (this.LOG.debug) console.log('AutoInstance.prototype.init');

    gulpInst.task('update', gulpInst.series(this.reset, this._reset_dist));

    gulpInst.task('reset_all', gulpInst.series(this.reset, this._reset_dist));

    gulpInst.task('reset_sub', gulpInst.series(this.reset, this._reset_dist));

    // 오버라이딩
    gulpInst.task('preinstall', gulpInst.series(this.preinstall));
    
    // 오버라이딩
    gulpInst.task('install', gulpInst.series(this.install));
    
    // 오버라이딩
    gulpInst.task('default', gulpInst.series(this.update, this.preinstall, this.install));
};



AutoInstance.prototype.update = function update(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.update');
    return cb();
};


AutoInstance.prototype.reset_all = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.reset_all');
    return cb();
};


AutoInstance.prototype.reset_sub = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.reset_sub');
    return cb();
};


// 오버라이딩
AutoInstance.prototype.default = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.default');
    return cb();
};

// 오버라이딩
AutoInstance.prototype.preinstall = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.preinstall');
    return cb();
};

// 오버라이딩
AutoInstance.prototype.install = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.install');
    return cb();
};



AutoInstance.prototype._load_cfg = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._load_cfg');
    return cb();
};


AutoInstance.prototype._update_check = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._update_check');
    return cb();
};


AutoInstance.prototype._update_build = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._update_build');
    return cb();
};


AutoInstance.prototype._preinstall_submodule = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule');
    return cb();
};


AutoInstance.prototype._preinstall_submodule_m = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule_m');
    return cb();
};


AutoInstance.prototype._preinstall_submodule_i = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule_i');
    return cb();
};


AutoInstance.prototype._install_imodule = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._install_imodule');
    return cb();
};


AutoInstance.prototype._install_submodule = function(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._install_submodule');
    return cb();
};


//#####################################
// AutoModule
function AutoModule() {
    AutoBase.call(this);

    // 오버라이딩
    this.PATH['dist'] = 'dist/';
    this.PATH['templage'] = {
        ext: ".sql",                    // 기본 변환 확장자    // TODO: 확장자는 제거 형태로.. abc.asp.hbs => abc.asp
        dist: "publish/",               // 템플릿 배포 폴더 template_overlap = true 기본폴더로 지정(덮어씀)
        src: "src/**/*.hbs",            // TODO: 기본 구조 변경에 따른 tempate  폴더 삽입
        partials: "template/part/*.hbs",  // partical명 : 파일명
        helpers: "template/*.js",       // helper(메소드)명 : export 객체명
        data: "template/*.json"         // data명 : 파일명.객체명  TODO: data/ 폴더 명 사용 불필요 할듯 이미 구분됨
    };
}
util.inherits(AutoModule, AutoBase);


AutoModule.prototype.init = function(gulpInst) {
    AutoBase.prototype.init.call(this, gulpInst);
    if (this.LOG.debug) console.log('AutoModule.prototype.init');

    gulpInst.task('template', gulpInst.series(this._load_cfg, this._template_hbs));
    gulpInst.task('default', gulpInst.series(this.preinstall, this.install, this.template));
};


AutoModule.prototype.template = function(cb) {
    if (this.LOG.debug) console.log('AutoModule.prototype.template');
    return cb();
};


AutoModule.prototype._load_cfg = function(cb) {
    if (this.LOG.debug) console.log('AutoModule.prototype._load_cfg');

    var setup;

    // 설정객체가 없는 경우
    if (!CONFIG) {
        setup = fs.readFileSync(this.PATH.base + CONFIG_FILE);
        CONFIG = JSON.parse(setup);
    }

    return cb();
};


AutoModule.prototype._template_hbs = function(cb) {
    if (this.LOG.debug) console.log('AutoModule.prototype._template_hbs');

    var _dist = this.PATH.template.dist;

    if (this.CFG.options.template_overlap) _dist = this.PATH.dist;

    return gulp.src(this.PATH.base + this.PATH.template.src)
        .pipe(hb({debug: DEBUG_HBS})
            .partials(this.PATH.base + this.PATH.template.partials)
            .helpers(this.PATH.base + this.PATH.template.helpers)
            .data(this.PATH.base + this.PATH.template.data)
            .data(this.PATH.base + 'package.json')               // 패키지 정보
        )
        .pipe(rename({extname: this.PATH.template.ext}))
        .pipe(gulp.dest(this.PATH.base + _dist));
};


AutoModule.prototype.pipe_cfg_replace = function(cb) {
    if (this.LOG.debug) console.log('AutoModule.prototype.pipe_cfg_replace');
    return cb();
};


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
AutoModule.prototype.prefixNameBuild = function(fullName, prefix, suffix, obj, replacement, flag) {

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
};


//#####################################
// AutoModModel
function AutoModModel() {
    AutoModule.call(this);
    
    this.PATH['src'] = 'src/**/*.sql';

    this.FILE_GROUP = {
        'ALL.sql': "src/**/*.sql",
        'U.sql': "src/*+(Table|U)/*.sql",
        'VW.sql': "src/*VW/*.sql",
        'FN.sql': "src/*FN/*.sql",
        'TF.sql': "src/*TF/*.sql",
        'TR.sql': "src/*TR/*.sql",
        'SP.sql': "src/*SP/*.sql",
        'ETC.sql': "src/*ETC/*.sql"
    };

    this.REG_EXP = {
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
}
util.inherits(AutoModModel, AutoModule);


AutoModModel.prototype.init = function(gulpInst) {
    AutoModule.prototype.init.call(this, gulpInst);
    if (this.LOG.debug) console.log('AutoModModel.prototype.init');

    gulpInst.task('preinstall', gulpInst.series(this._load_cfg, this.__preinstall_cfg_build, this._save_cfg));
    gulpInst.task('install', gulpInst.series(this._load_cfg, this._install_group, this._install_unit, this._template_hbs));
};


AutoModModel.prototype.preinstall = function(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.preinstall');
    
    return cb();
};


AutoModModel.prototype.install = function(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.install');
    
    return cb();
};

// 내부 클래스
/** 
 * --------------------------------------------------
 * install 공통
 * ! 파이프 파일을 통합하기 전에 이용
 */
AutoModModel.prototype.pipe_install_common = function() {
    return lazypipe()
        // DDL 명령 (create, alter)
        .pipe(replace, this.REG_EXP.DDL_COMMAND, function(match, p1, offset, string) {
            if (this.CFG.options.ddl_create) {
                match = match.replace(p1, 'CREATE');
            }
            return match;
        })
        // DDL 구문 (객체명)
        .pipe(replace, this.REG_EXP.DDL_ALL, function(match, p1, p2, p3, p4, offset, string) {
            var _match;

            _match = this.prefixNameBuild(match, p1, p2, p3, this.CFG.obj_name, this.CFG.options.obj_type);
            
            if (this.CFG.prefix_name.length > 0 ||  this.CFG.suffix_name.length > 0) {
                _match = _match.replace(p4, this.CFG.prefix_name + p4 + this.CFG.suffix_name);
            }
            return _match;
        })
        // DML 구문 (프로시저)
        .pipe(replace, this.REG_EXP.DML_SP, function(match, p1, p2, p3, p4, offset, string) {
            var _index = null;
            var _targetName = '';
            var _match = '';

            // _replace에서 타겟명 변경 안된것 처리
            if (this.CFG.prefix_name.length > 0 ||  this.CFG.suffix_name.length > 0) {
                _targetName = this.CFG.prefix_name + p4 + this.CFG.suffix_name;
                _match = match.replace(p4, _targetName);
            } else {
                _match = match;
            }

            if (this.CFG.options.obj_fnc_type === 0) return _match;     // 유지 이후 처리 안함

            this.CFG._replace.some(function(value, index, arr){
                if (value.string === match) {
                    _index = index;
                    return true;
                }
            });

            if (_index != null) {
                return this.CFG._replace[_index].replacement;
            } else {
                return _match;
            }
        })
        // DML 구문 (스칼라, 테이블)
        .pipe(replace, this.REG_EXP.DML_FN, function(match, p1, p2, p3, p4, p5, offset, string) {
            var _match;
            var _index = null;

            if (this.CFG.options.obj_fnc_type === 0) return match;     // 유지 이후 처리 안함

            if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION' ||
                p1.toUpperCase().trim() === 'REFERENCES') {
                return  match;
            } else {
                this.CFG._replace.some(function(value, index, arr){
                    if (value.string === match) {
                        _index = index;
                        return true;
                    }
                });
                if (_index != null) _match = this.CFG._replace[_index].replacement;    
            }
            return _match;
        })
        // USE [객체명]
        .pipe(replace, this.REG_EXP.USE_OBJ_NAME, function(match, p1, p2, offset, string) {
            var _match;

            if (this.CFG.clear.use) return '';

            // 객체명 있는 경우 교체함
            _match = this.prefixNameBuild(match, null, p1, p2, this.CFG.obj_name, 3); 
            return _match;
        })
        // 주석 /** **/ 
        .pipe(replace, this.REG_EXP.COMMENT, function(match, p1, offset, string) {
            
            if (this.CFG.clear.comment) return '';
            return match;
        })
        // 첫 빈줄 제거
        .pipe(replace, this.REG_EXP.FIST_SPACE, '')    
        // 마지막 빈줄 제거
        .pipe(replace, this.REG_EXP.LAST_SPACE, '')
        // 정규표현 : 마지막 GO
        .pipe(replace, this.REG_EXP.LAST_GO, function(match, p1, offset, string) {
            if (this.CFG.options.last_go && match.trim() != 'GO') return match + '\n\nGO--Auto\n\n';
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
                    this.CFG.replace.forEach(function(value, index, arr) {
                        
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
}

AutoModModel.prototype.__preinstall_cfg_build = function(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.__preinstall_cfg_build');

    this.CFG._replace = [];
    this.CFG.distPath = this.PATH.dist;

    return gulp.src(this.PATH.base + this.PATH.src)
        .pipe(replace(this.REG_EXP.DML_SP, function(match, p1, p2, p3, p4, offset, string) {
                var objData = {};
                var _match;
                
                // 제외 조건 : 유지 + 객체 없음
                if (this.CFG.options.obj_fnc_type === 1 && typeof p3 === 'undefined') return match;
                // 제외 조건 : 있을때만 교체 + 객체 없음
                if (this.CFG.options.obj_fnc_type === 3 && typeof p3 === 'undefined') return match;

                _match = this.prefixNameBuild(match, p1, p2, p3, this.CFG.obj_name, this.CFG.options.obj_fnc_type);

                if (this.CFG.prefix_name.length > 0 ||  this.CFG.suffix_name.length > 0) {
                    _match = _match.replace(p4, this.CFG.prefix_name + p4 + this.CFG.suffix_name);
                }
        
                objData = {
                    src: this.file.relative,
                    string: match,
                    replacement: _match
                };
                this.CFG._replace.push(objData);
                return match;
            })
        )
        .pipe(replace(this.REG_EXP.DML_FN, function(match, p1, p2, p3, p4, p5, offset, string) {
                var objData = {};
                var _match;

                if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION' ||
                    p1.toUpperCase().trim() === 'REFERENCES') {
                    return  match;
                }

                //  this.CFG.options.obj_fnc_type (* fn은 있을 경우만 교체)
                _match = this.prefixNameBuild(match, p2, p3, p4, this.CFG.obj_name, this.CFG.options.obj_fnc_type);
                
                if (this.CFG.prefix_name.length > 0 ||  this.CFG.suffix_name.length > 0) {
                    _match = _match.replace(p5, this.CFG.prefix_name + p5 + this.CFG.suffix_name);
                }

                objData = {
                    src: this.file.relative,
                    string: match,
                    replacement: _match
                };
                this.CFG._replace.push(objData);

                return match;
            })
        );    
};


AutoModModel.prototype._install_group = function(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype._install_group');

    if (!this.CFG.options.intall_group)  return cb();

    return gulp.src(this.PATH.base + this.PATH.src)
        .pipe(_install_common())
        .pipe(groupConcat(FILE_GROUP))          // REVEIW: 이전에 gulp.dest 하면 없어짐
        .pipe(gulp.dest(this.PATH.base + this.PATH.dist));
};


AutoModModel.prototype._install_unit = function(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype._install_unit');

    if (!this.CFG.options.intall_unit) return cb();

    return gulp.src(this.PATH.base + this.PATH.src)
        .pipe(_install_common())
        .pipe(gulp.dest(this.PATH.base + this.PATH.dist));    
};


//#####################################
// 테스트
var a = new AutoBase();
var b = new AutoInstance();
var c = new AutoModule();
var d = new AutoModModel();


module.exports.AutoBase = AutoBase;
module.exports.AutoInstance = AutoInstance;
module.exports.AutoModule = AutoModule;
module.exports.AutoModModel = AutoModModel;

// 등록
// gulp.registry(a);
// gulp.registry(b);
// gulp.registry(c);
// gulp.registry(d);

// b._reset_dist();
// b.init();
// c.template();

// 테스크 실행
// gulp.series('default')();
// gulp.series('install')();
// gulp.series('template')();

// gulp.series(b._reset_dist)();
// b.init.call(this);
//  gulp.task('default', function(cb){cb();});
//  gulp.task('default', b.init);
// console.log('End');