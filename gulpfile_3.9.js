'use strict';
// gulp 3.9 기준

var gulp            = require('gulp'); 
var gulpsync        = require('gulp-sync')(gulp);
var fs              = require('fs');
var sortJSON        = require('gulp-json-sort').default;
var glob            = require('glob'); 
var path            = require('path'); 
var gutil           = require("gulp-util");
var rename          = require('gulp-rename');
var chug            = require('gulp-chug');
var deepmerge       = require('deepmerge');
var writeJsonFile   = require('write-json-file');
var clean           = require('gulp-clean');
var path            = require('path'); 
var argv            = require('minimist')(process.argv.slice(2));

// #########################################################
// 전역 변수

var MODULE_VISION   = "1.0.0";
var MODULE_NAME     = "gulp_module_m";

// 디버깅용
// *0: default, 1: init, 2: init-all, 3: update, 4:preinstall, 5:install
var DEFUALT_TASK = 1;  

// 로그 레벨
var LOG = {
    silent: true,      // gulp 로그 비활성화
    notresult: false,   // 설치 모듈/파일 정보 (마지막)
    debug: false,       // 디버깅시 상세 콘솔 로그 표시
    sub: false,         // 서브 모듈 여부
};

// 에러 레벨
// 0: 상세, 1: 요약
var ERR_LEVEL       = 0;        


// gulp_module.json 로딩 객체
var CONFIG          = null;
var PACKAGE         = null;
var MODULES         = null;


var I_MODULE_IGNORE = false;    // (*기본값) 인스턴스 모듈 제외
// TODO: i 모듈의 preinstall 무시 하는 옵션을 넣어야함
// 설정에 넣어야 맞을듯

// var I_MODULE_IGNORE = true;     // 인스턴스 모듈 제외

var CONFIG_FILE     = 'gulp_i_module.json';   // 설정 파일명
var PACKAGE_FILE    = 'package.json';
var SOURCEMAP_FILE  = 'installemap.json';
var MODULE_FILE     = 'gulp_module.json';
var I_MODULE_FILE   = 'gulp_i_module.json';


// 기본 경로 (필수)
var PATH = {
    base: "",
    nodes: "node_modules/",
    // modules: "node_modules/**/gulp_module.json", // 성능 이슈 있음 TODO:
    // i_modules: "node_modules/**/gulp_i_module.json",
    modules: "../**/gulp_module.json", // 성능 이슈 있음 TODO: 현재와 하위 기준임
    i_modules: "../**/gulp_i_module.json",
    dist: "install/",
    map: "map/"
};

var ARGS = [];

// 아규먼트 전달 설정
if (argv.silent) LOG.silent = true;
if (argv.notresult) LOG.notresult = true;
if (argv.debug) LOG.debug = true;
if (argv.sub) LOG.sub = true;

ARGS.push('--sub');
ARGS.push('--notresult');

if (LOG.debug) ARGS.push('--debug');
if (LOG.silent) ARGS.push('--silent');


// ##################################################
// task 목록

/** 
 * --------------------------------------------------
 * default 태스크
 */
switch (DEFUALT_TASK) {
    case 1: 
        gulp.task('default', ['init']);
        break;
    case 2: 
        gulp.task('default', ['init-all']);
        break;
    case 3: 
        gulp.task('default', ['update']);
        break;
    case 4: 
        gulp.task('default', ['preinstall']);
        break;
    case 5: 
        gulp.task('default', ['install']);
        break;
    default:
    gulp.task('default', gulpsync.sync(['update', 'preinstall', 'install']));
        break;
}

/** 
 * --------------------------------------------------
 * init 태스크
 * i 모듈은 현재 폴더에서만 수행 가능함
 */
gulp.task('init', ['clean-dist'], function() {
    return gulp.src(PATH.base + '.' + CONFIG_FILE)
        .pipe(rename(CONFIG_FILE))
        .pipe(gulp.dest(PATH.base + './'));    
});

/**
 * --------------------------------------------------
 * clean-dist
 * dist, map 폴더 제거
 */
gulp.task('clean-dist', function() {
    return gulp.src([PATH.base + PATH.dist, PATH.base + PATH.map], {read: false})
      .pipe(clean());
});


/** 
 * --------------------------------------------------
 * init 전체 최기화 (현재/하위)
 */
gulp.task('init-all', ['init', 'init-sub']);


/** 
 * --------------------------------------------------
 * init 하위 태스크 초기화
 */
gulp.task('init-sub', ['load-config'], function() {

    var _prop;
    var _arrSrc = [];

    for (_prop in CONFIG.modules) {
        _arrSrc.push( MODULES[_prop].dir + '/gulpfile.js');
    }


    return gulp.src(_arrSrc)
        .pipe(chug(
            {
                tasks: ['init'],
                args: ARGS      
            },
            function(a) {
                if (LOG_FLAG) console.log('독립실행 MODULE / I Module ..init OK');
            })
        );
});



/** 
 * --------------------------------------------------
 * update 태스크
 * > 대상 모듈 : 
 * TODO:
 *  - 패키지에서 모듈중에서 .gulp_i_module.json 또는 .gulp_module.json 목록 추출
 *      + 모듈 
 *      + 모듈 실행
 */
gulp.task('update', gulpsync.sync(['load-config', 'update-check', 'update-build', 'save-config']), function() {

});


/** 
 * --------------------------------------------------
 * 모듈 검사
 */
gulp.task('update-check', function() {
    
    var _prop;
    var _stat;
    var _path;

    // 패키지 기준 모듈 검사
    for (_prop in PACKAGE.dependencies) {

        try {
            require.resolve(_prop); // 모듈 설치 여부 검사
            // _stat = fs.statSync(_path);
        } catch(err) {
            gulpError('error 모듈이 설치되지 않았음 (package 기준) :' + _prop, 'update-check');
        }
    }
    
    // 설정 기준 모듈 검사
    for (_prop in CONFIG.modules) {

        try {
            require.resolve(_prop); // 모듈 설치 여부 검사
        } catch(err) {
            gulpError('error 모듈이 설치되지 않았음 (config 기준) :' + _prop, 'update-check');
        }
    }
});


/** 
 * --------------------------------------------------
 * update remove + add 처리
 */
gulp.task('update-build', function() {

    var _prop;
    var _dep;    
    var _config = {};
    var _mod = '';
    var b_pkg;
    var b_conf;
    var _mod;

    // TODO: 반복 부분 공통화 처리 필요
    for (var _prop in MODULES) {

        if(PACKAGE.dependencies[_prop]) b_pkg = true;
        else b_pkg = false;
        
        if(CONFIG.modules[_prop]) b_conf = true;
        else b_conf = false;

        function overwriteMerge(destinationArray, sourceArray, options) {
            return sourceArray
        }
        // 설정에 추가 (병합)
        if (b_pkg && !b_conf) {
            try {
                
                _mod = JSON.parse(fs.readFileSync(PATH.base + MODULES[_prop].path));
                if (MODULES[_prop].type === 'm') {
                    _mod = deepmerge(_mod, CONFIG.public, { arrayMerge: overwriteMerge });
                }
                
                CONFIG.modules[_prop] = _mod;
                writeJsonFile.sync(PATH.base + MODULES[_prop].path, _mod);

            } catch(err) {
                gulpError('error 읽기/쓰기 실패 :' + _prop, 'update-build');
            }            
        }
        
        // 설정에서 제거
        if (!b_pkg && b_conf) {
            delete CONFIG.modules[_prop];
        }
    }
});


/**
 * --------------------------------------------------
 * preinstall 태스크
 * 
 */
gulp.task('preinstall', gulpsync.sync(['load-config', 'preinstall-submodule', 'preinstall-build', 'save-config']), function() {
    
});


/** 
 * --------------------------------------------------
 * 하위 preinstall 실행
 * !병렬처리
 * 모듈 => default task 처리
 * i모듈 => preinstall task 처리
 * 
 */
gulp.task('preinstall-submodule', gulpsync.sync(['preinstall-submodule-m', 'preinstall-submodule-i']));


gulp.task('preinstall-submodule-m', function() {
    if (LOG.debug) console.log('____ preinstall-submodule  _m____');

    var _prop;
    var _arrSrc = [];

    for (_prop in CONFIG.modules) {
        if (MODULES[_prop].type === 'm') {
            _arrSrc.push( MODULES[_prop].dir + '/gulpfile.js');
        }
    }

    return gulp.src(_arrSrc)
        .pipe(chug(
            {
                tasks: ['default'],
                args: ARGS
            }, 
            function() {
                if (LOG.debug) console.log('독립실행 MODULE.. OK');
            })
        );
});

gulp.task('preinstall-submodule-i', function() {
    if (LOG.debug) console.log('____ preinstall-submodule  _i__');

    var _prop;
    var _arrSrc = [];

    if (!I_MODULE_IGNORE) {
        for (_prop in CONFIG.modules) {
            if (MODULES[_prop].type === 'i') {
                _arrSrc.push( MODULES[_prop].dir + '/gulpfile.js');
            }
        }
    
        return gulp.src(_arrSrc)
            .pipe(chug(
                {
                    tasks: ['preinstall'],
                    args: ARGS
                }, 
                function() {
                    if (LOG.debug) console.log('독립실행 I_MODULE.. preinstall  OK');
                })
            );
    }
});


/** 
 * --------------------------------------------------
 * preinstall 후 설정 가져와 구성
 * 
 */
gulp.task('preinstall-build', function() {

    var _prop;
    var _mod;
    var _install;
    var _distPath;
    var _arrDist;
    var _dir;

    for (var _prop in MODULES) {

        try {
           _mod = JSON.parse(fs.readFileSync(PATH.base + MODULES[_prop].path));
        } catch(err) {
            gulpError('error 모듈 읽기 실패 :' + _prop, 'preinstall-build');
        }

        // 일반모듈 일 경우
        if (MODULES[_prop].type === 'm') {
            
            // glob 의 형식 : 전체 파일
            _dir = MODULES[_prop].dir
            _distPath = _dir + '/' + _mod.distPath + '/**/*.*';
            _arrDist = glob.sync(_distPath);

            // _install = new InstallPath(_arrDist, 'dist', 'install', 'node_modules/module_m');
            _install = new InstallPath(_arrDist, _mod.distPath, PATH.dist, _dir);
            _mod['_install'] = _install.getObject();
        }

        CONFIG.modules[_prop] = _mod;
    }
});


/** 
 * --------------------------------------------------
 * install 태스크
 * 1. 설정 로딩
 * 2. i모듈 : install 수행  TODO: 이후 추가해야함
 * 3. 모듈 : 로딩 후 설치 (설치는 한개의 폴더 뒤에만)
 * 4. 각 모듈별 dist 경로 로딩 (소스맵)
 * 5. 모듈 배포 install
 */
gulp.task('install', gulpsync.sync(['load-config', 'install-imodule', 'install-submodule', 'save-config']), function() {

});


/** 
 * --------------------------------------------------
 * install-submodule 하위 모듈 설치
 * 
 */
gulp.task('install-imodule', function() {

    var _prop;
    var _arrSrc = [];
    
    if (!I_MODULE_IGNORE) {
        for (_prop in CONFIG.modules) {
            if (MODULES[_prop].type === 'i') {
                _arrSrc.push( MODULES[_prop].dir + '/gulpfile.js');
            }
        }
    
        return gulp.src(_arrSrc)
            .pipe(chug(
                {
                    tasks: ['install'],
                    args: ARGS
                },
                function() {
                    if (LOG.debug) console.log('독립실행 I_MODULE..install OK');
                })
            );
    }

});


/** 
 * --------------------------------------------------
 * install-submodule 하위 모듈 설치
 * 
 */
gulp.task('install-submodule', function() {

    var _prop;
    var install;
    var arr = [];
    var _path;
    var SOURCEMAP = {};

    CONFIG._overlap = {
        module: [],
        file: []
    };

    function copyDest(arr, mod) {
        // 설치 모듈 목록
        if (LOG.debug || (!LOG.notresult && !LOG.sub)) {
            console.log(gutil.colors.green('설치 모듈 : '+ mod));
        }

        arr.forEach(function(value, index, array) {

            var data;

            try {
                data = fs.readFileSync(value.src, 'utf8');
            } catch(err) {
                gulpError('파일읽기 실패 :' + value.src);
            }

            try {
                fs.mkdirSync(path.dirname(value.dest));
            } catch(err) {
                if (err && err.code != 'EEXIST') {
                    gulpError('디렉토리 생성 실패 (중복제외) :' + value.src + err);
                }
            }

            try {
                fs.writeFileSync(value.dest, data);
                var cursorPath = process.cwd().replace(/\\/g,'/');
                
                if (LOG.debug || (!LOG.notresult && !LOG.sub)) {
                    console.log(gutil.colors.blue('설치 성공 : ') + value.src.replace(cursorPath, '') 
                        + gutil.colors.blue(' >> ') + value.dest
                    );
                    // console.log(gutil.colors.blue('설치 성공 ^.^ => ') + value.src);
                }
                
            } catch(err) {
                gulpError('파일 복사 실패 :' + value.src + err);
            }
            
        });        
    }

    for ( _prop in CONFIG.modules) {
        
        var mod_map;

        // 조건 모듈
        if (MODULES[_prop].type === 'm') {
            
            // _installObj = ;
            install = new InstallPath();
            install.load(CONFIG.modules[_prop]._install);
            arr = install.getInstall();

            SOURCEMAP[_prop] = arr;
             
            copyDest(arr, _prop);

        } else if (MODULES[_prop].type === 'i' && !I_MODULE_IGNORE) {
            var _sourcemapTemp;

            // !인터페이스 경로임 
            try {
                _sourcemapTemp = JSON.parse(fs.readFileSync(PATH.base + MODULES[_prop].dir + '/' + PATH.map + SOURCEMAP_FILE));
            } catch(err) {
                gulpError('error i모듈 설치맵 읽기 실패 :' + _prop, 'install-submodule');
            }

            // 상위 경로 추가함
            for (var __prop in _sourcemapTemp) {
                
                _sourcemapTemp[__prop].forEach(function(v, i, a) {
                    v.src = v.src.replace('../', PATH.nodes);
                });

                
                SOURCEMAP[_prop + '/' + __prop] = _sourcemapTemp[__prop];
                
                copyDest(_sourcemapTemp[__prop], _prop + '/' + __prop);
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
                
                //if (CONFIG._overlap.module _prop2)
                var _findModule;
                _findModule = CONFIG._overlap.module.find(function(__value, __index, __array) {
                    return __value[0] === _prop;
                });
                
                if (_findModule) {
                    _findModule.push(_prop2);
                } else {
                    CONFIG._overlap.module.push([_prop, _prop2]);
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

                _findFile = CONFIG._overlap.file.find(function(__value, __index, __array) {
                    return value.dest === __value.string;
                });

                if (_findFile) {
                    _findFile.modules.push(_prop);

                } else {
                    var _file = {
                        string: value.dest,
                        modules: [findDest.mod, _prop], // 기존모듈명, 중복모듈명
                    };
                    CONFIG._overlap.file.push(_file);
                }

            // 임시 스택에 저장 (비교시 이용)
            } else {
                destTemp.push({dest: value.dest, mod: _prop});
            }
        });
    } 

    // 소스맵 파일 저장
    writeJsonFile.sync(PATH.map + SOURCEMAP_FILE, SOURCEMAP);
});


/** 
 * --------------------------------------------------
 * 설정 로딩
 */
gulp.task('load-config', function() {
    var _mod = [];
    var _modName;

    if (LOG.debug) console.log('___loading '+ CONFIG_FILE + '___');

    // 설정객체가 없는 경우
    // REVIEW: 없을 때만 로딩인시 시점 확인
    
    try {
        // 설정 로딩
        if (!CONFIG) {
            CONFIG = JSON.parse(fs.readFileSync(PATH.base + CONFIG_FILE));
        }
        
        // 패키지 로딩
        if(!PACKAGE) {
            PACKAGE = JSON.parse(fs.readFileSync(PATH.base + PACKAGE_FILE));
            if (!PACKAGE) {
                console.log('___error file 없음: '+ PACKAGE_FILE + '___');
                throw new Error("에러!");
            }
        }
    } catch(err) {
        gulpError('error 설정/패키리 읽기 실패 :' + _prop, 'load-config');
    }    
    
    // 설치 모듈 로딩 : 경로
    MODULES = {};

    for (var _prop in PACKAGE.dependencies) {

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
            _fullPath = _path + '/' + MODULE_FILE;
            
            _stat = fs.statSync(_fullPath);

            if (_stat.isFile() && _path != '.') {
                MODULES[_prop] = {
                    path: _relativePath + '/' + MODULE_FILE,
                    dir: _relativePath,
                    type: 'm'
                };
            }
        } catch(err) {
            // 무시함
        }

        if (!I_MODULE_IGNORE) {
            try {
                _fullPath = _path + '/' + I_MODULE_FILE;
                _stat = fs.statSync(_fullPath);
                if (_stat.isFile() && _path != '.') {
                    MODULES[_prop] = {
                        path: _relativePath + '/' + I_MODULE_FILE,
                        dir: _relativePath,
                        type: 'i'
                    };
                }
            } catch(err) {
                // 무시함
            }
        }
    }
});


/** 
 * --------------------------------------------------
 * 설정 저장
 * !병렬처리
 */
gulp.task('save-config', function() {
    
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(CONFIG));
    } catch(err) {
        gulpError('error 설정 저장 실패 :' + _prop, 'save-config');
    }

    return gulp.src(PATH.base + CONFIG_FILE)
        .pipe(sortJSON({ space: 2 }))
        .pipe(gulp.dest(PATH.base + './'));    
});


// ##################################################
// 공통 함수

/**
 * gulp 오류 출력
 * @param {*} errName 오류 구분 명칭
 * @param {*} message 오류 메세지
 */
function gulpError(message, errName) {
    // 제사한 오류 출력
    if (ERR_LEVEL === 1) {
        throw new gutil.PluginError({
            plugin: errName,
            message: message
        });                
    } else {
        throw new Error(message);
    }
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

if (LOG.debug) console.log('i모듈 gulp');