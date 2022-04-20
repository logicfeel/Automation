const { Automation } = require('../auto');
const CoAuto3        = require('../A3/auto');

class CoAuto2 extends Automation {
    constructor() {
        super(__dirname);

        var c3 = new CoAuto3();

        this.mod.super('v3', c3);
    }
}

module.exports = CoAuto2;