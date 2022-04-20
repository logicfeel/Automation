const { Automation } = require('./auto');

var path            = require('path');

var CoAuto1         = require('./A1/auto');
var CoAuto2         = require('./A2/auto');

let vv = new CoAuto1();

class CoAuto extends Automation {
    static instance = null;
    constructor() {
        // super(__dirname, true);
        super(__dirname);

        this.mod.sub('vv1', vv);
        this.mod.super('vv2', new CoAuto2());
    }
    doDist(){
        // REVIEW:: 하위도 배치해야함

    }
}

// var a = new CoAuto();
var a = CoAuto.getInstance();

// a.src.load();
// a.src[0].flag = 'install'
// a.template.data2 = a.getObject();
// a.template.build();

a.task.do_dist(a);

a.mod._getSuperList()

a.mod.getDependList()


console.log(1);
