
class IChain {
    // setNextChain() {
    //     throw new Error('구현해야함');
    // }
    parse() {
        throw new Error('구현해야함');
    }
}


class SourceMap {
    constructor(){
        this.template = 'aaa.htm.hbs'
        this.refer = 'aaa.htm'        
        this.gen = 'aaa'        
    }
}

class TempParser extends IChain {
    constructor(chain = null) {
        super();
        this.chain = chain;
    }
    parse(srcMap) {
        // if 내부처리
        console.log('TempParser :' + srcMap.template);
        // else
        if (this.chain !== null) this.chain.parse(srcMap);
    }
}
class RefParser extends IChain {
    constructor(chain = null) {
        super();
        this.chain = chain;
    }
    parse(srcMap) {
        // if 내부처리
        console.log('RefParser :' + srcMap.refer);
        // else
        if (this.chain !== null) this.chain.parse(srcMap);
    }
}
class GenParser extends IChain {
    constructor(chain = null) {
        super();
        this.chain = chain;
    }
    parse(srcMap) {
        // if 내부처리
        console.log('GenParser :' + srcMap.gen);
        // else
        if (this.chain !== null) this.chain.parse(srcMap);
    }
}


class Parser {
    constructor() {
        this.parser = new TempParser(new RefParser(new GenParser()));
    }
}

let s = new SourceMap();
let p = new Parser();
p.parser.parse(s);