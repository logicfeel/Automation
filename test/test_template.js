

var PropertyCollection = require('entitybind').PropertyCollection;
var MetaElement = require('entitybind').MetaElement;


class IAuto {
    constructor() {
        this.url = '';
        this.attr = {
            str: '',
            num: 0,
            fun: Function,
        }
    }
}

class Automation extends MetaElement {
    constructor(){
        super();
        var aa = 'aaa';        
        // 구현
        this.url = '';
        this.attr = {
            str: '100',
            num: 200,
            fun: function() {return 'num:' + aa},
            
        }        

        /** @implements */
        this._implements(IAuto);
    }
}

var p = new PropertyCollection();
var a = new Automation();

var Abc = function(aa=1, bb='3'){
    console.log(0)
}

var BaseTemplate    = require('r.x.x-auto').BaseTemplate;

var bt = new BaseTemplate(__dirname);


bt._isWrite = true;
bt.data2 = a.getObject();


bt.build();



console.log(1)