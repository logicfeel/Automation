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
var path            = require('path');

function AutoBase() {
    DefaultRegistry.call(this);

    this.PATH = {
        base: '',
        nodes: 'node_modules/',
        module: '../**/@mod*/',
        i_module: '../**/@instance/'
    };
    this.PREFIX_NM = '';
    this.FILE = {
        CFG: 'auto_module.json',
        PKG: 'package.json',
        MAP: 'installemap.json',
        GULP: 'gulpfile.js'
    };
    this.ERR_LEVEL = 1;
    this.CFG = null;
    this.PKG = this.load_PKG(this.PATH.base + this.FILE.PKG);
    this.MOD = null;  // 하위(종속) 자동모듈
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


/**
 * undertaker-registry 태스크 등록
 * @param {*} gulpInst gulp 공유
 */
AutoBase.prototype.init = function(gulpInst) {
    if (this.LOG.debug) console.log('AutoBase.prototype.init');

    gulpInst.task(this.PREFIX_NM + 'reset', gulpInst.series(this.reset.bind(this), this._reset_dist.bind(this)));
};


/**
 * 오버라이딩  overriding
 * 테스크 설정
 * @param {*} name 테스트명
 * @param {*} fn 호출 함수, 내부 연결 함수, 또는 사용자 주입 함수
 */
AutoBase.prototype.set  =function set(name, fn) {
    var task = this._tasks[name] = fn.bind(this);
    return task;
};

/**
 * 오버라이딩
 * 이름으로 태스크 함수 얻기
 * @param {*} name 
 */
AutoBase.prototype.get  =function get(name) {
    var task = this._tasks[name];
    return task;
};


AutoBase.prototype.reset = function reset(cb) {
  if (this.LOG.debug) console.log('AutoBase.prototype.reset');
  
  return gulp.src(this.PATH.base + '.' + this.FILE.CFG)
    .pipe(rename(this.FILE.CFG))
    .pipe(gulp.dest(this.PATH.base + './'));
};


AutoBase.prototype._reset_dist = function _reset_dist(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._reset_dist');

    return gulp.src([this.PATH.base + this.PATH.dist, this.PATH.base + this.PATH.map], {read: false, allowEmpty :  true})
        .pipe(clean());
};


AutoBase.prototype._save_cfg = function _save_cfg(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._save_cfg');

    // TODO: gulp 사용 안하는 방식으로 변경
    fs.writeFileSync(this.FILE.CFG, JSON.stringify(this.CFG));
        
    return gulp.src(this.PATH.base + this.FILE.CFG)
        .pipe(sortJSON({ space: 2 }))
        .pipe(gulp.dest(this.PATH.base + './'));
};

AutoBase.prototype.load_PKG = function(path) {
    
    var pkg;

    try {
        pkg = JSON.parse(fs.readFileSync(path));
        if (!pkg) {
            console.log('___error file 없음: '+ path + '___');
            throw new Error("에러!");
        }
    } catch(err) {
        gulpError('error 설정/패키지 읽기 실패 :' + err);
    }

    return pkg;    
};

AutoBase.prototype.setTaskPrefix  = function(name) {
    if (name.length > 0 ) this.PREFIX_NM = name + ':';
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

    // 테스트 용
    // gulpInst.task(this.PREFIX_NM + 'update', gulpInst.series(this.subLoad.bind(this)));

    // 로딩테스트 후 주석 해제
    gulpInst.task(this.PREFIX_NM + 'update', gulpInst.series(this._load_cfg.bind(this), this._update_check.bind(this), this._update_build.bind(this), this._save_cfg.bind(this)));

    gulpInst.task(this.PREFIX_NM + 'reset_all', gulpInst.series(this.reset.bind(this), this._reset_dist.bind(this)));

    gulpInst.task(this.PREFIX_NM + 'reset_sub', gulpInst.series(this.reset.bind(this), this._reset_dist.bind(this)));

    gulpInst.task(this.PREFIX_NM + 'preinstall', gulpInst.series(this.preinstall.bind(this)));
    
    gulpInst.task(this.PREFIX_NM + 'install', gulpInst.series(this.install.bind(this)));
    
    gulpInst.task(this.PREFIX_NM + 'default', gulpInst.series(this.update.bind(this), this.preinstall.bind(this), this.install.bind(this)));
};



AutoInstance.prototype.update = function update(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.update');
    return cb();
};


AutoInstance.prototype.reset_all = function reset_all(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.reset_all');
    return cb();
};


AutoInstance.prototype.reset_sub = function reset_sub(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.reset_sub');
    return cb();
};



AutoInstance.prototype.default = function (cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.default');
    return cb();
};


AutoInstance.prototype.preinstall = function preinstall(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.preinstall');
    return cb();
};

// 오버라이딩
AutoInstance.prototype.install = function install(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.install');
    return cb();
};

// 테스트 완료 작동함
AutoInstance.prototype.subLoad = function subLoad(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.subLoad');

    // TODO: 하위 호출 방식 테스트
    // var sub        = require('@mod-c/mn_menu');
    // var sub        = require('./node_modules/@mod-c/mn_menu/');
    var sub        = require('@mod-c/mn_menu');    

    // gulp.registry(sub.obj);
    // gulp.series('template')();
    sub.obj.setTaskPrefix('mn_menu');
    sub.obj.PATH.base = './node_modules/@mod-c/mn_menu/';
    // sub.series('template')();

    gulp.registry(sub.obj);

    // sub.runTask('mn_menu:template');
    gulp.series('mn_menu:template')();

    return cb();
};


AutoInstance.prototype._load_cfg = function _load_cfg(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._load_cfg');

    var _mod = [];
    var _modName;

    if (this.LOG.debug) console.log('___loading '+ this.FILE.PKG + '___');

    // 설정객체가 없는 경우
    // REVIEW: 없을 때만 로딩인시 시점 확인
    
    try {
        // 설정 로딩
        if (!this.CFG) {
            this.CFG = JSON.parse(fs.readFileSync(this.PATH.base + this.FILE.CFG));
        }
        
        // // 패키지 로딩
        // if(!this.PKG) {
        //     this.PKG = JSON.parse(fs.readFileSync(this.PATH.base + this.FILE.PKG));
        //     if (!this.PKG) {
        //         console.log('___error file 없음: '+ this.FILE.PKG + '___');
        //         throw new Error("에러!");
        //     }
        // }
    } catch(err) {
        gulpError('error 설정/패키지 읽기 실패 :' + err);
    }    
    
    // 설치 모듈 로딩 : 경로
    this.MOD = {};

    for (var _prop in this.PKG.dependencies) {
        
        var _path;
        var sub;
        
        sub = require(_prop);

        if (sub.obj instanceof AutoBase) {
            
        }
        
        _path = require.resolve(_prop); // 모듈 설치 여부 검사


    }

    for (var _prop in this.PKG.dependencies) {

        var _path;
        var _fullPath;
        var _stat;
        var _relativePath;

        _path = require.resolve(_prop); // 모듈 설치 여부 검사
        _path = path.dirname(_path); // 모듈 설치 여부 검사
        _path = _path.replace(/\\/g,'/');

        // 상대경로 변환
        _relativePath = path.relative(process.cwd(), _path);
        _relativePath = _relativePath.replace(/\\/g,'/'); 

        try {
            _fullPath = _path + '/' + this.FILE.CFG;
            
            _stat = fs.statSync(_fullPath);

            if (_stat.isFile() && _path != '.') {
                this.MOD[_prop] = {
                    path: _relativePath + '/' + this.FILE.CFG,
                    dir: _relativePath,
                    type: 'm'
                };
            }
        } catch(err) {
            // 무시함
        }

        if (!I_MODULE_IGNORE) {
            try {
                _fullPath = _path + '/' + this.FILE.CFG;
                _stat = fs.statSync(_fullPath);
                if (_stat.isFile() && _path != '.') {
                    this.MOD[_prop] = {
                        path: _relativePath + '/' + this.FILE.CFG,
                        dir: _relativePath,
                        type: 'i'
                    };
                }
            } catch(err) {
                // 무시함
            }
        }
    }
    return cb();
};


AutoInstance.prototype._update_check = function _update_check(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._update_check');

    return cb();
};


AutoInstance.prototype._update_build = function _update_build(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._update_build');
    return cb();
};


AutoInstance.prototype._preinstall_submodule = function _preinstall_submodule(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule');
    return cb();
};


AutoInstance.prototype._preinstall_submodule_m = function _preinstall_submodule_m(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule_m');
    return cb();
};


AutoInstance.prototype._preinstall_submodule_i = function _preinstall_submodule_i(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule_i');
    return cb();
};


AutoInstance.prototype._install_imodule = function _install_imodule(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._install_imodule');
    return cb();
};


AutoInstance.prototype._install_submodule = function _install_submodule(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._install_submodule');
    return cb();
};


//#####################################
// AutoModule
function AutoModule() {
    AutoBase.call(this);

    // 오버라이딩
    this.PATH['dist'] = 'dist/';
    this.PATH['template'] = {
        ext: ".sql",                    // 기본 변환 확장자    // TODO: 확장자는 제거 형태로.. abc.asp.hbs => abc.asp
        dist: "publish/",               // 템플릿 배포 폴더 template_overlap = true 기본폴더로 지정(덮어씀)
        src: "src/**/*.hbs",            // TODO: 기본 구조 변경에 따른 tempate  폴더 삽입
        partials: "template/part/*.hbs",  // partical명 : 파일명
        helpers: "template/*.js",       // helper(메소드)명 : export 객체명
        data: "template/*.json"         // data명 : 파일명.객체명  TODO: data/ 폴더 명 사용 불필요 할듯 이미 구분됨
    };
    this.DEBUG_HBS = true;
}
util.inherits(AutoModule, AutoBase);


AutoModule.prototype.init = function(gulpInst) {
    AutoBase.prototype.init.call(this, gulpInst);
    if (this.LOG.debug) console.log('AutoModule.prototype.init');

    gulpInst.task(this.PREFIX_NM + 'template', gulpInst.series(this._load_cfg.bind(this), this._template_hbs.bind(this)));
};


AutoModule.prototype.template = function template(cb) {
    if (this.LOG.debug) console.log('AutoModule.prototype.template');
    return cb();
};


AutoModule.prototype._load_cfg = function _load_cfg(cb) {
    if (this.LOG.debug) console.log('AutoModule.prototype._load_cfg');

    var setup;

    // 설정객체가 없는 경우
    try {
        if (!this.CFG) {
            setup = fs.readFileSync(this.PATH.base + this.FILE.CFG);
            this.CFG = JSON.parse(setup);
        }
    } catch(err) {
        gulpError('error 설정/패키리 읽기 실패 :' + this.FILE.CFG, 'load-config');
    }   
    return cb();
};


AutoModule.prototype._template_hbs = function _template_hbs(cb) {
    if (this.LOG.debug) console.log('AutoModule.prototype._template_hbs');

    var _dist = this.PATH.template.dist;

    // REVEW: 템플릿 구성 방식 바껴서 제거함
    // if (this.CFG.options.template_overlap) _dist = this.PATH.dist;

    return gulp.src(this.PATH.base + this.PATH.template.src)
        .pipe(hb({debug: this.DEBUG_HBS})
            .partials(this.PATH.base + this.PATH.template.partials)
            .helpers(this.PATH.base + this.PATH.template.helpers)
            .data(this.PATH.base + this.PATH.template.data)
            .data(this.PATH.base + 'package.json')               // 패키지 정보
        )
        .pipe(rename({extname: this.PATH.template.ext}))
        .pipe(gulp.dest(this.PATH.base + _dist));
};


AutoModule.prototype.pipe_cfg_replace = function(p_this) {
    
    var _this = p_this;

    return through.obj(function(file, enc, cb) {
        var result;
        var filePath = String(file.relative);
        
        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }else if(file.isBuffer()) {
            result = String(file.contents);
            _this.CFG.replace.forEach(function(value, index, arr) {
                
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

    gulpInst.task(this.PREFIX_NM + 'preinstall', gulpInst.series(this._load_cfg.bind(this), this.__preinstall_cfg_build.bind(this), this._save_cfg.bind(this)));
    
    gulpInst.task(this.PREFIX_NM + 'install', gulpInst.series(this._load_cfg.bind(this), this._install_group.bind(this), this._install_unit.bind(this), this._template_hbs.bind(this)));
    
    gulpInst.task(this.PREFIX_NM + 'default', gulpInst.series(this.PREFIX_NM + 'preinstall', this.PREFIX_NM + 'install', this.PREFIX_NM + 'template'));
};


AutoModModel.prototype.preinstall = function preinstall(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.preinstall');
    
    return cb();
};


AutoModModel.prototype.install = function install(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.install');
    
    return cb();
};

AutoModModel.prototype.default = function (cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.default');
    
    return cb();
};


// 내부 클래스
/** 
 * --------------------------------------------------
 * install 공통
 * ! 파이프 파일을 통합하기 전에 이용
 */
AutoModModel.prototype.pipe_install_common = function pipe_install_common(cb) {
    
    var _this = this;
    var laz = lazypipe()
        // DDL 명령 (create, alter)
        .pipe(replace, this.REG_EXP.DDL_COMMAND, function(match, p1, offset, string) {
            if (_this.CFG.options.ddl_create) {
                match = match.replace(p1, 'CREATE');
            }
            return match;
        })
        // DDL 구문 (객체명)
        .pipe(replace, this.REG_EXP.DDL_ALL, function(match, p1, p2, p3, p4, offset, string) {
            var _match;

            _match = _this.prefixNameBuild(match, p1, p2, p3, _this.CFG.obj_name, _this.CFG.options.obj_type);
            
            if (_this.CFG.prefix_name.length > 0 ||  _this.CFG.suffix_name.length > 0) {
                _match = _match.replace(p4, _this.CFG.prefix_name + p4 + _this.CFG.suffix_name);
            }
            return _match;
        })
        // DML 구문 (프로시저)
        .pipe(replace, this.REG_EXP.DML_SP, function(match, p1, p2, p3, p4, offset, string) {
            var _index = null;
            var _targetName = '';
            var _match = '';

            // _replace에서 타겟명 변경 안된것 처리
            if (_this.CFG.prefix_name.length > 0 ||  _this.CFG.suffix_name.length > 0) {
                _targetName = _this.CFG.prefix_name + p4 + _this.CFG.suffix_name;
                _match = match.replace(p4, _targetName);
            } else {
                _match = match;
            }

            if (_this.CFG.options.obj_fnc_type === 0) return _match;     // 유지 이후 처리 안함

            _this.CFG._replace.some(function(value, index, arr){
                if (value.string === match) {
                    _index = index;
                    return true;
                }
            });

            if (_index != null) {
                return _this.CFG._replace[_index].replacement;
            } else {
                return _match;
            }
        })
        // DML 구문 (스칼라, 테이블)
        .pipe(replace, this.REG_EXP.DML_FN, function(match, p1, p2, p3, p4, p5, offset, string) {
            var _match;
            var _index = null;

            if (_this.CFG.options.obj_fnc_type === 0) return match;     // 유지 이후 처리 안함

            if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION' ||
                p1.toUpperCase().trim() === 'REFERENCES') {
                return  match;
            } else {
                _this.CFG._replace.some(function(value, index, arr){
                    if (value.string === match) {
                        _index = index;
                        return true;
                    }
                });
                if (_index != null) _match = _this.CFG._replace[_index].replacement;    
            }
            return _match;
        })
        // USE [객체명]
        .pipe(replace, this.REG_EXP.USE_OBJ_NAME, function(match, p1, p2, offset, string) {
            var _match;

            if (_this.CFG.clear.use) return '';

            // 객체명 있는 경우 교체함
            _match = _this.prefixNameBuild(match, null, p1, p2, _this.CFG.obj_name, 3); 
            return _match;
        })
        // 주석 /** **/ 
        .pipe(replace, this.REG_EXP.COMMENT, function(match, p1, offset, string) {
            
            if (_this.CFG.clear.comment) return '';
            return match;
        })
        // 첫 빈줄 제거
        .pipe(replace, this.REG_EXP.FIST_SPACE, '')    
        // 마지막 빈줄 제거
        .pipe(replace, this.REG_EXP.LAST_SPACE, '')
        // 정규표현 : 마지막 GO
        .pipe(replace, this.REG_EXP.LAST_GO, function(match, p1, offset, string) {
            if (_this.CFG.options.last_go && match.trim() != 'GO') return match + '\n\nGO--Auto\n\n';
            else return match + '--End\n\n';
        })
        .pipe(this.pipe_cfg_replace, this);

        // return cb();
    return laz();
}

AutoModModel.prototype.__preinstall_cfg_build = function __preinstall_cfg_build(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.__preinstall_cfg_build');
    
    var _this = this;
    
    this.CFG._replace = [];
    this.CFG.distPath = this.PATH.dist;

    return gulp.src(this.PATH.base + this.PATH.src)
        .pipe(replace(this.REG_EXP.DML_SP, function(match, p1, p2, p3, p4, offset, string) {
                var objData = {};
                var _match;

                // 제외 조건 : 유지 + 객체 없음
                if (_this.CFG.options.obj_fnc_type === 1 && typeof p3 === 'undefined') return match;
                // 제외 조건 : 있을때만 교체 + 객체 없음
                if (_this.CFG.options.obj_fnc_type === 3 && typeof p3 === 'undefined') return match;

                _match = _this.prefixNameBuild(match, p1, p2, p3, _this.CFG.obj_name, _this.CFG.options.obj_fnc_type);

                if (_this.CFG.prefix_name.length > 0 ||  _this.CFG.suffix_name.length > 0) {
                    _match = _match.replace(p4, _this.CFG.prefix_name + p4 + _this.CFG.suffix_name);
                }
        
                objData = {
                    src: this.file.relative,
                    string: match,
                    replacement: _match
                };
                _this.CFG._replace.push(objData);
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
                _match = _this.prefixNameBuild(match, p2, p3, p4, _this.CFG.obj_name, _this.CFG.options.obj_fnc_type);
                
                if (_this.CFG.prefix_name.length > 0 ||  _this.CFG.suffix_name.length > 0) {
                    _match = _match.replace(p5, this.CFG.prefix_name + p5 + _this.CFG.suffix_name);
                }

                objData = {
                    src: this.file.relative,
                    string: match,
                    replacement: _match
                };
                _this.CFG._replace.push(objData);

                return match;
            })
        );    
};


AutoModModel.prototype._install_group = function _install_group(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype._install_group');

    var _this = this;

    if (!this.CFG.options.intall_group)  return cb();

    return gulp.src(this.PATH.base + this.PATH.src)
        .pipe(_this.pipe_install_common())
        .pipe(groupConcat(_this.FILE_GROUP))          // REVEIW: 이전에 gulp.dest 하면 없어짐
        .pipe(gulp.dest(_this.PATH.base + _this.PATH.dist));
};


AutoModModel.prototype._install_unit = function _install_unit(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype._install_unit');

    var _this = this;

    if (!this.CFG.options.intall_unit) return cb();

    return gulp.src(this.PATH.base + this.PATH.src)
        // .pipe(_this.pipe_install_common())
        .pipe(gulp.dest(_this.PATH.base + _this.PATH.dist));    
};


/**
 * gulp 오류 출력
 * TODO: 위치 조정
 * @param {*} errName 오류 구분 명칭
 * @param {*} message 오류 메세지
 */
function gulpError(message, errName) {
    // 제사한 오류 출력
    // if (this.ERR_LEVEL === 1) {
    //     throw new gutil.PluginError({
    //         plugin: errName,
    //         message: message
    //     });                
    // } else {
        throw new Error(message);
    // }
}

module.exports.AutoBase = AutoBase;
module.exports.AutoInstance = AutoInstance;
module.exports.AutoModule = AutoModule;
module.exports.AutoModModel = AutoModModel;

//#####################################
// 테스트
// var a = new AutoBase();
// var b = new AutoInstance();
// var c = new AutoModule();
// var d = new AutoModModel();


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
// gulp.series('tempate')();
// gulp.series('reset')();
// gulp.series('preinstall')();


// gulp.series(b._reset_dist)();
// b.init.call(this);
//  gulp.task(this.PREFIX_NM + 'default', function(cb){cb();});
//  gulp.task(this.PREFIX_NM + 'default', b.init);
// console.log('End');