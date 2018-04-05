'use strict';

var util                = require('util');
var TemplateCollection  = require('./TemplateCollection');
var AutoTemplate        = require('./AutoTemplate');
var LArray              = require('larray');


function TemplateSource(pAutoTemplate) {

    this._AutoTemplate = pAutoTemplate;
    
    this._part = new TemplateCollection(this._AutoTemplate);
    this._data = null;
    this._helper = null;
    this._decorator = null;
}

TemplateSource.prototype.addData = function(pPattern) {
    
    var _arr = [];

    _arr = glob.sync(pPattern, {absolute: true});

    _arr.forEach(function(value, index, arr){
        _data.add(value);
    });
};

TemplateSource.prototype.decorators = function(pattern) {
    this._decorator = this._decorator ? this._decorator : [];
    this._decorator.push(pattern);
};