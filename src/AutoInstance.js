
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
var rm              = require('gulp-rm');

//#####################################
// AutoInstance
function AutoInstance(basePath, TemplateClass) {
    AutoBase.call(this, basePath, TemplateClass);    
    
    // 오버라이딩
    this.AUTO_TYPE = 'I';
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
        this._load_mod.bind(this), 
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
