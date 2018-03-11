'use strict';

var util            = require('util');
// var EventEmitter    = require('events');
var gulp            = require('gulp');
var rename          = require('gulp-rename');
var clean           = require('gulp-clean');
var DefaultRegistry = require('undertaker-registry');

// 테스트 모듈
var Undertaker      = require('undertaker');

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

    gulp.on('update', function(a, b) {
    
        console.log('이벤트 본문 index.js 1.. 에서 이벤트 내용 ' + a);    
        // console.log('종속 데이터 dep:' + dep.getData.tname.toString());
    });
}
util.inherits(AutoBase, DefaultRegistry);


Object.equals = function(x, y) { 
    if (x === y) return true; 
    // if both x and y are null or undefined and exactly the same 
    
    if (!(x instanceof Object) || !(y instanceof Object)) return false; 
    // if they are not strictly equal, they both need to be Objects 
    
    if (x.constructor !== y.constructor) return false; 
    // they must have the exact same prototype chain, the closest we can do is 
    // test there constructor. 
    for (var p in x) {
         if (!x.hasOwnProperty(p)) continue; 
         // other properties were tested using x.constructor === y.constructor 
         
         if (!y.hasOwnProperty(p)) return false; 
         // allows to compare x[ p ] and y[ p ] when set to undefined 
         
         if (x[p] === y[p]) continue; 
         // if they have the same strict value or identity then they are equal 
         
         if (typeof(x[p]) !== "object") return false; 
         // Numbers, Strings, Functions, Booleans must be strictly equal 
         
         if (!Object.equals(x[p], y[p])) return false; 
         // Objects and Arrays must be tested recursively 
    } 
    
    for (p in y) { 
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false; 
        // allows x[ p ] to be set to undefined 
    } 
    return true; 
}



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
AutoBase.prototype.init = function(gulpInst) {

    var ABC = 3;
    console.log('init');
    // gulpInst.task('clean', function abc(done) {
    //     console.log('clean..');
    //     done();
    // });
    gulpInst.task('clean1', this._clean_dist);
    gulpInst.task('clean2', gulpInst.series(this._clean_dist.bind(this)));  // 특수한 경우 !! series 을 사용하여 사용
    // gulpInst.task('clean2', gulpInst.series.call(this, this._clean_dist));
    
    gulpInst.task('clean3', gulpInst.series(this._clean_dist));

}
AutoBase.prototype.set  = function set(name, fn) {
    fn.TT = "T";
    var task;
    if (name === 'clean1') task = this._tasks[name] = fn.bind(this);
    else task = this._tasks[name] = fn;
    // var task = this._tasks[name] = fn;
    
    return task;
}
AutoBase.prototype.get  = function get(name) {
    // var task = this._tasks[name] = fn.bind(this);
    
    // return this._tasks[name].bind(this);
    return this._tasks[name];
    // return this._tasks['clean3'];
}

AutoBase.prototype._clean_dist = function(a, b) {
    console.log('del dist..');

    // gulp.emit('update', 1);

    return gulp.src([this.PATH.base + this.PATH.dist, this.PATH.base + this.PATH.map], {read: false, allowEmpty :  true})
        .pipe(clean());


    // return gulp.src([this.PATH.base + this.PATH.dist, this.PATH.base + this.PATH.map], {read: false, allowEmpty :  true})
    //     .on('error', function(err) {
    //         this.emit('end');
    //     })
    //     .pipe(clean());
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

// AutoBase.prototype.init = gulp.series(AutoBase.prototype._clean_dist, AutoBase.prototype.update);
// AutoBase.prototype.init = gulp.series(AutoBase.prototype._clean_dist);


// AutoBase.prototype.install = gulp.series(AutoBase.prototype._clean_dist);

//#####################################
// AutoInstance
function AutoInstance() {
    AutoBase.call(this);    
    
    this.PATH['dist'] = 'install/';
    this.PATH['map'] = 'map/';
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
}
util.inherits(AutoModModel, AutoModule);


//#####################################
// 테스트
var a = new AutoBase();
var b = new AutoInstance({a:b});
var c = new AutoModModel();
var d = new AutoModule();

gulp.registry(a);
// gulp.registry(b);



// b._clean_dist();
// b._clean_dist();
// a._clean_dist();


// gulp.series('clean1')();
// gulp.series('clean2')();
gulp.series('clean3')();

// gulp.series('clean2').call(d);


// var taker = new Undertaker();
// taker.registry(a);

// // taker.series()
// // taker.series('clean2')();

// taker.task('default', taker.series('clean', 'build', 'serve', function(cb) {
//     console.log('Server bind to ' + this.bindTo);
//     console.log('Serving' + this.build);
//     cb();
//   }));

// 이벤트 성공 ^^
// gulp.emit('update', 1);

// gulp.series('clean2').call(a);
// a.get('clean');
// gulp.series(b._clean_dist)();
// b.init.call(this);
//  gulp.task('default', function(cb){cb();});
//  gulp.task('default', b.init);
console.log('End');