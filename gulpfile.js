'use strict';
// gulp 3.9 기준

var gulp        = require('gulp'); 
// require('gulp-submodule')(gulp);

var gulpsync    = require('gulp-sync')(gulp);
var fs          = require('fs');
var sortJSON    = require('gulp-json-sort').default;
var glob        = require('glob'); 

var path        = require('path'); 

var gutil = require("gulp-util");
var rename      = require('gulp-rename');

var chug = require('gulp-chug');
var deepmerge = require('deepmerge');
var writeJsonFile = require('write-json-file');

// var group = require('gulp-group-files');

// var mod = gulp.submodule('modules/M1/');
// var mod = gulp.submodule('node_modules/M3/');

// console.log('1.path: ' + mod.getPath());
// var modPath = './modules/M1/';
// mod.setPath(modPath, "install/", "default");



// console.log('Mod returns ' + mod);

// var gulpModule = require('gulp-module');

var path   = require('path'); 

// var nodemodulespath   = require('node-modules-path'); 
// var requiredPath = require('required-path');

// #########################################################
// 전역 변수

var MODULE_VISION   = "1.0.0";
var MODULE_NAME     = "gulp_module_m";

// gulp_module.json 로딩 전역 설정
var CONFIG          = null;
var PACKAGE         = null;
var MODULES         = null;

var LOG_FLAG        = false;     // 로그 표시
var ERR_LEVEL       = 0;         // 에러 레벨 : 0 자세히, 1 간단히    
var I_MODULE_IGNORE = true;      // 인스턴스 모듈 제외

var CONFIG_FILE     = 'gulp_i_module.json';   // 설정 파일명
var PACKAGE_FILE    = 'package.json';

// 기본 경로 (필수)
var PATH = {
    base: "",
    nodes: "node_modules/",
    modules: "node_modules/**/gulp_module.json",
    i_modules: "node_modules/**/gulp_i_module.json",
    dist: "install/",
    map: "map/",
    all_file: ""
};

// ##################################################
// task 목록

/** 
 * --------------------------------------------------
 * default 태스크
 */
// gulp.task('default', function() {});

// 디버깅 시
// gulp.task('default', ['init']);              // 초기화 (설정 파일 초기화, 배치폴더 제거)
// gulp.task('default', ['update']);            // 목록 갱신
// gulp.task('default', ['preinstall']);        // 통합 실행
gulp.task('default', ['install']);           // 배포


// gulp.task('default', ['default2']);            // 임시
// gulp.task('default', ['default3']);            // 임시


/** 
 * --------------------------------------------------
 * init 태스크
 * i 모듈은 현재 폴더에서만 수행 가능함
 */
gulp.task('init', function() {
    return gulp.src(PATH.base + '.' + CONFIG_FILE)
        .pipe(rename(CONFIG_FILE))
        .pipe(gulp.dest(PATH.base + './'));    
});

/**
 * --------------------------------------------------
 * default 태스크
 * dist, map 폴더 제거
 */
gulp.task('clean-dist', function() {
    gulp.src([PATH.base + PATH.dist, PATH.base + PATH.map], {read: false})
      .pipe(clean());
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
    // var _prop;
    // var _setup = getConfig();
    
    // getModules();

    // for(prop in _setup.modules) {

    // }
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
 * install 태스크
 * 1. 설정 로딩
 * 2. i모듈 : install 수행  TODO: 이후 추가해야함
 * 3. 모듈 : 로딩 후 설치 (설치는 한개의 폴더 뒤에만)
 * 4. 각 모듈별 dist 경로 로딩 (소스맵)
 * 5. 모듈 배포 install
 */
gulp.task('install', gulpsync.sync(['load-config', 'install-imodule', 'install-submodule', 'save-config']), function() {
// gulp.task('install', gulpsync.sync(['load-config', 'install-imodule', 'install-group']), function() {

});




/** 
 * --------------------------------------------------
 * install-submodule 하위 모듈 설치
 * 
 */
gulp.task('install-imodule', function() {

});


/** 
 * --------------------------------------------------
 * install-submodule 하위 모듈 설치
 * 
 */
// var scripts = {
//     'modules_M1': [
//         'modules/M1/src/test.1.js',
//         'modules/M1/src/test.2.js',
//     ],
//     'modules_M2':[
//         'modules/M1/src/test.3.js',
//         'modules/M1/src/test.4.js'
//     ]
// };

// gulp.task('install-group',group(scripts, function(name,files){
//     return gulp.src(files)
//             .pipe(gulp.dest("dist/js/"));
// }));

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

    var _installObj;

    var SOURCEMAP = {};

    // var _dirname;
    // var _dist;
    CONFIG._overlap = {
        module: [],
        file: []
    };


    for ( _prop in CONFIG.modules) {
        
        var mod_map;

        if (MODULES[_prop].type === 'm') {
            

            // _installObj = ;
            install = new InstallPath();
            install.load(CONFIG.modules[_prop]._install);
            arr = install.getInstall()

            SOURCEMAP[_prop] = arr;
             
            arr.forEach(function(value, index, array) {

                // TODO: 읽어서 내용중 경로 관련된 부분 경우에 따라 수정 필요
                // TODO: 스트림 타입 이미지 같은것 처리

                // 1. 파일읽기
                fs.readFile(value.src, 'utf8', function(err, data) {
                    if  (err) gulpError('파일 읽기 오류: ' + value.src);

                    // 2. 디렉토리 생성
                    fs.mkdir(path.dirname(value.dest), function(err) {

                        // 중복 에러는 무시함
                        if (err && err.code != 'EEXIST') {
                            gulpError('파일 읽기 오류: ' + value.src);
                        }

                        // 3. 파일 쓰기
                        fs.writeFile(value.dest, data, function(err3) {
                            if (err3) throw err3;
                            console.log('파일 설치 성공 ^.^ => ' + value.src);
                        });                        
                    });

                });
            })
        }

        /**
         * 중복 모듈 찾기
         */
        var mod;

        mod = CONFIG._overlap.module.find(function(value, index, array) {
            return vaule[0] === _prop;
        });

        // TODO: 중복안되면 아무것도 없이 처리
        if (mod) {
            mod.push('TODO:상위주소 '+_prop);
        } else {
            CONFIG._overlap.module.push([_prop]);
        }        
    }

    /**
     * 중복 파일 찾기
     * REVIEW: 로직을 좀 깔끔한게 정리 필요 .. 작동은 됨
     */
    // var arrlist = [];

    var arrIndex = [];

    for (_prop in SOURCEMAP) {
        SOURCEMAP[_prop].forEach(function(value, index, array) {
 
            for(var _prop2 in SOURCEMAP) {
                SOURCEMAP[_prop].forEach(function(_value, _index, _array) {

                    var isOver;
                    isOver = arrIndex.some(function(_v, _i, _a) {
                        return index === _v;
                    });
                    isOver = arrIndex.length === 0 ? false : true;
                    
                    if (value.dest === _value.dest && !isOver) {
                        
                        // 인덱스 제외 키 삽입
                        arrIndex.push(index);

                        // REVIEW: 함수로 분리
                        var _findFile;
                        _findFile = CONFIG._overlap.file.find(function(__value, __index, __array) {
                            return __value.string === __value.string;
                        });

                        if (_findFile) {
                            _findFile.modules.push(_prop);

                        } else {
                            var _file = {
                                string: value.dest,
                                modules: [_prop],
                            };
                            CONFIG._overlap.file.push(_file);
                        }
                    }
                });
            }
        });
    }
     
    console.log('stop');
    // var scripts = {
    //     'modules_M1': [
    //         'modules/M1/src/test.1.js',
    //         'modules/M1/src/test.2.js',
    //     ],
    //     'modules_M2':[
    //         'modules/M1/src/test.3.js',
    //         'modules/M1/src/test.4.js'
    //     ]
    // };

    // for (_prop in scripts) {
    //     gulp.src(scripts[_prop])
    //         .pipe(gulp.dest("group/" + _prop));
    // }

    // group(scripts, function(name,files){
    //     console.log('___loading group___');
    //     return gulp.src(files)
    //             .pipe(gulp.dest("group/" + name));
    // })

    if (LOG_FLAG) console.log('___loading '+ CONFIG_FILE + '___');

    // for ( _prop in CONFIG.modules) {
    //     _dirname = path.dirname(MODULES[_prop].path);
    //     _dist = CONFIG.modules[_prop].distPath;

    //     if (MODULES[_prop].type === 'm') {
    //         gulp.src( _dirname + _dist )
    //             .pipe(gulp.dest(PATH.base + PATH.dist));

    //     } else if (MODULES[_prop].type === 'i' && !I_MODULE_IGNORE) {
    //         // TODO: 
    //     }
    // }    

    /**
     * 조건 :
     * - 소스맵 작동
     * - 중복모듈, 중복 파일 기록
     * - _install 기준으로 설치
     * 
     * 이슈 :
     * - 하위의 i모듈의 경우?
     * 
     * for
     *  모듈 or i모듈
     * 
     * 모듈의 경우
     * 모듈 for
     *      /dist 폴더 하위 src() ?
     *      /파일 목록 추출 : CONFIG._install 기준
     *          소스맵 작동
     *      /
     * 
     */

});


/** 
 * --------------------------------------------------
 * 설정 로딩
 */
gulp.task('load-config', function() {
    var _mod = [];
    var _modName;

    if (LOG_FLAG) console.log('___loading '+ CONFIG_FILE + '___');

    // 설정객체가 없는 경우
    // REVIEW: 없을 때만 로딩인시 시점 확인
    
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
    
    // 설치 모듈 로딩 : 경로
    MODULES = {};

    _mod = glob.sync(PATH.modules);
    _mod.forEach(function(value, index, arr) {
        _modName = value.replace(/node_modules.([^\/]+)(?:\S+)/ig, '$1');
        MODULES[_modName] = {
            path: value,
            type: 'm'
        };
    });

    if (!I_MODULE_IGNORE) {
        _mod = glob.sync(PATH.i_modules);
        _mod.forEach(function(value, index, arr) {
            _modName = value.replace(/node_modules.([^\/]+)(?:\S+)/ig, '$1');
            MODULES[_modName] = {
                path: value,
                type: 'i'
            };
        });
    }
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
        _path = PATH.nodes + _prop + '/' + PACKAGE_FILE;
        try {
            _stat = fs.statSync(PATH.nodes + _prop + '/' + PACKAGE_FILE);
        } catch(err) {
            gulpError('error 모듈이 설치되지 않았음 (package 기준) :' + _prop, 'update-check');
        }

        if (!_stat.isFile()) {
            gulpError('error 모듈이 설치되지 않았음 (package 기준) :' + _prop, 'update-check');
        }
    
    }
    
    // 설정 기준 모듈 검사
    for (_prop in CONFIG.modules) {
        _path = PATH.nodes + _prop + '/' + PACKAGE_FILE;
        try {
            _stat = fs.statSync(PATH.nodes + _prop + '/' + PACKAGE_FILE);
        } catch(err) {
            gulpError(" 에러(파일 읽기) : " + _path, "update-check");
        }

        if (!_stat.isFile()) {
            gulpError(" 에러(파일 없음) : " + _path, "update-check");
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
            _mod = JSON.parse(fs.readFileSync(PATH.base + MODULES[_prop].path));
            if (MODULES[_prop].type === 'm') {
                _mod = deepmerge(_mod, CONFIG.public, { arrayMerge: overwriteMerge });
            }
            
            CONFIG.modules[_prop] = _mod;
            writeJsonFile.sync(PATH.base + MODULES[_prop].path, _mod);
        }
        
        // 설정에서 제거
        if (!b_pkg && b_conf) {
            delete CONFIG.modules[_prop];
        }
    }
});


/** 
 * --------------------------------------------------
 * 설정 저장
 * !병렬처리
 */
gulp.task('save-config', function() {
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(CONFIG));
        
    return gulp.src(PATH.base + CONFIG_FILE)
        .pipe(sortJSON({ space: 2 }))
        .pipe(gulp.dest(PATH.base + './'));    
});


/** 
 * --------------------------------------------------
 * 하위 preinstall 실행
 * !병렬처리
 * 모듈 => default
 * i모듈 => preinstall
 * 
 */
gulp.task('preinstall-submodule', function() {
    if (LOG_FLAG) console.log('____ preinstall-submodule ____');

    var _prop;
    var _dirname;

    for ( _prop in CONFIG.modules) {
        _dirname = path.dirname(MODULES[_prop].path);
        
        if (MODULES[_prop].type === 'm') {
            gulp.src( _dirname + '/gulpfile.js' )
            .pipe(chug({tasks: ['default']}, function() {
                    console.log('LOAD MODULE...' + _prop + ' OK');
                })
            );
        } else if (MODULES[_prop].type === 'i' && !I_MODULE_IGNORE) {
            gulp.src( _dirname + '/gulpfile.js' )
            .pipe(chug({tasks: ['preinstall']}, function() {
                    console.log('LOAD I_MODULE...' + _prop + ' OK');
                })
            );
        }
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

    // 임시
    var _t = glob.sync('node_modules/module_m/dist/**/*.*');    // 전체 파일
    var _t2 = glob.sync('node_modules/module_m/dist/**/');      // 전체 디렉토리
    var _t3 = glob.sync('node_modules/module_m/dist/**');       // 전체 디렉토리 + 파일

    for (var _prop in MODULES) {
        _mod = JSON.parse(fs.readFileSync(PATH.base + MODULES[_prop].path));
        
        // 일반모듈 일 경우
        if (MODULES[_prop].type === 'm') {
            
            // glob 의 형식 : 전체 파일
            _distPath = path.dirname(MODULES[_prop].path) + '/' + _mod.distPath + '/**/*.*';
            _arrDist = glob.sync(_distPath);

            _install = new InstallPath(_arrDist, 'dist', 'install', 'node_modules/module_m');
            _mod['_install'] = _install.getObject();
        }

        CONFIG.modules[_prop] = _mod;
    }

    // test
    var tmp = new InstallPath();
    tmp.load(_install);
    var a = tmp.getInstall();
    var c = tmp.rPathTrim('abcd/');
    var d = tmp.rPathTrim('abcdef');
    console.log('stop');

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
 * 인스톨 경로 객체 제작
 * 샘플
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
    this.basePath = basePath ? basePath : '';
    this._parent = parentInstallPath;

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

            if (format.depth < 1) gulpError('하위 폴더가 없습니다.'); 

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


function getUpateModules(){
    var _return = {};

    _return.modules = _temp.concat(glob.sync(PATH.modules));
    _return.i_modules = _temp.concat(glob.sync(PATH.i_modules));
    return _return;
}


// ###########################################

var aaa = {abc: "aaa"};

function objSearch(obj, name, value){
    var prop;

    for (prop in obj){
        if (typeof obj[prop] === 'object'){
            objSearch(obj[prop], name, value);
        } else {
            if (prop.indexOf(name) > -1 && name.length > 0 ) {
                console.log('name:' + prop);
                console.log('value:' + obj[prop]);
            }
            if (String(obj[prop]).indexOf(value) > -1 && value.length > 0 ) {
                console.log('name:' + prop);
                console.log('value:' + obj[prop]);
            }
        }
    }
}
function getModuleDirName(){
}


// objSearch(process, "M1", "M1");
// objSearch(process, "M1", "");
// objSearch(process, "", "M1");
// objSearch(aaa, "M1", "aa");
// objSearch(require, "M1", "M1");

var load_task = "";
var load_task = "node_modules/M3/:default";

gulp.task('default-set', function() {
    console.log('-default-set');
    load_task = "node_modules/M3/:default";
    // gulp.task('default2', [load_task], function() {
    //     console.log('-default-');
        
    //     console.log('2.path: ' + mod.getPath());
    // });
});
gulp.task('default3', gulpsync.sync(['default-set', 'default2']));

gulp.task('default2', function() {
    console.log('-2-');

    var modPath = './modules/M1/';
    var mod = require(modPath); 
    mod(modPath, "install/", "default");

    console.log('-2.2-');
});

gulp.task('default222', [load_task], function() {
    console.log('-default-');
    
    console.log('2.path: ' + mod.getPath());
    // var sub =  require('sub-gulp/gulpfile.js'); 
    // sub();

    // var sub2 =  require('sub-gulp'); 
    // sub2();

    // var sub2 =  require('./modules/M1/gulpfile.js'); 
    // sub2();
    // var mod = gulp.submodule('modules/M1/');
    // var modPath = 'modules/M1/';
    // var modPathfile = './modules/M1/gulpfile.js';
    // var mod;
    
    // modPath = './modules/M1/';
    // mod = require(modPathfile); 
    // mod(modPath, "install/", "default");


    // modPath = './modules/M2/';
    // mod = require(modPath); 
    // mod(modPath, "install/sub/", "default");
    // var namespace = require(modPathfile)(gulp);
    // var namespace = require(modPathfile);

    // gulpModule.load(modPath + 'gulpfile.js', gulp);


    // mod(modPath, "install");
    // mod(modPath);

    // var aa = requiredPath(a);
    
    // eval('var sub2 = require(\''+ a + '\');sub2(11);');
    eval('console.log(\'-eval-\');');
    
});

// gulp.run();
console.log('-default-');