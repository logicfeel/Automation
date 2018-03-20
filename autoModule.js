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
var mkdirp          = require('mkdirp');
var rm              = require( 'gulp-rm' )

var AutoTempalte    = require('./AutoTemplate').AutoTempalte;
var InstallPath     = require('./InstallPath').InstallPath;

function AutoBase(basePath, TemplateClass) {
    DefaultRegistry.call(this);

    // 기본 경로    
    var _base = basePath ? basePath : this.getDirname();
    
    _base = path.relative(process.cwd(), _base);            // 상대경로 반환
    _base = _base ? _base.replace(/\\/g,'/') + '/' : '';    // 접근 '/' 경로 변경

    // 경로 설정
    this.PATH = {
        base: _base,
        nodes: 'node_modules/',
        // module: '../**/@mod*/',
        // i_module: '../**/@instance/',
        dist: '',                                       // 하위에서 정의
        map: 'map/',
        src: 'src/',
        compile: '@compile/',
        template: 'template/',
        template_part: 'template/parts/',
    };

    // gulp.src(pattern) 에서 사용 패턴 그룹
    this.PATT = {
        src:    '',                                     // 하위에서 정의
        buffer: '**/__*.*',                             // 내부 컴파일에 포함된 파일(파일은 참조용도)
        copy:   '**/@*.*'                               // 외부에서 복사된 파일
    }

    // 템플릿 패턴
    this.PATT_TEMP = {
        ext: '.hbs',                                    // 템플릿 파일 확장자
        dist: 'publish/',                               // 템플릿 배포 폴더 
        src: 'src/**/!(__*)*.hbs',                      // 일반 배치 소스 (__시작하는 파일은 제외)
        srcPub: 'template/!(__*)*.hbs',                 // 템플릿 배포 소스
        partials: 'template/parts/**/!(__*)*.hbs',      // partical명 : 파일명
        helpers: 'template/helpers/!(__*)*.js',         // helper(메소드)명 : export 객체명
        decorators: 'template/decorators/!(__*)*.js',   // decorators(메소드)명 : export 객체명            
        data: 'template/data/*.json'                    // data명 : 파일명.객체명  TODO: data/ 폴더 명 사용 불필요 할듯 이미 구분됨
    };
    
    // 테스크 명 접두사 명칭
    this.PREFIX_NM = '';
    
    // 파일명
    this.FILE = {
        CFG: 'auto_module.json',
        PKG: 'package.json',
        MAP: 'installemap.json',
        GULP: 'gulpfile.js'
    };

    // 로딩 객체
    this.CFG = this.load(this.PATH.base + this.FILE.CFG);
    this.PKG = this.load(this.PATH.base + this.FILE.PKG);
    this.MOD = null;  // 하위(종속) 자동모듈
    
    this.TMP = TemplateClass ? new TemplateClass(this) : null;
    
    if (this instanceof AutoInstance)   this.AUTO_TYPE = 'I';
    if (this instanceof AutoModule)     this.AUTO_TYPE  = 'M';
    
    this.ERR_LEVEL = 1;
}
util.inherits(AutoBase, DefaultRegistry);


// 전역 속성
AutoBase.prototype.ERR_LEVEL = 0;
AutoBase.prototype.I_MOD_IGNORE = 0;

AutoBase.prototype.LOG = {
    silent: true,       // gulp 로그 비활성화
    notresult: false,   // 설치 모듈/파일 정보 (마지막)
    debug: true,        // 디버깅시 상세 콘솔 로그 표시
    sub: false          // 서브 모듈 여부
};


/**
 * undertaker-registry 태스크 등록
 * @param {*} gulpInst gulp 공유
 */
AutoBase.prototype.init = function(gulpInst) {
    if (this.LOG.debug) console.log('AutoBase.prototype.init');
    
    // this.runTask.call(this);
    gulpInst.task(this.PREFIX_NM + 'reset', gulpInst.series(
        this.reset.bind(this), 
        this._reset_dir.bind(this),
        this._reset_del.bind(this)
    ));

    gulpInst.task(this.PREFIX_NM + 'template', gulpInst.series(
        this._load_mod.bind(this), 
        this.template.bind(this),
        this._template_dist.bind(this),
        this._template_publish.bind(this)
    ));

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


// 파일 초기화
AutoBase.prototype.reset = function reset(cb) {
  if (this.LOG.debug) console.log('AutoBase.prototype.reset');
  
  // REVIEW: 기능확인
  reset.description = '초기화 (폴더, 객체)';

  return gulp.src(this.PATH.base + '.' + this.FILE.CFG)
    .pipe(rename(this.FILE.CFG))
    .pipe(gulp.dest(this.PATH.base + './'));
};

// 폴더 초기화
AutoBase.prototype._reset_dir = function _reset_dir(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._reset_dir');

    return gulp.src(
            [
                this.PATH.base + this.PATH.dist, 
                this.PATH.base + this.PATH.map,
                this.PATH.base + this.PATH.src + this.PATH.compile,
                this.PATH.base + this.PATH.template + this.PATH.compile,
                this.PATH.base + this.PATH.template_part + this.PATH.compile
            ], 
            {read: false, allowEmpty :  true})
        .pipe(clean());
};
AutoBase.prototype._reset_del = function _reset_dir(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._reset_dir');

    return gulp.src(
            [
                this.PATH.base + this.PATH.src + this.PATT['buffer'],
                this.PATH.base + this.PATH.src + this.PATT['copy'],
                this.PATH.base + this.PATH.template + this.PATT['buffer'],
                this.PATH.base + this.PATH.template + this.PATT['copy']
            ],
            {read: false})
        .pipe(rm());
};


AutoBase.prototype._save_cfg = function _save_cfg(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._save_cfg');

    writeJsonFile.sync(this.PATH.base + this.FILE.CFG, this.CFG);

    return cb();
};


AutoBase.prototype._load_mod = function _load_mod(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._load_mod');

    var _relativePath;
    var _sub;
    var _instance;

    // 설치 모듈 로딩 : 경로
    this.MOD = {};

    for (var _prop in this.PKG.dependencies) {

        _sub            = require(_prop);
        
        // 검사 후 로딩 
        if (_sub.AutoClass) {
            _relativePath   = path.relative(process.cwd(), path.dirname(require.resolve(_prop)));
            _instance = new _sub.AutoClass(_relativePath);
            
            // 하위 인스턴스 무시
            if (this.I_MOD_IGNORE && _instance instanceof AutoInstance) break;

            // if (typeof _sub.TemplateClass === 'function') {
            //     this.TMP = new _sub.TemplateClass(this);
            // }
           
            _instance.setTaskPrefix(_prop);
            this.MOD[_prop] = _instance;
            
            gulp.registry(_instance);
        }
    }
    return cb();
};


AutoBase.prototype.template = function template(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype.template');
    
    // 템플릿이 지정 되어 있는 경우
    if (this.TMP instanceof AutoTempalte) {
        this.TMP.before_template();
    }

    return cb();
};

AutoBase.prototype._template_publish = function _template_publish(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._template_publish');

    var hbObj = this.getTemplateObj();

    // TODO: 아래 부분이 중복됨
    return gulp.src(this.PATH.base  + this.PATT_TEMP.srcPub)
        .pipe(hb({debug: this.LOG.debug})
            .partials(hbObj.parts)
            .helpers(hbObj.helpers)
            .decorators(hbObj.decorator)
            .data(hbObj.data)
            .data(this.PATH.base + this.FILE.PKG)               // 패키지 정보
            .data(this.PATH.base + this.FILE.CFG)               // 설정 정보 (auto_module.json)
        )
        .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
        .pipe(gulp.dest(this.PATH.base + this.PATT_TEMP.dist)
    );
};



AutoBase.prototype._template_dist = function _template_dist(cb) {
    if (this.LOG.debug) console.log('AutoBase.prototype._template_dist');

    var hbObj = this.getTemplateObj();

    return gulp.src(this.PATH.base  + this.PATT_TEMP.src)
        .pipe(hb({debug: this.LOG.debug})
            .partials(hbObj.parts)
            .helpers(hbObj.helpers)
            .decorators(hbObj.decorator)
            .data(hbObj.data)
            .data(this.PATH.base + this.FILE.PKG)               // 패키지 정보
            .data(this.PATH.base + this.FILE.CFG)               // 설정 정보 (auto_module.json)            
        )
        .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
        .pipe(gulp.dest(this.PATH.base + this.PATH.dist)
    );
};

// TODO: 위치는 변경
AutoBase.prototype.getTemplateObj = function getTemplateObj() {
    
    var i = 0;
    var _parts = {};
    var _helpers = {};
    var _decorator = {};
    var _data = {};
    var _propName = '';

    // gulp-hp 전달 객체 조립 
    for(i = 0 ; this.TMP && i < this.TMP.part.length; i++) {
        _propName = path.basename(this.TMP.part[i].path, this.PATT_TEMP.ext);
        _parts[_propName] = this.TMP.part[i].content.toString();
    }

    // REVEIW: 아래 문법이 무난? 검토 _helpers = this.TMP ? Object.assign({}, this.TMP.helper.slice(0, this.TMP.helper.length - 1)) : {};
    for(i = 0 ; this.TMP && i < this.TMP.helper.length; i++) {
        _helpers = Object.assign(_helpers, this.TMP.helper[i]);
    }

    for(i = 0 ; this.TMP && i < this.TMP.decorator.length; i++) {
        _decorator = Object.assign(_decorator, this.TMP.decorator[i]);
    }

    for(i = 0 ; this.TMP && i < this.TMP.data.length; i++) {
        _data = Object.assign(_data, this.TMP.data[i]);
    }
    return {
        parts: _parts,
        helpers: _helpers,
        decorator: _decorator,
        data: _data
    }
};

// AutoBase.prototype._template_publish = function _template_publish(cb) {
//     if (this.LOG.debug) console.log('AutoBase.prototype._template_publish');
// 
//     // TODO: 아래 부분이 중복됨
//     return gulp.src(this.PATH.base  + this.PATT_TEMP.srcPub)
//         .pipe(hb({debug: this.LOG.debug})
//             .partials(this.PATH.base  + this.PATT_TEMP.partials)
//             .helpers(this.PATH.base + this.PATT_TEMP.helpers)
//             .data(this.PATH.base + this.PATT_TEMP.data)
//             .data(this.PATH.base + this.FILE.PKG)               // 패키지 정보
//         )
//         .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
//         .pipe(gulp.dest(this.PATH.base + this.PATT_TEMP.dist)
//     );
// };

// AutoBase.prototype._template_dist = function _template_dist(cb) {
//     if (this.LOG.debug) console.log('AutoBase.prototype._template_dist');
// 
//     return gulp.src(this.PATH.base  + this.PATT_TEMP.src)
//         .pipe(hb({debug: this.LOG.debug})
//             .partials(this.PATH.base  + this.PATT_TEMP.partials)
//             .helpers(this.PATH.base + this.PATT_TEMP.helpers)
//             .data(this.PATH.base + this.PATT_TEMP.data)
//             .data(this.PATH.base + this.FILE.PKG)               // 패키지 정보
//         )
//         .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
//         .pipe(gulp.dest(this.PATH.base + this.PATH.dist)
//     );
// };


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
function AutoInstance(basePath, TemplateClass) {
    AutoBase.call(this, basePath, TemplateClass);    
    
    // 오버라이딩
    this.PATH['dist'] = 'install/';
    // this.PATH['map'] = 'map/';
}
util.inherits(AutoInstance, AutoBase);


AutoInstance.prototype.init = function(gulpInst) {
    AutoBase.prototype.init.call(this, gulpInst);
    if (this.LOG.debug) console.log('AutoInstance.prototype.init');

    gulpInst.task(this.PREFIX_NM + 'update', gulpInst.series(
        this._load_mod.bind(this), 
        this._update_check.bind(this), 
        this._update_build.bind(this),
        this._save_cfg.bind(this)));

    gulpInst.task(this.PREFIX_NM + 'reset-all', gulpInst.series(
        this._load_mod.bind(this), 
        this.reset_all.bind(this), 
        this.PREFIX_NM + 'reset'));

    gulpInst.task(this.PREFIX_NM + 'reset-sub', gulpInst.series(
        this._load_mod.bind(this), 
        this.reset_sub.bind(this), 
        this.PREFIX_NM + 'reset'));

    gulpInst.task(this.PREFIX_NM + 'preinstall', gulpInst.series(
        this._load_mod.bind(this), 
        this._preinstall_submodule_m.bind(this), 
        this._preinstall_submodule_i.bind(this), 
        this._preinstall_build.bind(this), 
        this._save_cfg.bind(this)));

    gulpInst.task(this.PREFIX_NM + 'template-all', gulpInst.series(
        // this._load_mod.bind(this), 
        this.PREFIX_NM + 'template',
        this._template_submodule_i.bind(this), 
        this._template_submodule_m.bind(this), 
        this._save_cfg.bind(this)));
        
    gulpInst.task(this.PREFIX_NM + 'install', gulpInst.series(
        this._load_mod.bind(this), 
        this._install_submodule_i.bind(this), 
        this._install_submodule_m.bind(this), 
        this._save_cfg.bind(this)));
    
    gulpInst.task(this.PREFIX_NM + 'default', gulpInst.series(
        this.default.bind(this), 
        this.PREFIX_NM + 'update', 
        this.PREFIX_NM + 'preinstall', 
        this.PREFIX_NM + 'template-all', 
        this.PREFIX_NM + 'install'));
};



AutoInstance.prototype.update = function update(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.update');
    return cb();
};


AutoInstance.prototype.reset_all = function reset_all(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.reset_all');

    var _prop;
    var _arrTask = [];
    
    for (_prop in this.CFG.modules) {
        if (this.MOD[_prop].AUTO_TYPE === 'I') {
            _arrTask.push(_prop + ':reset-all');
        } else {
            _arrTask.push(_prop + ':reset');
        }
    }

    gulp.series(_arrTask, function sub(sub_cb){
        sub_cb();
        cb();
    })();
};


AutoInstance.prototype.reset_sub = function reset_sub(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.reset_sub');

    var _prop;
    var _arrTask = [];
    
    for (_prop in this.CFG.modules) {
        _arrTask.push(_prop + ':reset');
    }

    gulp.series(_arrTask, function sub(sub_cb){
        sub_cb();
        cb();
    })();
};


AutoInstance.prototype.default = function (cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype.default');
    
    // 템플릿이 지정 되어 있는 경우
    if (this.TMP instanceof AutoTempalte) {
        this.TMP.init();
    }

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
                // this.MOD[_prop].CFG = _modCfg;      
                // 복사 방식에서 참조 방식으로 변경
                this.MOD[_prop].CFG = this.CFG.modules[_prop];

                // gulp.series(this.MOD[_prop]._save_cfg.bind(this.MOD[_prop]));
                // gulp.series(this._save_cfg.bind(this.MOD[_prop]));
                // REVEIW: 여러 모듈 로딩시 넘어가지 않는지 테스트/확인
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
    var _arrTask = [];

    for (_prop in this.CFG.modules) {
        if (this.MOD[_prop].AUTO_TYPE === 'M') {
            _arrTask.push(_prop + ':preinstall');
            _arrTask.push(_prop + ':install');
        }
    }

    // 이런식으로 처리해도 됨
    // gulp.series(_this.abstract_task.bind(this), _prop + ':default', function end(_cb){
    gulp.series(_arrTask, function sub(sub_cb){
        sub_cb();
        cb();
    })();
};


AutoInstance.prototype._preinstall_submodule_i = function _preinstall_submodule_i(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._preinstall_submodule_i');

    var _prop;
    var _arrTask = [];
    
    for (_prop in this.CFG.modules) {
        if (this.MOD[_prop].AUTO_TYPE === 'I') {
            _arrTask.push(_prop + ':preinstall');
        }
    }

    gulp.series(_arrTask, function sub(sub_cb){
        sub_cb();
        cb();
    })();
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


// AutoInstance.prototype._template = function _template(cb) {
//     if (this.LOG.debug) console.log('AutoInstance.prototype._template');
//     return cb();
// };


AutoInstance.prototype._template_submodule_i = function _template_submodule_i(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._template_submodule_i');
    
    var _prop;
    var _arrTask = [];

    for (_prop in this.CFG.modules) {
        if (this.MOD[_prop].AUTO_TYPE === 'I') {

            _arrTask.push(_prop + ':template-all');
        }
    }

    // 이런식으로 처리해도 됨
    // gulp.series(_this.abstract_task.bind(this), _prop + ':default', function end(_cb){
    gulp.series(_arrTask, function sub(sub_cb){
        sub_cb();
        cb();
    })();
};


AutoInstance.prototype._template_submodule_m = function _template_submodule_m(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._template_submodule_m');

    var _prop;
    var _arrTask = [];
    
    for (_prop in this.CFG.modules) {
        if (this.MOD[_prop].AUTO_TYPE === 'M') {

            _arrTask.push(_prop + ':template');
        }
    }

    gulp.series(_arrTask, function sub(sub_cb){
        sub_cb();
        cb();
    })();
};


AutoInstance.prototype._install_submodule_i = function _install_submodule_i(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._install_submodule_i');

    var _prop;
    var _arrTask = [];
    
    for (_prop in this.CFG.modules) {
        if (this.MOD[_prop].AUTO_TYPE === 'I') {
            // _arrTask.push(_prop + ':preinstall');
            _arrTask.push(_prop + ':install');
        }
    }

    gulp.series(_arrTask, function sub(sub_cb){
        sub_cb();
        cb();
    })();
};


AutoInstance.prototype._install_submodule_m = function _install_submodule_m(cb) {
    if (this.LOG.debug) console.log('AutoInstance.prototype._install_submodule_m');

    var _prop;
    var install;
    var arr = [];
    var SOURCEMAP = {};

    // 중복 파일 초기화
    this.CFG._overlap = {
        module: [],
        file: []
    };

    for ( _prop in this.CFG.modules) {

        // 조건 모듈
        if (this.MOD[_prop].AUTO_TYPE === 'M') {
            
            // _installObj = ;
            install = new InstallPath();
            install.load(this.CFG.modules[_prop]._install);
            arr = install.getInstall();

            SOURCEMAP[_prop] = arr;
             
            this.copyDest(arr, _prop);

        } else if (this.MOD[_prop].AUTO_TYPE === 'I' && !this.I_MOD_IGNORE) {
            var _sourcemapTemp;

            // !인터페이스 경로임 
            try {
                _sourcemapTemp = JSON.parse(fs.readFileSync(this.PATH.base + this.MOD[_prop].PATH.base + '/' + this.PATH.map + this.FILE.MAP));
            } catch(err) {
                gulpError('error i모듈 설치맵 읽기 실패 :' + _prop, 'install-submodule');
            }

            // 상위 경로 추가함
            for (var __prop in _sourcemapTemp) {
                
                _sourcemapTemp[__prop].forEach(function(v, i, a) {
                    v.src = v.src.replace('../', this.PATH['nodes']);
                });
                
                SOURCEMAP[_prop + '/' + __prop] = _sourcemapTemp[__prop];
                
                this.copyDest(_sourcemapTemp[__prop], _prop + '/' + __prop);
            }
        }
    }


    /**
     * 중복 모듈 찾기
     */
     // 경로 + 모둘명  => 모듈명만 추출
     function getModName(modName) {
        var _n = modName.split('/');
        return _n[_n.length - 1];
    }

    for (_prop in SOURCEMAP) {
        for (var _prop2 in SOURCEMAP) {
            if (_prop === getModName(_prop2) && _prop != _prop2) {
                
                //if (this.CFG._overlap.module _prop2)
                var _findModule;
                _findModule = this.CFG._overlap.module.find(function(__value, __index, __array) {
                    return __value[0] === _prop;
                });
                
                if (_findModule) {
                    _findModule.push(_prop2);
                } else {
                    this.CFG._overlap.module.push([_prop, _prop2]);
                }
            }
        }
    }

    /**
     * 중복 파일 찾기
     * REVIEW: 로직을 좀 깔끔한게 정리 필요 .. 작동은 됨
     */
    var destTemp = [];
    var findDest;

    for (_prop in SOURCEMAP) {
        SOURCEMAP[_prop].forEach(function(value, index, array) {
            
            findDest = destTemp.find(function(_v, _i, _a) {
                return value.dest === _v.dest;
            })
            
            // 중복된 경우
            if (findDest) {

                var _findFile;

                _findFile = this.CFG._overlap.file.find(function(__value, __index, __array) {
                    return value.dest === __value.string;
                });

                if (_findFile) {
                    _findFile.modules.push(_prop);

                } else {
                    var _file = {
                        string: value.dest,
                        modules: [findDest.mod, _prop], // 기존모듈명, 중복모듈명
                    };
                    this.CFG._overlap.file.push(_file);
                }

            // 임시 스택에 저장 (비교시 이용)
            } else {
                destTemp.push({dest: value.dest, mod: _prop});
            }
        });
    } 

    // 소스맵 파일 저장
    writeJsonFile.sync(this.PATH.map + this.FILE.MAP, SOURCEMAP);

    return cb();
};


AutoInstance.prototype.copyDest = function(arr, mod) {
    // 설치 모듈 목록
    if (this.LOG.debug || (!this.LOG.notresult && !this.LOG.sub)) {
        console.log(gutil.colors.green('설치 모듈 : '+ mod));
    }

    var _this = this;
    var cursorPath;

    arr.forEach(function(value, index, array) {

        fs.readFile(value.src, 'utf8', function(err, data){
            if (err) gulpError('파일읽기 실패 :' + value.src);

            mkdirp(path.dirname(value.dest), function (err) {
                if (err) gulpError('디렉토리 생성 실패 (중복제외) :' + value.src + err);
                
                fs.writeFile(value.dest, data, function(err){
                    if (err) gulpError('파일 복사 실패 :' + value.src + err);
    
                    cursorPath = process.cwd().replace(/\\/g,'/');
                
                    if (_this.LOG.debug || (!_this.LOG.notresult && !_this.LOG.sub)) {
                        console.log(gutil.colors.blue('설치 성공 : ') + value.src.replace(cursorPath, '') 
                            + gutil.colors.blue(' >> ') + value.dest
                        );
                        // console.log(gutil.colors.blue('설치 성공 ^.^ => ') + value.src);
                    }
                });
            });
        });
    });        
};


//#####################################
// AutoModule
function AutoModule(basePath, TemplateClass) {
    AutoBase.call(this, basePath, TemplateClass);

    // 오버라이딩
    this.PATH['dist'] = 'dist/';
}
util.inherits(AutoModule, AutoBase);


AutoModule.prototype.init = function(gulpInst) {
    AutoBase.prototype.init.call(this, gulpInst);
    if (this.LOG.debug) console.log('AutoModule.prototype.init');
    
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
function AutoModModel(basePath, TemplateClass) {
    AutoModule.call(this, basePath, TemplateClass);
    
    this.PATT['src'] = 'src/**/*.sql';

    this.FILE_GROUP = {
        'ALL.sql': this.PATH.base + "src/**/*.sql",
        'U.sql': this.PATH.base + "src/*+(Table|U)/*.sql",
        'VW.sql': this.PATH.base + "src/*VW/*.sql",
        'FN.sql': this.PATH.base + "src/*FN/*.sql",
        'TF.sql': this.PATH.base + "src/*TF/*.sql",
        'TR.sql': this.PATH.base + "src/*TR/*.sql",
        'SP.sql': this.PATH.base + "src/*SP/*.sql",
        'ETC.sql': this.PATH.base + "src/*ETC/*.sql"
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

    gulpInst.task(this.PREFIX_NM + 'preinstall', gulpInst.series(
        this.__preinstall_cfg_build.bind(this), 
        this._save_cfg.bind(this)));
    
    gulpInst.task(this.PREFIX_NM + 'install', gulpInst.series(
        this._install_group.bind(this), 
        this._install_unit.bind(this)
        // , 
        // this._template_dist.bind(this),
        // this._template_publish.bind(this)
    ));
    
    gulpInst.task(this.PREFIX_NM + 'default', gulpInst.series(
        this.PREFIX_NM + 'preinstall', 
        this.PREFIX_NM + 'install',
        this.PREFIX_NM + 'template'
    ));
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
    var commonPipe = lazypipe()
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
    return commonPipe();
}

AutoModModel.prototype.__preinstall_cfg_build = function __preinstall_cfg_build(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.__preinstall_cfg_build');
    
    var _this = this;
    
    _this.CFG['_replace'] = [];
    _this.CFG.distPath = this.PATH.dist;

    return gulp.src(this.PATH.base + this.PATT['src'])
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
                _this.CFG['_replace'].push(objData);

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

    return gulp.src(this.PATH.base + this.PATT['src'])
        .pipe(_this.pipe_install_common())
        .pipe(groupConcat(_this.FILE_GROUP))          // REVEIW: 이전에 gulp.dest 하면 없어짐
        .pipe(gulp.dest(_this.PATH.base + _this.PATH.dist));
};


AutoModModel.prototype._install_unit = function _install_unit(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype._install_unit');

    var _this = this;

    if (!this.CFG.options.intall_unit) return cb();

    return gulp.src(this.PATH.base + this.PATT['src'])
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



// *******************************
// 개발후 클래스 파일로 분리

// var EventEmitter = require('events').EventEmitter;

// function AutoTempalte(tmp) {
//     EventEmitter.call(this);
    
//     // this.TMP = tmp ? tmp : {};
//     this.src
// }

// util.inherits(AutoTempalte, EventEmitter);

// // 추상 메소드
// AutoTempalte.prototype.init = function() {

// };

// // AutoTempalte.prototype._setPropertie = function(pIdx) {
        
// //     var obj = {
// //         get: function() { return this._items[pIdx]; },
// //         set: function(newValue) { this._items[pIdx] = newValue; },
// //         enumerable: true,
// //         configurable: true
// //     };
// //     return obj;        
// // };

// AutoTempalte.prototype.import = function(modName) {
    
//     // TODO: try 예외 추가
//     var mod = require(modName);
    
//     //  return 
// };


// // 사용자 정의 
// AutoTempalte.prototype.getCompilePart = function(filename, targetPath) {
    
//     var _this = this;
    
//     mkdirp(targetPath, function (err) {
//         if (err) gulpError('디렉토리 생성 실패 (중복제외) :' + value.src + err);
        
//         _this._compilePart(filename, targetPath);
//     });
// };

// AutoTempalte.prototype._compilePart = function(filename, targetPath) {
    
//     return gulp.src(this.dirname + 'parts/' + filename)
//         .pipe(hb({debug: true})
//             .partials(this.dirname + 'parts/**/*.hbs')
//             .helpers(this.dirname + '*.js')
//             // .data(this.TMP)               // 패키지 정보
//             .data(this.dirname + '*.json')
//         )
//         .pipe(gulp.dest(targetPath));

// };


// module.exports.AutoTempalte = AutoTempalte;

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

// b._reset_dir();
// b.init();
// c.template();

// 테스크 실행
// gulp.series('default')();
// gulp.series('install')();
// gulp.series('tempate')();
// gulp.series('reset')();
// gulp.series('preinstall')();


// gulp.series(b._reset_dir)();
// b.init.call(this);
//  gulp.task(this.PREFIX_NM + 'default', function(cb){cb();});
//  gulp.task(this.PREFIX_NM + 'default', b.init);
// console.log('End');