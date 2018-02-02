'use strict';
// gulp 3.9 기준

var gulp        = require('gulp'); 
require('gulp-submodule')(gulp);

var gulpsync    = require('gulp-sync')(gulp);
var fs          = require('fs');
var glob        = require('glob'); 

var path        = require('path'); 


// var mod = gulp.submodule('modules/M1/');
var mod = gulp.submodule('node_modules/M3/');

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
var LOG_FLAG        = false;     // 로그 표시
var I_MODULE_PASS   = false;     // 인스턴스 모듈 제외

var CONFIG_FILE  = 'gulp_i_module.json';   // 설정 파일명

// 기본 경로 (필수)
var PATH = {
    base: "",
    nodes: "node_modules/**/",
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
gulp.task('default', ['update']);            // 목록 갱신
// gulp.task('default', ['preinstall']);        // 통합 실행
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
gulp.task('update', ['load-config', 'update-check'], function() {
    // var _prop;
    // var _setup = getConfig();
    
    // getModules();

    // for(prop in _setup.modules) {

    // }
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
 * preinstall 태스크
 * >
 * TODO:
 * 
 */
gulp.task('preinstall', function() {

});

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

    if (LOG_FLAG) console.log('___loading '+ CONFIG_FILE + '___');

    // 설정객체가 없는 경우
    if (!CONFIG) {
        CONFIG = JSON.parse(fs.readFileSync(PATH.base + CONFIG_FILE));
    }
});


/** 
 * --------------------------------------------------
 * 설정 로딩
 */
gulp.task('update-check', function() {
    var _package_file = 'package.json';
    var _package = fs.readFileSync(PATH.base + _package_file);
    var _temp = [];

    // TODO: 처리 종료 에러 처리 추가
    if (!_package) console.log('___error file 없음: '+ _package + '___');

    // 모듈 + i모듈 목록 가져옴
    _temp = _temp.concat(glob.sync(PATH.modules));
    if (!I_MODULE_PASS) _temp = _temp.concat(glob.sync(PATH.i_modules));

    // fs.statSync(PATH.base + _package_file)

    // 작업중
    // fs.stat(PATH.base + _package_file, function(err, stats) {
    //     if(err) { return callback(err); }
    //     if(stats.isFile() && file == searchFile) {
    //       callback(undefined, path+'/'+file);
    //     } else if(stats.isDirectory()) {
    //       findFile(path+'/'+file, searchFile, callback);
    //     }
    // });

    // 설정객체가 없는 경우
    if (!CONFIG) {
        setup = fs.readFileSync(PATH.base + CONFIG_FILE);

        CONFIG = JSON.parse(setup);
    }
});


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