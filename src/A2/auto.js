const { Automation } = require('../auto');
var path            = require('path');
var CoAuto3         = require('../A3/auto');

class CoAuto2 extends Automation {
    constructor(basePath) {
        super(basePath);

        var c3 = new CoAuto3();

        this.mod.super('v3', c3);
    }
}

module.exports = CoAuto2;