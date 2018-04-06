'use strict';

var util                = require('util');
var copyFileSync        = require('fs-copy-file-sync');     // node 에 기본 추가됨
var fs                  = require('fs');

var BaseCollection      = require('./BaseCollection');
var TemplateSource      = require('./TemplateSource');


function LocalCollection(pAttr, pAutoTemplate) {
    BaseCollection.call(this, pAttr, pAutoTemplate);

    this._AutoTemplate = pAutoTemplate;
}
util.inherits(LocalCollection, BaseCollection);


LocalCollection.prototype.add = function(pAttr) {

    var pathInfo = this.getPathInfo(this._SCOPE, pAttr);
    var content;
    try {
        content = fs.readFileSync(pAttr);
    } catch (err) {
        // TODO: 예외 처리
    }

    this.pushAttr(
        new TemplateSource(this._AutoTemplate, pathInfo.loadPath, content.toString()),
        pathInfo.attrName,
        null,                       // Getter
        function(pIdx, newValue) {  // Setter
            this._items[pIdx] = newValue;
            copyFileSync(newValue.path, pathInfo.savePath);
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


module.exports = LocalCollection;
