const { Automation } = require('../auto');
var path            = require('path');

class CoAuto1 extends Automation {
    constructor() {
        super(__dirname);

        console.log(2)
    }
}

module.exports = CoAuto1;