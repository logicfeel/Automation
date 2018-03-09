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
var deepmerge       = require('deepmerge');
var writeJsonFile   = require('write-json-file');
var glob            = require('glob'); 


function AutoBase(basePath, autoType) {
    DefaultRegistry.call(this);

    this.PATH = {
        base: basePath ? basePath.replace(/\\/g,'/') + '/' : '',
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
    this.set_cfg(this.PATH.base + this.FILE.CFG);
    this.set_pkg(this.PATH.base + this.FILE.PKG);
    // this.PKG = AutoBase.prototype.load_pkg(this.PATH.base + this.FILE.PKG);
    
    this.AUTO_TYPE = autoType;
    this.MOD = null;  // 하위(종속) 자동모듈
}
util.inherits(AutoBase, DefaultRegistry);


// 전역 속성
AutoBase.prototype.ERR_LEVEL = 0;
AutoBase.prototype.I_MOD_IGNORE = 0;

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


// AutoBase.prototype.load_cfg = function load_cfg() {
//     if (this.LOG.debug) console.log('AutoModule.prototype._load_cfg');

//     var setup;

//     // 설정객체가 없는 경우
//     try {
//         if (!this.CFG) {
//             setup = fs.readFileSync(this.PATH.base + this.FILE.CFG);
//             this.CFG = JSON.parse(setup);
//         }
//     } catch(err) {
//         gulpError('error 설정/패키리 읽기 실패 :' + this.FILE.CFG, 'load-config');
//     }   
//     return cb();
// };


AutoBase.prototype._reset_dist = function _reset_dist(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._reset_dist');

    return gulp.src([this.PATH.base + this.PATH.dist, this.PATH.base + this.PATH.map], {read: false, allowEmpty :  true})
        .pipe(clean());
};


AutoBase.prototype._save_cfg = function _save_cfg(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._save_cfg');

    writeJsonFile.sync(this.PATH.base + this.FILE.CFG, this.CFG);

    return cb();
    // TODO: gulp 사용 안하는 방식으로 변경
    // fs.writeFileSync(this.FILE.CFG, JSON.stringify(this.CFG));
        
    // return gulp.src(this.PATH.base + this.FILE.CFG)
    //     .pipe(sortJSON({ space: 2 }))
    //     .pipe(gulp.dest(this.PATH.base + './'));
};


AutoBase.prototype.set_pkg = function(path) {
    this.PKG = this.load(path);
};


AutoBase.prototype.set_cfg = function(path) {
    this.CFG = this.load(path);
};


AutoBase.prototype.load = function(path) {
    
    var obj;

    try {
        obj = JSON.parse(fs.readFileSync(path));
        if (!obj) {
            console.log('___error file 없음: '+ path + '___');
            throw new Error("에러!");
        }
    } catch(err) {
        gulpError('error 설정/패키지 읽기 실패 :' + err);
    }

    return obj;    
};


// TODO: 이부분 제거 가능 상위에 삽입
AutoBase.prototype.setTaskPrefix  = function(name) {
    if (name.length > 0 ) this.PREFIX_NM = name + ':';
};


//#####################################
// AutoInstance
function AutoInstance(basePath) {
    AutoBase.call(this, basePath, 'I');    
    
    // 오버라이딩
    this.PATH['dist'] = 'install/';
    this.PATH['map'] = 'map/';
}
util.inherits(AutoInstance, AutoBase);


AutoInstance.prototype.init = function(gulpInst) {
    AutoBase.prototype.init.call(this, gulpInst);
    if (this.LOG.debug) console.log('AutoInstance.prototype.init');

    // 로딩테스트 후 주석 해제
    // gulpInst.task(this.PREFIX_NM + 'update', gulpInst.series(this.subLoad.bind(this)));
    // gulpInst.task(this.PREFIX_NM + 'update', gulpInst.series(this._load_cfg.bind(this), this._load_mod.bind(this), this._update_check.bind(this), this._update_build.bind(this), this._save_cfg.bind(this)));
    gulpInst.task(this.PREFIX_NM + 'update', gulpInst.series(this._load_mod.bind(this), this._update_check.bind(this), this._update_build.bind(this), this._save_cfg.bind(this)));

    gulpInst.task(this.PREFIX_NM + 'reset_all', gulpInst.series(this.reset.bind(this), this._reset_dist.bind(this)));

    gulpInst.task(this.PREFIX_NM + 'reset_sub', gulpInst.series(this.reset.bind(this), this._reset_dist.bind(this)));

    gulpInst.task(this.PREFIX_NM + 'preinstall', gulpInst.series(this._load_mod.bind(this), this._preinstall_submodule_m.bind(this), this._preinstall_submodule_i.bind(this), this._preinstall_build.bind(this), this._save_cfg.bind(this)));
    
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
    var modName = '@mod-c/mn_menu';
    var sub        = require(modName);
    // var sub        = require('./node_modules/@mod-c/mn_menu/');
    // var sub        = require('@mod-c/mn_menu');    
    var relativePath = path.relative(process.cwd(), path.dirname(require.resolve(modName)));
    var i = new sub.AutoClass(relativePath);

    // i.PATH.base = './node_modules/@mod-c/mn_menu/';
    

    i.setTaskPrefix(modName);
    gulp.registry(i);

    // gulp.registry(sub.obj);
    // gulp.series('template')();
    
    // i.PATH.base = './node_modules/@mod-c/mn_menu/';
    // sub.series('template')();
    // sub.obj.setTaskPrefix('mn_menu');
    // gulp.registry(sub.obj);
    
    // gulp.registry(i);
    

    // sub.runTask('mn_menu:template');
    gulp.series(modName + ':template')(); 

    // var modName = '@mod-c/mn_menu';
    // // delete require.cache(modName)
    // var mod = require(modName);
    // var mod = require('node_modules/' + modName);
    
    // var relativePath = path.relative(process.cwd(), path.dirname(require.resolve(modName)));

    // var auto = new mod.AutoClass(/* base 넘김 */);
    // gulp.registry(auto);

    // // sub.runTask('mn_menu:template');
    // gulp.series('mn_menu:template')();


    
    return cb();
};


AutoInstance.prototype._load_mod = function _load_mod(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._load_mod');

    var _mod = [];
    var _modName;

    // if (this.LOG.debug) console.log('___loading '+ this.FILE.PKG + '___');

    // 설정객체가 없는 경우
    // REVIEW: 없을 때만 로딩인시 시점 확인
    
    // try {
    //     // 설정 로딩
    //     if (!this.CFG) {
    //         this.CFG = JSON.parse(fs.readFileSync(this.PATH.base + this.FILE.CFG));
    //     }
        
    //     // // 패키지 로딩
    //     // if(!this.PKG) {
    //     //     this.PKG = JSON.parse(fs.readFileSync(this.PATH.base + this.FILE.PKG));
    //     //     if (!this.PKG) {
    //     //         console.log('___error file 없음: '+ this.FILE.PKG + '___');
    //     //         throw new Error("에러!");
    //     //     }
    //     // }
    // } catch(err) {
    //     gulpError('error 설정/패키지 읽기 실패 :' + err);
    // }    
    
    // 설치 모듈 로딩 : 경로
    this.MOD = {};

    var _relativePath;
    var _sub;
    var _instance;

    for (var _prop in this.PKG.dependencies) {

        _sub            = require(_prop);
        // 검사 후 로딩 
        /**
         * 검사를 어떻게 할것인가?
         * 1. 인스턴스 조회 
         *      - 생성해야 하므로 부하가 추가됨
         *    
         * 2. 클래스 명칭 정의 조회  <== 이것으로 처리
         */
        if (_sub.AutoClass) {
            _relativePath   = path.relative(process.cwd(), path.dirname(require.resolve(_prop)));
            _instance = new _sub.AutoClass(_relativePath);
            
            // 하위 인스턴스 무시
            if (this.I_MOD_IGNORE && _instance instanceof AutoInstance) break;
            
            _instance.setTaskPrefix(_prop);
            this.MOD[_prop] = _instance;
            gulp.registry(_instance);
        }
    }
    return cb();
};


AutoInstance.prototype._update_check = function _update_check(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._update_check');
    
    var _prop;

    // 패키지 기준 모듈 검사
    for (_prop in this.PKG.dependencies) {

        try {
            require.resolve(_prop); // 모듈 설치 여부 검사
            // _stat = fs.statSync(_path);
        } catch(err) {
            gulpError('error 모듈이 설치되지 않았음 (package 기준) :' + _prop, 'update-check');
        }
    }
    
    // 설정 기준 모듈 검사
    for (_prop in this.CFG.modules) {

        try {
            require.resolve(_prop); // 모듈 설치 여부 검사
        } catch(err) {
            gulpError('error 모듈이 설치되지 않았음 (config 기준) :' + _prop, 'update-check');
        }
    }
    
    return cb();
};


AutoInstance.prototype._update_build = function _update_build(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._update_build');

    var _prop;
    // var _config = {};
    var b_pkg;
    var b_conf;
    var _modCfg;

    // TODO: 반복 부분 공통화 처리 필요
    for (var _prop in this.MOD) {

        if(this.PKG.dependencies[_prop]) b_pkg = true;
        else b_pkg = false;
        
        if(this.CFG.modules[_prop]) b_conf = true;
        else b_conf = false;


        // 설정에 추가 (병합)
        if (b_pkg && !b_conf) {
            try {
                _modCfg = this.MOD[_prop].CFG;

                if ( this.MOD[_prop].AUTO_TYPE === 'M') {
                    _modCfg = deepmerge(_modCfg, this.CFG.public, { arrayMerge: overwriteMerge });
                }
                
                this.CFG.modules[_prop] = _modCfg;
                
                // 하위 모듈 설정에 등록
                this.MOD[_prop].CFG = _modCfg;      
                // gulp.series(this.MOD[_prop]._save_cfg.bind(this.MOD[_prop]));
                // gulp.series(this._save_cfg.bind(this.MOD[_prop]));
                this.MOD[_prop]._save_cfg(cb);
                

            } catch(err) {
                gulpError('error 읽기/쓰기 실패 :' + _prop, 'update-build');
            }            
        }
        
        // 설정에서 제거
        if (!b_pkg && b_conf) {
            delete this.CFG.modules[_prop];
        }
    }

    // 콜백 함수
    function overwriteMerge(destinationArray, sourceArray, options) {
        return sourceArray
    }

    return cb();
};


AutoInstance.prototype._preinstall_submodule = function _preinstall_submodule(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule');
    return cb();
};


AutoInstance.prototype._preinstall_submodule_m = function _preinstall_submodule_m(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule_m');
    
    var _prop;
    var _this = this;
    var _mod;
    
    for (_prop in this.CFG.modules) {
        _mod = this.MOD[_prop];
        if (this.MOD[_prop].AUTO_TYPE === 'M') {

            gulp.series(_prop + ':default')(); 

            // gulp.series(_prop + ':default', function(cb) {
            //     console.log('a' + _prop);
            //     _this.CFG[_prop] = _mod.CFG;
            // })();

            // 처리후 설정을 저장하는 로직
            _this.CFG[_prop] = _mod.CFG;
        }
    }
    return function(cb) {
            console.log('a' + _prop);
            // _this.CFG[_prop] = _mod.CFG;
            return cb();
        }
    // return cb();
};


AutoInstance.prototype._preinstall_submodule_i = function _preinstall_submodule_i(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule_i');

    var _prop;
    
    for (_prop in this.CFG.modules) {
        if (this.MOD[_prop].AUTO_TYPE === 'I') {
            gulp.series(_prop + ':preinstall')(); 
        }
    }

    return cb();
};

AutoInstance.prototype._preinstall_build = function _preinstall_build(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_build');

    var _prop;
    var _mod;
    var _install;
    var _distPath;
    var _arrDist;
    var _dir;

    for (var _prop in this.MOD) {


        // 일반모듈 일 경우
        if (this.MOD[_prop].AUTO_TYPE === 'M') {
            
            _mod = this.MOD[_prop];
            // glob 의 형식 : 전체 파일
            _dir = _mod.PATH.base;
            _distPath = _dir + '/' + _mod.PATH.dist + '/**/*.*';
            _arrDist = glob.sync(_distPath);

            // _install = new InstallPath(_arrDist, 'dist', 'install', 'node_modules/module_m');
            _install = new InstallPath(_arrDist, _mod.PATH.dist, this.PATH.dist, _dir);
            _mod.CFG['_install'] = _install.getObject();
        }

        this.CFG.modules[_prop] = _mod.CFG;
    }

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
function AutoModule(basePath) {
    AutoBase.call(this, basePath, 'M');

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

    // gulpInst.task(this.PREFIX_NM + 'template', gulpInst.series(this._load_cfg.bind(this), this._template_hbs.bind(this)));
    gulpInst.task(this.PREFIX_NM + 'template', gulpInst.series(this._template_hbs.bind(this)));
    
};


AutoModule.prototype.template = function template(cb) {
    if (this.LOG.debug) console.log('AutoModule.prototype.template');
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
function AutoModModel(basePath) {
    AutoModule.call(this, basePath);
    
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

    // gulpInst.task(this.PREFIX_NM + 'preinstall', gulpInst.series(this._load_cfg.bind(this), this.__preinstall_cfg_build.bind(this), this._save_cfg.bind(this)));
    gulpInst.task(this.PREFIX_NM + 'preinstall', gulpInst.series(this.__preinstall_cfg_build.bind(this), this._save_cfg.bind(this)));

    // gulpInst.task(this.PREFIX_NM + 'install', gulpInst.series(this._load_cfg.bind(this), this._install_group.bind(this), this._install_unit.bind(this), this._template_hbs.bind(this)));
    gulpInst.task(this.PREFIX_NM + 'install', gulpInst.series(this._install_group.bind(this), this._install_unit.bind(this), this._template_hbs.bind(this)));
    
    gulpInst.task(this.PREFIX_NM + 'default', gulpInst.series(this.PREFIX_NM + 'preinstall', this.PREFIX_NM + 'install'));
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
    
    _this.CFG["_replace"] = [];
    _this.CFG.distPath = this.PATH.dist;

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
                _this.CFG["_replace"].push(objData);
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
                _this.CFG["_replace"].push(objData);

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


/**
 * 인스톨 정보(경로) 구성 클래스
 * 
 * InstallPath('node_modules/module_m/dist/ALL.sql', 'dist', 'install', ''node_modules/module_m')
 * InstallPath('[...]', 'dist', 'install', ''node_modules/module_m')
 * @param {*} original  대상 경로 + 파일명 (타입 : Array, String)
 * @param {*} source    경로명
 * @param {*} target    (*선택) 타겟(설치) 경로명
 * @param {*} basePath  (*선택) original 경로에서 제거되는 경로
 */
function InstallPath(original, source, target, basePath, parentInstallPath) {
    
    this.source = source ? this._trimPath(source) : '';
    this.target = target ? this._trimPath(target) : '';
    this.file = {};
    this.path = [];
    this._parent = parentInstallPath;
    this.basePath = basePath ? basePath : '';
    
    if (this.basePath.length > 0) {
        this.basePath = basePath.indexOf('\\') > -1 ? basePath.replace(/\\/g, '/') : basePath;
    }

    var _format;
    
    if (original) {
        if (Array.isArray(original)) {
            for (var i = 0; i < original.length; i++) {
                _format = this.pathFormat(original[i]);
                this.add(_format);
            }
        } else {
            _format = this.pathFormat(original);
            this.add(_format);
        }
    }
}
(function() {
    
    // TODO: trimPath 명으로 변경
    InstallPath.prototype._trimPath = function(path) {
        return path.replace('/', '');
    };

    // TODO: dir 깊이 0 이하일 경우 예외 처리?
    InstallPath.prototype.add = function(format) {

        var _sursor;
        var _next;
        var _nextFormat;
        var _install;

        // 1. 현재 위치의 파일일 경우
        if (this.source === format.dirs[0] && format.depth === 1) {
            this.file[format.filename] = '';
        } else {

            if (format.depth < 1) {
                gulpError('하위 폴더가 없습니다.'); 
            }

            _sursor     = this.contains(format.dirs[1]);
            _next       = this.nextSource(format.path);
            _nextFormat = this.pathFormat(_next.string);

            // 2. 자식중에 위치가 있는 경우 (하위 재귀적 호출)
            if (_sursor > -1) {
                // 찾아서 넣어야함
                this.path[_sursor].add(_nextFormat);

            // 3. 자식에 없는 경우 (신규 생성)
            } else {
                _install = new InstallPath(_next.string, _next.source, _next.source, '', this);
                
                // 4. 자식에 하위가 있는 경우 
                if (_next.depth > 1) {
                    _install.add(_nextFormat);
                }
                
                this.path.push(_install);
            }
        }
    };

    // 자식에 유무 검사
    InstallPath.prototype.contains = function(source) {

        var sursor = -1;

        for (var ii = 0; ii < this.path.length; ii++) {
            if (this._trimPath(this.path[ii].source) === source) sursor = ii;
        }

        return sursor;
    };

    // 다음 폴더 조회 (리턴)
    InstallPath.prototype.nextSource = function(pathStr) {

        var arrPath = pathStr.split('/');
        var nextString;
        var nextPath;

        if (arrPath.length > 0 && arrPath[0] === '') {
            arrPath = arrPath.slice(1);   // 공백일 경우 첫 배열 삭제
        }

        nextString = arrPath.slice(1).join('/');
        nextPath = arrPath.slice(1, 2).toString();
        
        return {
            string: nextString,
            source: nextPath
        };
    };

    // path 포멧 리턴
    InstallPath.prototype.pathFormat = function(pathStr) {

        var _dir;
        
        if (pathStr.indexOf('\\') > -1) {
            pathStr = pathStr.replace(/\\/g, '/');   
        }

        // 기본 경로 제거
        pathStr = pathStr.replace(this.basePath, '');   
        
        
        
        _dir = pathStr.split('/');

        // 공백일 경우 첫 배열 삭제
        if (_dir.length > 0 && _dir[0] === '') {
            _dir = _dir.slice(1);   
        }

        pathStr = _dir.join('/');

        return {
            path: pathStr,
            dirname: path.dirname(pathStr),
            filename: path.basename(pathStr),
            depth: _dir.length - 1,
            dirs: _dir
        };
    };

    // path 포멧 리턴
    InstallPath.prototype.getObject = function() {
        
        var obj     = {};

        for (var prop in this) {
            if (typeof this[prop] !== "function") {

                // path 는 배열 InstallPath 객체 
                if (prop === 'path') {
                    obj[prop] = [];
                    for (var ii = 0; ii < this.path.length; ii++) {
                        obj[prop].push(this.path[ii].getObject());
                    }                
                
                // source 속성
                } else if (prop === 'source') {    
                    // REVIEW : 소스는 동적으로 실제 경로를 가져옴                
                    obj[prop] = this.getSource();   

                // 내부 속성은 제외
                } else if (prop.substr(0,1) != '_') {
                    obj[prop] = this[prop];
                }
            }
        }
        return obj;

    };

    InstallPath.prototype.getSource = function() {
        
        var _source = this.source;

        if (this._parent) {
            _source = this._parent.getSource() + '/' + _source;
        }
        return _source;
    };

    InstallPath.prototype.getTarget = function() {
        
        var _target = this.target;

        if (this._parent) {
            _target = this.rPathTrim(this._parent.getTarget()) + '/' + _target;
        }
        return _target;
    };

    InstallPath.prototype.rPathTrim = function(p_path) {
        
        if (typeof p_path === 'string') {
            if (p_path.charAt(p_path.length - 1) === '/') {
                p_path = p_path.substr(0, p_path.length - 1);
            }
        }
        return p_path;
    };



    InstallPath.prototype.getBasePath = function() {
        
        var _base;

        if (this.basePath) {
            _base = this.basePath;
        } else if (this._parent) {
            _base = this._parent.getBasePath();
        }
        return _base;
    };

    InstallPath.prototype.getInstall = function() {
        
        var arr = [];
        var target;
    
        for (var prop in this) {
            if (typeof this[prop] !== "function") {
 
                // file
                if (prop === 'file') {

                    for (var prop2 in this[prop]) {
                        var obj = {};
                        
                        // REVIEW this.rPathTrim 공통으로 뽑아야 하는지?
                        obj.src = this.rPathTrim(this.getBasePath()) + '/' + this.source + '/' + prop2;
                        target = this[prop][prop2] != '' ? this[prop][prop2] : prop2;
                        obj.dest = this.rPathTrim(this.getTarget()) + '/' + target;
                        arr.push(obj);
                    }
                
                // path
                } else if (prop === 'path') {

                    for (var ii = 0; ii < this.path.length; ii++) {
                        arr = arr.concat(this.path[ii].getInstall());
                    }
                }
            }
        }
        return arr;
    };


    InstallPath.prototype.reset = function() {

        this.source = '';
        this.target = '';
        this.file = {};
        this.path = [];
        this.basePath = '';
        this._parent = null;
    };

    InstallPath.prototype.load = function(obj, parent) {
        
        var _obj;
        var _install;

        if (!(obj instanceof Object)) {
            throw new Error('Object 객체가 아닙니다.');
        }

        if (parent && !(parent instanceof InstallPath)) {
            throw new Error('InstallPath 객체가 아닙니다.');
        }
        // _obj = JSON.parse(JSON.stringify(obj));
        // TODO: 참조 부분 끊게 만들어야 함

        _obj = obj;

        this.source     = _obj.source;
        this.target     = _obj.target;
        this.file       = _obj.file;
        this.basePath  = _obj.basePath;
        this._parent    = parent;

        for (var i = 0; i < _obj.path.length; i++) {
            _install = new InstallPath();
            _install.load(_obj.path[i], this);
            this.path.push(_install);
        }

        return this;
    };

}());


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