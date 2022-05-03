class SourceMap {
    constructor(){
        this.template = 'aaa.htm.hbs'
        this.refer = 'aaa.htm'        
        this.gen = 'aaa'        
    }
}

class ICompiler {
    build() {
        throw new Error('구현해야함');
    }
}

class AutoTemplate extends ICompiler {
    constructor() {
        super();
        this.chain = null;
    }
    setChain(c) {
        this.chain = c;
    }
    build(srcMap) {
        console.log('AutoTemplate :' + srcMap.template);
        // if (this.chain !== null) this.chain.build(srcMap);
    }
}


class ReferParser extends ICompiler {
    constructor() {
        super();
        
        this.parser = [];
        this.chain = null;

    }
    setChain(c) {
        this.chain = c;
    }
    build(srcMap) {
        for (let i = 0; i < this.parser.length; i++) {
            console.log('ReferParser :' + i + ':' + srcMap.refer);
        }
        // if (this.chain !== null) this.chain.build(srcMap);
    }
}

class SemiAnalyzer extends ICompiler {
    constructor() {
        super();

        this.analyzer = [];
        this.chain = null;
    }
    setChain(c) {
        this.chain = c;
    }
    build(srcMap) {
        for (let i = 0; i < this.analyzer.length; i++) {
            console.log('SemiAnalyzer :' + i + ':' + srcMap.gen);
        }
        // if (this.chain !== null) this.chain.build(srcMap);
    }
}

class Automation {
    constructor() {
        let template  = new AutoTemplate();
        let parser =  new ReferParser();
        let analyzer = new SemiAnalyzer();

        template.setChain(parser);
        parser.setChain(analyzer);

        this.template = template; 
        this.parser = parser.parser;
        this.analyzer = analyzer.analyzer;

    }
    parse(a) {
        this.template.build(a);
        for (let i = 0; i < this.analyzer.length; i++) {
            console.log('SemiAnalyzer :' + i + ':' + srcMap.gen);
        }
    }
}


let s = new SourceMap();
let p = new Automation();
p.parse(s);

console.log(1)