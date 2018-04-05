'use strict';

var EventEmitter        = require('events').EventEmitter;
var util                = require('util');
var TemplateCollection  = require('./TemplateCollection');
var TemplateSource      = require('./TemplateSource');


function AutoTempalte(pAutoBase) {
    EventEmitter.call(this);
    
    this._AutoBase  = pAutoBase;
    
    // 기본 템플릿소스
    this._base      = new TemplateSource(this);

    this.src      = new TemplateCollection(this);
    this.page      = new TemplateCollection(this);
    
}
util.inherits(AutoTempalte, EventEmitter);


AutoTempalte.prototype.getPathInfo = function(scope, pPath) {

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

        case 'page':
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
