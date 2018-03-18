'use strict';

var util            = require('util');

// *******************************
// 개발후 클래스 파일로 분리

var EventEmitter = require('events').EventEmitter;

function AutoTempalte(pAutoBase) {
    EventEmitter.call(this);

    
    var _src = {};

    // TODO: 타입 검사
    this._AutoBase = pAutoBase;
    // this.TMP = tmp ? tmp : {};
    this.src = {};

    var bValue;
    var aa = 'AA';

    Object.defineProperty(this.src, aa, {
        get: function() { 
            console.log('inner');
            return 'bValue'; 
        },
        set: function(newValue) { 
            console.log('inner2');
            bValue = newValue; 
        },
        enumerable: true,
        configurable: true
    });

}

util.inherits(AutoTempalte, EventEmitter);

// 추상 메소드
AutoTempalte.prototype.init = function() {

};

// AutoTempalte.prototype._setPropertie = function(pIdx) {
        
//     var obj = {
//         get: function() { return this._items[pIdx]; },
//         set: function(newValue) { this._items[pIdx] = newValue; },
//         enumerable: true,
//         configurable: true
//     };
//     return obj;        
// };

AutoTempalte.prototype.import = function(modName) {
    
    var AutoTempalte;

    try {
        AutoTempalte = require(modName).AutoTempalte;
    } catch(err) {
        throw new Error("에러! " + err);
    }    
    
    console.log('dd');
    
    return new AutoTempalte();
};

AutoTempalte.prototype.getSrc = function(page) {
    
    var part = null;

    /**
     * 해당 경로에 대한 파일
     * 리턴
     *  - 소스 경로
     *  - 소스 String
     * 
     */
    if (this._AutoBase.PATH['src']) {
        
        
        // part = new Part();
    }

    return part;
};

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

function TemplateSource(pPath, pContent) {
    
    this.path = pPath;          // 조각 경로 (호출기준)
    this.content = pContent;    // 조각내용 string

    return {
        partials: function() {},
        data: function() {},
        helpers: function() {},
        decorators: function() {}
    }
}

module.exports.AutoTempalte = AutoTempalte;


// ##########################################


var i = new AutoTempalte();

// var p = i.import('@mod-c/asp_common');

var v = i.src.aa;
i.src.aa = '';

var v2 = i.src;
i.src = '';


var obj = {};


obj.abc = 'AA';

var abc = 'foo';

var objs = {
    bar: 'aaa',

    set foo(value) {
        console.log('foo set');
        this.bar = value;
    },
    set abc(value) {
        console.log('foo set');
        this.bar = value;
    },

    get ''() {
        console.log('foo get');
        return '_';
    },

    get () {
        console.log('foo get');
        return '_';
    },
    // set [this](value) {
    //     console.log('foo s');
    //     this.bar = value;
    // },
    get [this]() {
        console.log('foo');
        return '#';
    }
   
};

// objs.__lookupGetter__ = function __lookupGetter__(nm){
//     console.log('__lookupGetter__');
// }
// objs.__lookupSetter__ = function __lookupGetter__(nm){
//     console.log('__lookupGetter__');
// }
// objs.__defineGetter__ = function __lookupGetter__(nm){
//     console.log('__defineGetter__');
// }
// objs.__defineSetter__ = function __lookupGetter__(nm){
//     console.log('__defineGetter__');
// }
// objs.isPrototypeOf = function __lookupGetter__(nm){
//     console.log('__defineGetter__');
// }
// objs.propertyIsEnumerable = function __lookupGetter__(nm){
//     console.log('__defineGetter__');
// }

// objs.hasOwnProperty = function hasOwnProperty(nm){
//     console.log('hasOwnProperty');
// }
// Object.getOwnPropertyDescriptor = function(a) {
//     console.log('getOwnPropertyDescriptor');
// }
var c = objs.foo;
objs.foo = 'a';
objs.foo3 = 'a';
// obj = {};
var d = objs.foo2;
// objs.__lookupGetter__();

var arr = [10, 20];

var obj3 = {};
var obj4 = new Object();
var obj5 = '';

// a.aa = 3;

console.log('End');