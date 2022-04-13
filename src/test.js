


const { Automation } = require('./auto');
var path            = require('path');

class CoAuto extends Automation {
    constructor(basePath) {
        super(basePath);
    }
    doDist(){
        // REVIEW:: 하위도 배치해야함

    }
}

var fun = function() {};

var Fun2 = function Fun2() {
}

// var a = new CoAuto(process.cwd());
var a = new CoAuto();
// a.dirname = ''
a.src.load();
a.src[0].flag = 'install'
a.template.data2 = a.getObject();
a.template.build();
// var basePath = '../'

// var _base = basePath ? basePath : __dirname;
    
// _base = path.relative(process.cwd(), _base);            // 상대경로 반환

console.log(1);