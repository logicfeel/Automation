'use strict';

var util            = require('util');
var gulp            = require('gulp');  // gulp 4.0 기준
var DefaultRegistry = require('undertaker-registry');
var gutil           = require("gulp-util");
var rename          = require('gulp-rename');
var clean           = require('gulp-clean');


function AutoBase() {
    DefaultRegistry.call(this);

    this.CONFIG = null;
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

    // 추상 태스크
    gulpInst.task('update', gulpInst.series(this.update));
    gulpInst.task('preinstall', gulpInst.series(this.preinstall));
    gulpInst.task('install', gulpInst.series(this.install));
    gulpInst.task('default', gulpInst.series(this.default));

    gulpInst.task('init', gulpInst.series(this.init, this._clean_dist));
    
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


AutoBase.prototype._clean_dist = function(cb) {
    console.log('AutoBase.prototype._clean_dist');
    return gulp.src([this.PATH.base + this.PATH.dist, this.PATH.base + this.PATH.map], {read: false, allowEmpty :  true})
        .pipe(clean());
};


AutoBase.prototype._save_config = function(cb) {

    // TODO: gulp 사용 안하는 방식으로 변경
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(CONFIG));
        
    return gulp.src(PATH.base + CONFIG_FILE)
        .pipe(sortJSON({ space: 2 }))
        .pipe(gulp.dest(PATH.base + './'));
};


AutoBase.prototype.update = function(cb) {
    console.log('AutoBase.prototype.update');
    // TODO: 에러 처리 예외 추가
    return cb();
};

AutoBase.prototype.preinstall = function(cb) {
    console.log('AutoBase.prototype.preinstall');
    // TODO: 에러 처리 예외 추가
    return cb();
};

AutoBase.prototype.install = function(cb) {
    console.log('AutoBase.prototype.install');
    // throw new gutil.PluginError({
    //     plugin: errName,
    //     message: message
    // });
    // TODO: 에러 처리 예외 추가
    return cb();
};

AutoBase.prototype.default = function(cb) {
    console.log('AutoBase.prototype.default');
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

AutoInstance.prototype.install = function(cb) {
    console.log('AutoInstance.prototype.install');
    return cb();
};


//#####################################
// AutoModule
function AutoModule() {
    AutoBase.call(this);

    this.PATH['dist'] = 'dist/';
}
util.inherits(AutoModule, AutoBase);

AutoModule.prototype.init = function(gulpInst) {
    AutoBase.prototype.init.call(this, gulpInst);

    // 추가 task
    gulpInst.task('template', gulpInst.series(this.template));

    console.log('AutoModule.prototype.init');
};

AutoModule.prototype.template = function(cb) {
    console.log('AutoModule.prototype.template');
    return cb();
};


//#####################################
// AutoModModel
function AutoModModel() {
    AutoModule.call(this);
    
    this.PATH['src'] = 'src/**/*.sql';
}
util.inherits(AutoModModel, AutoModule);



//#####################################
// 테스트
var a = new AutoBase();
var b = new AutoInstance();
var c = new AutoModule();
var d = new AutoModModel();



// 등록
// gulp.registry(a);
// gulp.registry(b);
gulp.registry(c);
// gulp.registry(d);

// b._clean_dist();
// b.init();
// c.template();

// 테스크 실행
gulp.series('install')();
gulp.series('template')();

// gulp.series(b._clean_dist)();
// b.init.call(this);
//  gulp.task('default', function(cb){cb();});
//  gulp.task('default', b.init);
console.log('End');