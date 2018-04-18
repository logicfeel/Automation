'use strict';

var util                = require('util');
var glob                = require('glob');
var path                = require('path');
var LArray              = require('larray');


function BaseCollection(pAttr, pBaseTemplate) {
    LArray.call(this, pAttr);

    // TODO: 타입 검사
    this._BT  = pBaseTemplate;
    this._SCOPE     = pAttr;
}
util.inherits(BaseCollection, LArray);


BaseCollection.prototype.add = function(pAttr, pContent) {
    // 추상 클래스
};

BaseCollection.prototype.getPathInfo = function(pScope, pPath) {

    var baseTemplate = this._BT;
    var pathBase = baseTemplate.PATH.base;    
    var _reg_exp = baseTemplate.REG_EXP[pScope];     // TODO scope 값  6개 중 검사
    var _delimiter = baseTemplate.DELIMITER[pScope];     // TODO scope 값  6개 중 검사
    var _attrName;
    var _prefix;
    var _ext = this._BT.PATT_GLOB['ext'];
    var _relativeDir;
    var _loadDir;
    var _loadFile;
    var _loadPath;
    var _saveDir;
    var _saveFile;
    var _savePath; 
    var prohibitName = ['add', 'getPattInfo', 'pushPattern', '_SCOPE', '_BaseTemplate'];

    _attrName = pPath.replace(_reg_exp[0], _reg_exp[1]);
    _attrName = _attrName.replace(/\//g, _delimiter);    // 구분 문자 변경
    _loadDir = path.dirname(pPath);
    _loadDir  = _loadDir === '.' ? '' : _loadDir + '/';
    _loadFile = path.basename(pPath);
    _relativeDir  = path.dirname(_attrName);
    _relativeDir  = _relativeDir === '.' ? '' : _relativeDir + '/';

    // 속성명 제한 검사
    if (prohibitName.indexOf(_attrName) > -1) {
        throw new Error('금지 속성명 :' + _attrName);
    }
    
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
    
    if (_saveFile.indexOf(_ext) < 0) _saveFile = _saveFile + _ext;

    _savePath = _saveDir + _saveFile;
    _loadPath = _loadDir + _loadFile;

    return  {
        attrName: _attrName,    // 속성명
        // 파일에서 불러온 경우 (절대경로)
        loadDir: _loadDir,      // 로딩 디렉토리
        loadFile: _loadFile,    // 로딩 파일명
        loadPath: _loadPath,    // 로딩 전체경로
        // 파일생성시 경우 (상태경로)
        saveDir: _saveDir,      // 저장할 디렉토리
        saveFile: _saveFile,    // 저장할 파일명
        savePath: _savePath     // 저장할 전체 경로 (디렉토리 + 파일명)
    };
};

BaseCollection.prototype.pushPattern = function(pPattern) {

    var _arr = [];
    var _this = this;

console.log('__dirname:' + __dirname);
console.log('-pushPattern:' + pPattern);

    _arr = glob.sync(pPattern, {absolute: true});
console.log('-_arr:' +_arr.length);
    _arr.forEach(function(value, index, arr){
        _this.add(value);
console.log('-forEach:' +value);
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