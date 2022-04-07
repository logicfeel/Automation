

var PropertyCollection = require('entitybind').PropertyCollection;
var MetaObject = require('entitybind').MetaObject;


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

class Automation extends MetaObject {
    constructor(){
        super();
        
        // 구현
        this.url = '';
        this.attr = {
            str: '100',
            num: 200,
            fun: function() {},
            
        }        

        /** @implements */
        this._implements(IAuto);
    }
    getObject() {
        return this;
    }
}

var p = new PropertyCollection();
var a = new Automation();

console.log(1)