'use strict';

var util            = require('util');
var EventEmitter    = require('events');
var gulp            = require('gulp');
var rename          = require('gulp-rename');
var clean           = require('gulp-clean');

function AutoBase() {
    EventEmitter.call(this);

    this.CONFIG = null;
    this.PKG = null;
    this.PATH = {
        base: '',
        nodes: 'node_modules/',
        module: '../**/@mod*/',
        i_module: '../**/@instance/'
    };
}
util.inherits(AutoBase, EventEmitter);


// 전역 속성
AutoBase.prototype.ERR_LEVEL = 0;
AutoBase.prototype.LOG = {
    silent: true,      // gulp 로그 비활성화
    notresult: false,   // 설치 모듈/파일 정보 (마지막)
    debug: false,       // 디버깅시 상세 콘솔 로그 표시
    sub: false          // 서브 모듈 여부
};
AutoBase.prototype.FILE = {
    CFG: 'auto_module.json',
    PKG: 'package.json',
    MAP: 'installemap.json',
    GULP: 'gulpfile.js'
};

AutoBase.prototype._clean_dist = function() {
    return gulp.src([this.PATH.base + this.PATH.dist, this.PATH.base + this.PATH.map], {read: false, allowEmpty :  true})
      .pipe(clean());
};

// AutoBase.prototype.init = gulp.series(AutoBase.prototype._clean_dist, 
//     function() {
//         return gulp.src(this.PATH.base + '.' + this.FILE.CFG)
//             .pipe(rename(this.FILE.CFG))
//             .pipe(gulp.dest(this.PATH.base + './'));
//     }
// );

AutoBase.prototype.default = function() {
};

AutoBase.prototype.update = function() {
};

AutoBase.prototype.preinstall = function() {
};




AutoBase.prototype.install = gulp.series(AutoBase.prototype._clean_dist);

//#####################################
// AutoInstance
function AutoInstance() {
    AutoBase.call(this);    
    
    this.PATH['dist'] = 'install/';
}
util.inherits(AutoInstance, AutoBase);


//#####################################
// AutoModule
function AutoModule() {
    AutoBase.call(this);

    this.PATH['dist'] = 'dist/';
}
util.inherits(AutoModule, AutoBase);


AutoModule.prototype.install = function() {
};

//#####################################
// AutoModModel
function AutoModModel() {
    AutoModule.call(this);
    
    this.PATH['src'] = 'src/**/*.sql';
    this.PATH['map'] = 'map/';
}
util.inherits(AutoModModel, AutoModule);


//#####################################
// 테스트
var a = new AutoBase();
var b = new AutoInstance();
var c = new AutoModModel();
var d = new AutoModule();


b._clean_dist();

// gulp.series(b._clean_dist)();
// b.init.call(this);
//  gulp.task('default', function(cb){cb();});
//  gulp.task('default', b.init);
console.log('End');