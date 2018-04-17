'use strict';

var util                = require('util');
var LArray              = require('larray');


function SourceCollection(pTemplateSource, pAttr) {
    LArray.call(this, pTemplateSource, pAttr);

    this._TemplateSource = pTemplateSource;
}

SourceCollection.prototype.add = function(pAttr, pContent) {

    var _obj, _obj1, _obj2;
    var autoTemplate = this._TemplateSource._AutoTemplate;
    var pathInfo = autoTemplate.getPathInfo(this._SCOPE, pPath);
    
    // TODO: 파일이 없을 경우.. 구성할 경우
    _obj1 = require.resolve(pAttr) === '' ? {} : require(pAttr);

    if (typeof pContent === 'string') {
        _obj2 = require.resolve(pContent) === '' ? {} : require(pContent);
    } else if (typeof pContent === 'object') {
        _obj2 = pContent;
    }
    _obj = Object.assign(_obj1, _obj2);

    this.pushAttr(_obj, pathInfo.attrName);

};
