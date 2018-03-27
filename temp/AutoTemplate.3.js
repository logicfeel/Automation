'use strict';

var EventEmitter    = require('events').EventEmitter;
var util            = require('util');
var glob            = require('glob'); 
var path            = require('path');
var gulp            = require('gulp');  // gulp 4.0 기준
var hb              = require('gulp-hb');
var rename          = require('gulp-rename');
var copyFileSync    = require('fs-copy-file-sync');     // node 에 기본 추가됨
var fs              = require('fs');
var mkdirp          = require('mkdirp');

var LArray          = require('larray');    // LCommon # LArray

// *******************************
// 개발후 클래스 파일로 분리
/**
 * TODO: 객체를 그대로 추가하는 경우   src.add(import('abc').src) => 이럴 경우
 * @param {*} pAttr 
 * @param {*} pContent String | path | Object
 */
LArray.prototype.add = function(pAttr, pContent) {

    var pathInfo = this._this._getPathInfo(this._SCOPE, pAttr);

    // var AutoBase = this._this._AutoBase;
    // var pathBase = AutoBase.PATH.base;    
    // var _attrName;
    // var _filename;
    // var _dirname;
    // var _this = this;
    // var savePath = '';    
    // var _prefix = '';
    // var _reg_exp = this._this.REG_EXP[this._SCOPE];
    // var _savefile;
    var _obj;
    
    pContent = pContent ? pContent : '';

    // _attrName = pAttr.replace(_reg_exp[0], _reg_exp[1]);
    // _dirname  = path.dirname(_attrName);
    // _dirname  = _dirname != '' ? _dirname + '/' : _dirname;
    // _filename = path.basename(_attrName) + '.hbs';

    // TODO: 구현해야함
    if (this._SCOPE === 'src' || this._SCOPE === 'template' || this._SCOPE === 'part') {
        // switch(this._SCOPE) {
        //     case 'src':
        //         savePath = pathBase + AutoBase.PATH.src;
        //         _savefile = savePath + _dirname + '@' + _filename;
        //         _prefix = '_';      //(__) 규칙
        //         break;

        //     case 'template':
        //         savePath = pathBase + AutoBase.PATH.template_page;
        //         _savefile = savePath + _dirname + '@' + _filename;
        //         _prefix = '_';      //(__) 규칙
        //         break;

        //     case 'part':
        //         savePath = pathBase + AutoBase.PATH.template_part;
        //         _savefile = savePath + _dirname + '__' + _filename;
        //         _prefix = '_';      //(__) 규칙
        //         break;
        // }

        // add 파일 생성 (기본파일 생성함)
        // mkdirp.sync(path.dirname(savePath + _dirname ));
        mkdirp.sync(pathInfo.saveDir);

        // if (this._SCOPE === 'src' || this._SCOPE === 'template') {
        //     fs.writeFileSync(_savefile, pContent);    // TODO: 상위 속성으로 변경
        // } else if (this._SCOPE === 'part') {
        //     fs.writeFileSync(_savefile, pContent);   // TODO: 상위 속성으로 변경
        // }
        fs.writeFileSync(pathInfo.savePath, pContent);   // TODO: 상위 속성으로 변경

        this.pushAttr(
            new TemplateSource(this._this, pathInfo.savePath),
            pathInfo.attrName,
            null,                       // Getter
            function(pIdx, newValue) {  // Setter
                this._items[pIdx] = newValue;
    
                // TODO: newValue 의 타입 검사 TemplateSource 추가
    
                // TODO: 기존 파일 이 있는 경우에 대한 경우
                // var destPath = savePath + '@' + path.basename(newValue.path) + '.hbs';
                // (.)접두사 + 파일명 복사 
    
                // 저장 폴더가 없는 경우 생성
                // mkdirp.sync(path.dirname(destPath));
                copyFileSync(newValue.path, pathInfo.savePath);
                // console.log('::: > 임시 파일 복사..');
            }
        );

    } else if (this._SCOPE === 'data' || this._SCOPE === 'helper' || this._SCOPE === 'decorator') {
        
        // 파일이 없을 경우.. 구성할 경우
        if (typeof pContent === 'string') {
            _obj = require.resolve(pContent) === '' ? {} : require(pContent);
        } else if (typeof pContent === 'object') {
            _obj = pContent;
        }
        this.pushAttr(_obj, pathInfo.attrName);
    }
};


LArray.prototype.load = function(pPath) {

    var pathInfo = this._this._getPathInfo(this._SCOPE, pPath);

    // var AutoBase = this._this._AutoBase;
    // var pathBase = AutoBase.PATH.base;    
    // var _attrName;
    // var _filename;
    // var _dirname;
    // var _this = this;
    // var savePath = '';    
    // var _prefix = '';
    // var _reg_exp = this._this.REG_EXP[this._SCOPE];
    // var _savefile;
    var _obj;
    
    // // pContent = pContent ? pContent : '';
    // _attrName = pPath.replace(_reg_exp[0], _reg_exp[1]);
    // _dirname  = path.dirname(_attrName);
    // _dirname  = _dirname != '' ? _dirname + '/' : _dirname;
    // _filename = path.basename(_attrName);

    // TODO: 구현해야함
    if (this._SCOPE === 'src' || this._SCOPE === 'template' || this._SCOPE === 'part') {
        // switch(this._SCOPE) {
        //     case 'src':
        //         savePath = pathBase + AutoBase.PATH.src;
        //         _prefix = '_';      //(__) 규칙
        //         break;
        //     case 'part':
        //         savePath = pathBase + AutoBase.PATH.template_part;
        //         _prefix = '_';      //(__) 규칙
        //         break;
        //     case 'template':
        //         savePath = pathBase + AutoBase.PATH.template_page;
        //         _prefix = '_';      //(__) 규칙
        //         break;
        // }

        this.pushAttr(
            new TemplateSource(this._this, pathInfo.loadPath),
            pathInfo.attrName,
            null,                       // Getter
            function(pIdx, newValue) {  // Setter
                this._items[pIdx] = newValue; 

                // var destPath = savePath + '@' + path.basename(newValue.path);
                // (.)접두사 + 파일명 복사 

                // 저장 폴더가 없는 경우 생성
                // mkdirp.sync(path.dirname(destPath));
                // copyFileSync(newValue.path, destPath);
                copyFileSync(newValue.path, pathInfo.savePath);
                // console.log('::: > 임시 파일 복사..');
            }
        ); 
        
    } else if (this._SCOPE === 'data' || this._SCOPE === 'helper' || this._SCOPE === 'decorator') {
        
        // 파일이 없을 경우.. 구성할 경우
        _obj = require.resolve(pPath) === '' ? {} : require(pPath);
        this.pushAttr(_obj, pathInfo.attrName);
    }    
};


function AutoTempalte(pAutoBase) {
    EventEmitter.call(this);

    
    // TODO: 타입 검사
    this._AutoBase = pAutoBase;

    this.src        = new LArray(this, 'src');
    this.template   = new LArray(this, 'template');
    this.part       = new LArray(this, 'part');
    this.data       = new LArray(this, 'data');
    this.helper     = new LArray(this, 'helper');
    this.decorator  = new LArray(this, 'decorator');

    // TODO: .hbs 가 마지막 확장자로 추가
    // [0] 정규식, [1] 캡쳐번호
    this.REG_EXP = {
        src:        [/(?:.*src\/)([\w\/\-.]*)(?:\.hbs)\b/gi, '$1'], 
        template:   [/(?:.*template\/page\/)([\w\/\-.]*)(?:\.hbs)\b/gi, '$1'], 
        part:       [/(?:.*template\/parts\/)([\w\/\-.]*)(?:\.hbs)\b/gi, '$1'], 
        data:       [/(?:.*template\/data\/)([\w\/\-.]*)(?:\.hbs)\b/gi, '$1'], 
        helper:     [/(?:.*template\/helpers\/)([\w\/\-.]*)(?:\.hbs)\b/gi, '$1'], 
        decorator:  [/(?:.*template\/decorators\/)([\w\/\-.]*)(?:\.hbs)\b/gi, '$1']
    };
    // this.REG_EXP = {
    //     src:        [/(?:.*src\/)([\w\/\-.]*)(?:[.]{1}[\w\-]*)\b/gi, '$1'], 
    //     template:   [/(?:.*template\/page\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1'], 
    //     part:       [/(?:.*template\/parts\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1'], 
    //     data:       [/(?:.*template\/data\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1'], 
    //     helper:     [/(?:.*template\/helpers\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1'], 
    //     decorator:  [/(?:.*template\/decorators\/)([\w\/\-.]*)(?:[.]{1}[\w]*)\b/gi, '$1']
    // };

    // (붙일 대상, 패턴, 정규식, 코드종류)
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

    // if (pCode == 'src') {
    //     savePath = pathBase + AutoBase.PATH.src;
    //     _prefix = '_';      //(__) 규칙
    // } else if  (pCode == 'part') {
    //     savePath = pathBase + AutoBase.PATH.template_part;
    //     _prefix = '__';      //(__) 규칙
    // } else if  (pCode == 'template') {
    //     savePath = pathBase + AutoBase.PATH.template_page;
    //     _prefix = '__';      //(__) 규칙
    // }

    _arr = glob.sync(pPattern);

    _arr.forEach(function(value, index, arr){
        // parName = value.replace(pReg[0], pReg[1]);
        // pTarget.pushAttr(
        //     new TemplateSource(_this, value, pCode), 
        //     parName,
        //     null,                       // Getter
        //     // null,
        //     function(pIdx, newValue) {  // Setter
        //         this._items[pIdx] = newValue; 

        //         var destPath = savePath + '@' + path.basename(newValue.path);
        //         // (.)접두사 + 파일명 복사 

        //         // 저장 폴더가 없는 경우 생성
        //         mkdirp.sync(path.dirname(destPath));
        //         copyFileSync(newValue.path, destPath);

        //         // console.log('::: > 임시 파일 복사..');
        //     }
        // );
        pTarget.load(value);
    });
};


AutoTempalte.prototype._pushMod = function(pTarget, pPattern, pReg) {
    
    var _arr = [];
    var parName = '';
    var _this = this;
    var _base;
    var _dir;

    _arr = glob.sync(pPattern, {absolute: true});

    _arr.forEach(function(value, index, arr){
        // parName = value.replace(pReg[0], pReg[1]);
        // // _base = _this._AutoBase.PATH['base'];
        // // _dir = path.relative(__dirname, _base);
        // // _dir = _dir =! '' ? _dir + '/' : _dir;
        // pTarget.pushAttr(require(value), parName);

        pTarget.load(value);
    });
};

AutoTempalte.prototype._getPathInfo = function(scope, pPath) {

    var AutoBase = this._AutoBase;
    var pathBase = AutoBase.PATH.base;    
    var _attrName;
    var _relativeDir;
    var _saveDir = '';
    var _prefix = '';
    var _reg_exp = this.REG_EXP[scope];     // TODO scope 값  6개 중 검사
    var _savePath; 
    var _loadPath;
    var _saveFile;
    var _loadFile;

    _attrName = pPath.replace(_reg_exp[0], _reg_exp[1]);
    _relativeDir  = path.dirname(_attrName);
    _relativeDir  = _relativeDir === '.' ? '' : _relativeDir;   // 현재 디렉토리 일 경우 
    _relativeDir  = _relativeDir != '' ? _relativeDir + '/' : _relativeDir;
    _loadFile = path.basename(_attrName) + '.hbs';

    switch(scope) {
        case 'src':
            _saveDir = pathBase + AutoBase.PATH.src + _relativeDir;
            _prefix = '@';      //(__) 규칙
            break;

        case 'template':
            _saveDir = pathBase + AutoBase.PATH.template_page + _relativeDir;
            _prefix = '@';      //(__) 규칙
            break;

        case 'part':
            _saveDir = pathBase + AutoBase.PATH.template_part + _relativeDir;
            _prefix = '__';      //(__) 규칙
            break;

        case 'data':
            _saveDir = pathBase + 'template/data/' + _relativeDir ;    // TODO : 전역설정에 추가
            _prefix = '__';      //(__) 규칙
            break;

        case 'helper':
            _saveDir = pathBase + 'template/helpers/' + _relativeDir ; // TODO : 전역설정에 추가
            _prefix = '__';      //(__) 규칙
            break;

        case 'decorator':
            _saveDir = pathBase + 'template/decorators/' + _relativeDir ;  // TODO : 전역설정에 추가
            _prefix = '__';      //(__) 규칙
            break;
           
        default:
            _saveDir = '';
            _prefix = '__';      //(__) 규칙
    }

    _saveFile = _prefix + _loadFile;
    _savePath = _saveDir + _saveFile;
    _loadPath = _saveDir + _loadFile;

    return  {
        saveDir: _saveDir,
        attrName: _attrName,
        savePath: _savePath,
        loadPath: _loadPath,
        saveFile: '',
        loadFile: ''
    }
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


function TemplateSource(pAutoTemplate, pPath, pCode) {
    
    // TODO: 예외 검사
    this._AutoTemplate = pAutoTemplate;
    this.path = pPath;          // 조각 경로 (호출기준)

    // TODO:
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
    var _saveDir = '';
    var _this = this;
    var _dirname;

    // TODO: pCode 추소 검토 그리고 코드 값 this.AutoBase 참조 방식으로 변경
    if (this.code == 'src') {
        // _saveDir = 'src/';
        _saveDir = AutoBase.PATH['src'];
    } else if  (this.code == 'part') {
        // _saveDir = 'template/parts/';
        _saveDir = AutoBase.PATH['template_part'];
    } else if  (this.code == 'template') {
        // _saveDir = 'template/';
        _saveDir = AutoBase.PATH['template_page'];
    }
    
    // REVIEW: path 도 상대주소로 가져와야 할지?
    _dirname = path.relative(_saveDir, path.dirname(this.path));
    _dirname = _dirname ? _dirname + '/' : '';
    _saveDir = _saveDir + AutoBase.PATH['compile'] + _dirname;

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
        .pipe(gulp.dest(pathBase + _saveDir)
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