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
var I_MODULE_IGNORE   = false;     // 인스턴스 모듈 제외

var CONFIG_FILE     = 'gulp_i_module.json';   // 설정 파일명
var PACKAGE_FILE    = 'package.json';

// 기본 경로 (필수)
var PATH = {
    base: "",
    nodes: "node_modules/",
    modules: "node_modules/**/gulp_module.json",
    i_modules: "node_modules/**/gulp_i_module.json",
    dist: "install/",
    map: "map/"
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
gulp.task('default', ['preinstall']);        // 통합 실행
// gulp.task('default', ['install']);           // 배포


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
 gulp.task('preinstall', gulpsync.sync(['load-config', 'preinstall-sub']), function() {
  // gulp.task('preinstall', gulpsync.sync(['load-config', 'preinstall-sub', 'save-config']), function() {

});



function getPackage(){
    var _package;

    // TODO: 없을시 예외 처리
    _package = fs.readFileSync(PATH.base + 'package.json');
    return _package;
}


function getConfig(){
    var _setup;

    // TODO: 없을시 예외 처리
    _setup = fs.readFileSync(PATH.base + CONFIG_FILE);
    return _setup;
}

function getModules(){
    var _modules = {};
    var _mod;
    var _path = [];
    var _dirname = "";
    var i = 0;
    var _modName = "";
    
    var _temp;

    // glob(['node_modules/**/gulp_module.json'], function (er, files) {
    // // glob([PATH.base + PATH.module, PATH.base + PATH.i_module], function (er, files) {
    //     _modules = files;
    // });

    /**
     * [구조설계]
     * > 사전에 SETUP 가져 와야함
     * 모듈검색
     * 설정 읽기
     * 객체화
     * 저장
     */

    _path =  glob.sync('node_modules/**/gulp_module.json');

    for (i = 0; i < _path.length; i++) {
        _dirname = path.dirname(_path[i]);      // TODO: 불필요 
        _modName = _dirname.replace('node_modules/', '');

        _mod = JSON.parse(fs.readFileSync(_path[i]));
        _modules[_modName] = _mod;
    }

    _path =  glob.sync('node_modules/**/gulp_i_module.json');

    for (i = 0; i < _path.length; i++) {
        _dirname = path.dirname(_path[i]);      // TODO: 불필요 
        _modName = _dirname.replace('node_modules/', '');

        _mod = JSON.parse(fs.readFileSync(_path[i]));
        _modules[_modName] = _mod;
    }
    
    if (LOG_FLAG) console.log('__getModules__');

}


/** 
 * --------------------------------------------------
 * default 태스크
 */
gulp.task('install', function() {

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
    
    // 설치 모듈 로딩
    MODULES = {
        m: {},
        i: {}
    };

    _mod = glob.sync(PATH.modules);
    _mod.forEach(function(value, index, arr) {
        _modName = value.replace(/node_modules.([^\/]+)(?:\S+)/ig, '$1');
        MODULES.m[_modName]  = value;
    });

    if (!I_MODULE_IGNORE) {
        _mod = glob.sync(PATH.i_modules);
        _mod.forEach(function(value, index, arr) {
            _modName = value.replace(/node_modules.([^\/]+)(?:\S+)/ig, '$1');
            MODULES.i[_modName]  = value;
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
    for (var _prop in MODULES.m) {

        if(PACKAGE.dependencies[_prop]) b_pkg = true;
        else b_pkg = false;
        
        if(CONFIG.modules[_prop]) b_conf = true;
        else b_conf = false;

        function overwriteMerge(destinationArray, sourceArray, options) {
            return sourceArray
        }
        // 설정에 추가 (병합)
        if (b_pkg && !b_conf) {
            _mod = JSON.parse(fs.readFileSync(PATH.base + MODULES.m[_prop]));
            _mod = deepmerge(_mod, CONFIG.public, { arrayMerge: overwriteMerge });
            
            CONFIG.modules[_prop] = _mod;
            writeJsonFile.sync(PATH.base + MODULES.m[_prop], _mod);
        }
        
        // 설정에서 제거
        if (!b_pkg && b_conf) {
            delete CONFIG.modules[_prop];
        }
    }

    for (var _prop in MODULES.i) {

        if(PACKAGE.dependencies[_prop]) b_pkg = true;
        else b_pkg = false;
        
        if(CONFIG.modules[_prop]) b_conf = true;
        else b_conf = false;

        // 설정에 추가
        if (b_pkg && !b_conf) {
            _mod = JSON.parse(fs.readFileSync(PATH.base + MODULES.i[_prop]));
            CONFIG.modules[_prop] = _mod;
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
gulp.task('preinstall-sub', function() {
    // console.log('222222222222');
    var _prop;
    var _dirname;

    for(_prop in MODULES.m) {
        _dirname = path.dirname(MODULES.m[_prop]);
        gulp.src( _dirname + '/gulpfile.js' )
            .pipe(chug({tasks: ['default']}, function() {
                console.log('LOAD.. OK');
            })
        );
    }

    if (!I_MODULE_IGNORE) {
        for(_prop in MODULES.i) {
            _dirname = path.dirname(MODULES.i[_prop]);
            gulp.src( _dirname + '/gulpfile.js' )
                .pipe(chug({tasks: ['preinstall']}, function() {
                    console.log('LOAD.. OK');
                })
            );
        }
    }
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