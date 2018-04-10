'use strict';

var util                = require('util');
var BaseCollection      = require('./BaseCollection');
var BaseSource          = require('./Sources').BaseSource;


function PublicCollection(pAttr, pAutoTemplate) {
    BaseCollection.call(this, pAttr, pAutoTemplate);

    // this._AutoTemplate = pAutoTemplate;
}
util.inherits(PublicCollection, BaseCollection);


PublicCollection.prototype.add = function(pAttr, pContent) {

    var pathInfo = this.getPathInfo(this._SCOPE, pAttr);
    var _obj, _obj1, _obj2;
    var bs;
    // TODO: 파일이 없을 경우.. 구성할 경우
    // 잘못 설계됨
    _obj1 = require.resolve(pAttr) === '' ? {} : require(pAttr);

    if (typeof pContent === 'string') {
        _obj2 = require.resolve(pContent) === '' ? {} : require(pContent);
    } else if (typeof pContent === 'object') {
        _obj2 = pContent;
    }
    _obj = Object.assign(_obj1, _obj2);

    this.pushAttr(
        new BaseSource(this._BaseTemplate, pathInfo.attrName, pathInfo.loadPath, _obj),
        pathInfo.attrName,
        null,                       // Getter
        function(pIdx, newValue) {  // Setter

            // 3-1. BaseSource 를 삽입한경우
            if (newValue instanceof BaseSource) {
                // 파일 복사
                copyFileSync(newValue.path, pathInfo.savePath);
                
                this._items[pIdx] = newValue.clone(pathInfo.attrName, pathInfo.savePath);
            
            // 3-(2,3) : String, function, Object
            } else {
                this._items[pIdx] = newValue;
            }
           

            // TODO: 템플릿 소스의 경우 
            /**
             * - 파일만 복사할지?
             * - 속성을 깊게 복사할지..
             */
            // copyFileSync(newValue.path, pathInfo.savePath);
        }
    );
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

module.exports = PublicCollection;
