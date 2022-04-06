

var PropertyCollection = require('entitybind').PropertyCollection;
var MetaObject = require('entitybind').MetaObject;


class IAuto {
    constructor() {
        this.url = ''
    }
}

class Automation extends MetaObject {
    constructor(){
        super();
        
        /** @implements */
        this._implements(IAuto);
    }
}

var p = new PropertyCollection();
var a = new Automation();


console.log(1)