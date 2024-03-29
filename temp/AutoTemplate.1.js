'use strict';

var EventEmitter    = require('events').EventEmitter;
var util            = require('util');
var glob            = require('glob'); 
var path            = require('path');
var gulp            = require('gulp');  // gulp 4.0 기준
var hb              = require('gulp-hb');
var rename          = require('gulp-rename');
var copyFileSync    = require('fs-copy-file-sync');
var fs              = require('fs');
var mkdirp          = require('mkdirp');

var LArray          = require('larray');    // LCommon # LArray

// *******************************
// 개발후 클래스 파일로 분리



function AutoTempalte(pAutoBase) {
    EventEmitter.call(this);

    
    // TODO: 타입 검사
    this._AutoBase = pAutoBase;

    this.src        = new LArray();
    this.template   = new LArray();
    this.part       = new LArray();
    this.data       = new LArray();
    this.helper     = new LArray();
    this.decorator  = new LArray();

    // [0] 정규식, [1] 캡쳐번호
    this.REG_EXP = {
        src:        [/(?:.*src\/)([\w\/\-.]*)(?:[.]{1}[\w\-]*)\b/gi, '$1'], 
        template:   [/(?:.*template\/page\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1'], 
        part:       [/(?:.*template\/parts\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1'], 
        data:       [/(?:.*template\/data\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1'], 
        helper:     [/(?:.*template\/helpers\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1'], 
        decorator:  [/(?:.*template\/decorators\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1']
    };
    
    this._pushTmpSrc(this.src, this._AutoBase.PATT_TEMP['src'], this.REG_EXP['src'], 'src');
    this._pushTmpSrc(this.template, this._AutoBase.PATT_TEMP['page'], this.REG_EXP['template'], 'template');
    this._pushTmpSrc(this.part, this._AutoBase.PATT_TEMP['partials'], this.REG_EXP['part'], 'part');
    this._pushMod(this.data, this._AutoBase.PATT_TEMP['data'], this.REG_EXP['data']);
    this._pushMod(this.helper, this._AutoBase.PATT_TEMP['helpers'], this.REG_EXP['helper']);
    this._pushMod(this.decorator, this._AutoBase.PATT_TEMP['decorators'], this.REG_EXP['decorator']);

    
    // console.log('생성');
};
util.inherits(AutoTempalte, EventEmitter);


AutoTempalte.prototype._pushTmpSrc = function(pTarget, pPattern, pReg, pCode) {
    
    var _arr = [];
    var parName = '';
    // TODO: compile() 코드 중복됨 
    var AutoBase = this._AutoBase;
    var pathBase = AutoBase.PATH.base;
    var savePath = '';
    var _this = this;
    var _prefix = '';

    if (pCode == 'src') {
        savePath = pathBase + AutoBase.PATH.src;
        _prefix = '_';      //(__) 규칙
    } else if  (pCode == 'part') {
        savePath = pathBase + AutoBase.PATH.template_part;
        _prefix = '__';      //(__) 규칙
    } else if  (pCode == 'template') {
        savePath = pathBase + AutoBase.PATH.template_page;
        _prefix = '__';      //(__) 규칙
    }

    // 저랟주소
    _arr = glob.sync(pPattern, {absolute: true});

    _arr.forEach(function(value, index, arr){
        parName = value.replace(pReg[0], pReg[1]);
        pTarget.pushAttr(
            new TemplateSource(_this, value, pCode), 
            parName,
            null,
            // null,
            function(pIdx, newValue) { 
                this._items[pIdx] = newValue; 

                var destPath = savePath + '@' + path.basename(newValue.path);
                // (.)접두사 + 파일명 복사 

                // 저장 폴더가 없는 경우 생성
                mkdirp.sync(path.dirname(destPath));
                copyFileSync(newValue.path, destPath);

                // console.log('::: > 임시 파일 복사..');
            }
        );
    });
};


AutoTempalte.prototype._pushMod = function(pTarget, pPattern, pReg) {
    
    var _arr = [];
    var parName = '';
    var _this = this;
    var _base;
    var _dir;

    _arr = glob.sync(pPattern);

    _arr.forEach(function(value, index, arr){
        parName = value.replace(pReg[0], pReg[1]);
        _base = _this._AutoBase.PATH['base'];
        _dir = path.relative(__dirname, _base);
        _dir = _dir =! '' ? _dir + '/' : _dir;
        pTarget.pushAttr(require(_dir + value), parName);
    });
};


// 추상 메소드
AutoTempalte.prototype.init = function() {
};

/**
 * 템플릿 처리전에 실행 
 * i : update >> preinstall >> (실행) >> template-all >> install
 * m : preinstall >> install >> (실행) >> template
 */
AutoTempalte.prototype.before_template = function() {
};


AutoTempalte.prototype._import = function(modName) {
    
    var _mod;
    var AutoTempalte;
    var AutoClass;

    try {
        _mod            = require(modName);
        AutoTempalte    = _mod.AutoTempalte;
        AutoClass       = _mod.AutoClass;
    } catch(err) {
        throw new Error("에러! " + err);
    }    

    // console.log('dd');
    return new AutoTempalte(new AutoClass());
};


AutoTempalte.prototype.import = function(modName) {
    
    // TODO: 없을시 예외 처리
    return this._AutoBase.MOD[modName];
};


// *******************************
// 개발후 클래스 파일로 분리 검토


function TemplateSource(pAutoTemplate, pPath, pCode) {
    
    // TODO: 예외 검사
    this._AutoTemplate = pAutoTemplate;

    this.path = pPath;          // 조각 경로 (호출기준)
    
    this.absolute;  // 절대주소
    this.relative;  // 상대주소
    
    this.code = pCode;
    this.content = null;    // 조각내용 string
    
    this._part = null;
    this._data = null;
    this._helper = null;
    this._decorator = null;

    try {
        this.content = fs.readFileSync(pPath);
    } catch(err) {
        gulpError('error 템플릿 소스 읽기 실패 :' + pPath, 'TemplateSource');
    }
};

TemplateSource.prototype.compile = function(data) {

    // var args = Array.prototype.slice.call(arguments);
    // var compilePath = '@compile';
    var AutoBase = this._AutoTemplate._AutoBase;
    var pathBase = AutoBase.PATH.base;
    var savePath = '';
    var _this = this;
    var _dirname;

    // TODO: pCode 추소 검토 그리고 코드 값 this.AutoBase 참조 방식으로 변경
    if (this.code == 'src') {
        // savePath = 'src/';
        savePath = AutoBase.PATH['src'];
    } else if  (this.code == 'part') {
        // savePath = 'template/parts/';
        savePath = AutoBase.PATH['template_part'];
    } else if  (this.code == 'template') {
        // savePath = 'template/';
        savePath = AutoBase.PATH['template_page'];
    }
    
    // REVIEW: path 도 상대주소로 가져와야 할지?
    _dirname = path.relative(savePath, path.dirname(this.path));
    _dirname = _dirname ? _dirname + '/' : '';
    savePath = savePath + AutoBase.PATH['compile'] + _dirname;

    // REVIEW: 파라메터 값을로 읽어와야 함 
    return gulp.src(this.path)
        .pipe(hb({ debug: AutoBase.LOG['debug'] })
            // 아규먼트
            .data(data)
            // 패키지 정보
            .data(pathBase + AutoBase.FILE['PKG'])
            // 기본 정보 로딩 (glob경로)
            .partials(pathBase  + AutoBase.PATT_TEMP['partials'])
            .decorators(pathBase + AutoBase.PATT_TEMP['decorators'])
            .helpers(pathBase + AutoBase.PATT_TEMP['helpers'])
            .data(pathBase + AutoBase.PATT_TEMP['data'])
            // 조각 추가 정보 로딩 (배열 glob 경로)
            .partials(_this._part)
            .decorators(_this._decorator)
            .helpers(_this._helper)
            .data(_this._data)
        )
        .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
        .pipe(gulp.dest(pathBase + savePath)
    );
};


TemplateSource.prototype.partials = function(pattern) {
    this._part = this._part ? this._part : [];
    this._part.push(pattern);
};


TemplateSource.prototype.data = function(pattern) {
    this._data = this._data ? this._data : [];
    this._data.push(pattern);
};


TemplateSource.prototype.helpers = function(pattern) {
    this._helper = this._helper ? this._helper : [];
    this._helper.push(pattern);
};


TemplateSource.prototype.decorators = function(pattern) {
    this._decorator = this._decorator ? this._decorator : [];
    this._decorator.push(pattern);
};

// REVEIW: 제거 하는 메소드도 넣어야 할듯



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



module.exports = AutoTempalte;


// ##########################################

// var auto          = require('./i_index');
// var a = new auto.AutoClass();
// var i = new AutoTempalte(a);

// console.log('End');