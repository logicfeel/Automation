const { Automation } = require('./auto');
var path            = require('path');

var CoAuto1         = require('./A1/auto');
var CoAuto2         = require('./A2/auto');

class CoAuto extends Automation {
    constructor(basePath) {
        super(basePath);

        this.mod.sub('vv1', new CoAuto1());
        this.mod.super('vv2', new CoAuto2());
    }
    doDist(){
        // REVIEW:: 하위도 배치해야함

    }
}

var a = new CoAuto();

a.src.load();
// a.src[0].flag = 'install'
a.template.data2 = a.getObject();
a.template.build();

var b = a.mod.getSuperObject();

console.log(1);
