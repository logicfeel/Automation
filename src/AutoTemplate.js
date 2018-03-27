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
var TemplateSource  = require('./TemplateSource');

// *******************************
// 개발후 클래스 파일로 분리

/**
 * 오버라이딩
 * TODO: 객체를 그대로 추가하는 경우   src.add(import('abc').src) => 이럴 경우
 * @param {*} pAttr 
 * @param {*} pContent String | path | Object
 */
LArray.prototype.add = function(pPath, pContent) {

    var pathInfo = this._this._getPathInfo(this._SCOPE, pPath);
    var _obj, _obj1, _obj2;

    if (this._SCOPE === 'src' || this._SCOPE === 'template' || this._SCOPE === 'part') {

        this.pushAttr(
            new TemplateSource(this._this, pathInfo.loadPath, pathInfo, pContent),
            pathInfo.attrName,
            null,                       // Getter
            function(pIdx, newValue) {  // Setter
                this._items[pIdx] = newValue; 
                copyFileSync(newValue.path, pathInfo.savePath);
            }
        ); 
        
    } else if (this._SCOPE === 'data' || this._SCOPE === 'helper' || this._SCOPE === 'decorator') {
        
        // TODO: 파일이 없을 경우.. 구성할 경우
        _obj1 = require.resolve(pPath) === '' ? {} : require(pPath);
    
        if (typeof pContent === 'string') {
            _obj2 = require.resolve(pContent) === '' ? {} : require(pContent);
        } else if (typeof pContent === 'object') {
            _obj2 = pContent;
        }
        _obj = Object.assign(_obj1, _obj2);

        this.pushAttr(_obj, pathInfo.attrName);
    }    
};


function AutoTempalte(pAutoBase) {
    EventEmitter.call(this);

    // TODO: 타입 검사
    this._AutoBase = pAutoBase;

    this.src        = new LArray(this, 'src');
    this.page       = new LArray(this, 'page');
    this.part       = new LArray(this, 'part');
    this.data       = new LArray(this, 'data');
    this.helper     = new LArray(this, 'helper');
    this.decorator  = new LArray(this, 'decorator');

    // [0] 정규식, [1] 캡쳐번호
    this.REG_EXP = {
        src:        [/(?:.*src\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'], 
        page:       [/(?:.*template\/page\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'], 
        part:       [/(?:.*template\/part\/)([\w\/\-.@]*)(?:\.hbs|\.js)\b/gi, '$1'], 
        data:       [/(?:.*template\/data\/)([\w\/\-.]*)(?:\.js|\.json)\b/gi, '$1'], 
        helper:     [/(?:.*template\/helper\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'], 
        decorator:  [/(?:.*template\/decorator\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1']
    };

    // 동적 추가된 (@)파일 제외 해야야함
    this.PATT_GLOB = {
        src: 'src/**/!(__*|@*)*.hbs',                 // 일반 배치 소스 (__시작하는 파일은 제외)
        page: 'template/page/**/!(__*|@*)*.hbs'      // 템플릿 배포 소스        
    };

    // (붙일 대상, 패턴, 정규식, 코드종류)
    this.pushPattern(this.src, this.PATT_GLOB['src']);
    this.pushPattern(this.page, this.PATT_GLOB['page']);
    this.pushPattern(this.part, this._AutoBase.PATT_GLOB['part']);
    this.pushPattern(this.data, this._AutoBase.PATT_GLOB['data']);
    this.pushPattern(this.helper, this._AutoBase.PATT_GLOB['helper']);
    this.pushPattern(this.decorator, this._AutoBase.PATT_GLOB['decorator']);
};
util.inherits(AutoTempalte, EventEmitter);


AutoTempalte.prototype.pushPattern = function(pTarget, pPattern) {
    
    var _arr = [];

    _arr = glob.sync(pPattern, {absolute: true});

    _arr.forEach(function(value, index, arr){
        pTarget.add(value);
    });
};


AutoTempalte.prototype._getPathInfo = function(scope, pPath) {

    var AutoBase = this._AutoBase;
    var pathBase = AutoBase.PATH.base;    
    var _reg_exp = this.REG_EXP[scope];     // TODO scope 값  6개 중 검사
    var _attrName;
    var _prefix;
    var _relativeDir;
    var _saveDir;
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
            _saveDir = pathBase + 'template/helper/' + _relativeDir ; // TODO : 전역설정에 추가
            _prefix = '__';      //(__) 규칙
            break;

        case 'decorator':
            _saveDir = pathBase + 'template/decorator/' + _relativeDir ;  // TODO : 전역설정에 추가
            _prefix = '__';      //(__) 규칙
            break;
           
        default:
            _saveDir = '';
            _prefix = '__';      //(__) 규칙
    }
    
    // src, tempalte 의 재컴파일시
    // if (_loadFile.indexOf("@") > 0) _prefix = '';

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
    };
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