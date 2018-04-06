'use strict';

var util                = require('util');
var AutoTemplate        = require('./AutoTemplate');
var TemplateSource      = require('./TemplateSource');
var LArray              = require('larray');

function TemplateCollection(pAutoTemplate, pAttr) {
    LArray.call(this, pAutoTemplate, pAttr);

    this._AutoTemplate = pAutoTemplate;
    this._private = null;
}
util.inherits(TemplateCollection, LArray);


TemplateCollection.prototype.add = function(pAttr, pContent) {
    // if (this.LOG.debug) console.log('SourceCollection.prototype.add');

    var pathInfo = this._AutoTemplate._getPathInfo(this._SCOPE, pAttr);
    var _obj, _obj1, _obj2;

    this.pushAttr(
        new TemplateSource(this._AutoTemplate, pathInfo.loadPath, pathInfo, pContent),
        pathInfo.attrName,
        null,                       // Getter
        function(pIdx, newValue) {  // Setter
            this._items[pIdx] = newValue;
            copyFileSync(newValue.path, pathInfo.savePath);
        }
    ); 
};

TemplateCollection.prototype.pushPattern = function(pTarget, pPattern) {
    
    var _arr = [];

    _arr = glob.sync(pPattern, {absolute: true});

    _arr.forEach(function(value, index, arr){
        pTarget.add(value);
    });
};