'use strict';

var util                = require('util');
var glob                = require('glob');
var path                = require('path');
var LArray              = require('larray');


function BaseCollection(pAttr, pBaseTemplate) {
    LArray.call(this, pAttr);

    // TODO: 타입 검사
    this._BaseTemplate  = pBaseTemplate;
    this._SCOPE     = pAttr;
}
util.inherits(BaseCollection, LArray);


BaseCollection.prototype.add = function(pAttr, pContent) {
    // 추상 클래스
};

BaseCollection.prototype.getPathInfo = function(pScope, pPath) {

    var baseTemplate = this._BaseTemplate;
    var pathBase = baseTemplate.PATH.base;    
    var _reg_exp = baseTemplate.REG_EXP[pScope];     // TODO scope 값  6개 중 검사
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

    switch(pScope) {
        case 'src':
            _saveDir = pathBase + baseTemplate.PATH.src + _relativeDir;
            _prefix = '@';      //(__) 규칙
            break;

        case 'page':    // TODO: 별도 분리 필요
            _saveDir = pathBase + baseTemplate.PATH.template_page + _relativeDir;
            _prefix = '@';      //(__) 규칙
            break;

        case 'part':
            _saveDir = pathBase + baseTemplate.PATH.template_part + _relativeDir;
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

BaseCollection.prototype.pushPattern = function(pPattern) {

    var _arr = [];
    var _this = this;

    _arr = glob.sync(pPattern, {absolute: true});

    _arr.forEach(function(value, index, arr){
        _this.add(value);
    });
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


module.exports = BaseCollection;