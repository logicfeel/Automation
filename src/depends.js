'use strict';

var EventEmitter        = require('events').EventEmitter;
var util                = require('util');

/**
 * 
 */
function BaseDepend() {

}

/**
 * 
 */
function InternalDepend() {
    BaseDepend.call(this);

    this.depend = [];
}
util.inherits(InternalDepend, BaseDepend);

InternalDepend.prototype.add = function(pBaseDepend) {
    this.depend.push(pBaseDepend);
};


/**
 * 
 */
function PositionSource(pIdx, pLen) {
    InternalDepend.call(this);

    // 기본값 설정 및 초기화
    this.index  = pIdx ? pIdx : -1;
    this.length = pLen ? pLen : 0;
}
util.inherits(PositionSource, InternalDepend);


/**
 * 
 */
function LocalSource(pPath) {
    InternalDepend.call(this);

    this.pathName       = pPath;
    this.clone          = null;
    this.directDepend   = [];
    this.dist           = [];
}
util.inherits(LocalSource, InternalDepend);

// LocalSource.prototype.createDirectDepend = function(pDirectDep) {
//     this.directDepend.push(pDirectDep);
// };

// LocalSource.prototype.addDistribute = function(pGlobalSrc) {
//     this.dist.push(pGlobalSrc);
// };

/**
 * 
 */
function ExternalDepend(pPath, pMod) {
    BaseDepend.call(this);

    this.pathName       = pPath;
    this.modName        = pMod;
}
util.inherits(ExternalDepend, BaseDepend);


/**
 * 
 */
function GlobalSource() {
    ExternalDepend.call(this, pAttr);

    this.onwer      = null;
    this.clone      = null;
    this.destPath   = null;
}
util.inherits(GlobalSource, ExternalDepend);


module.exports = {
    PositionSource : PositionSource,
    LocalSource: LocalSource,
    ExternalDepend: ExternalDepend,
    GlobalSource: GlobalSource
};