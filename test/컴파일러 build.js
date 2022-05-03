class SourceMap {
    constructor(){

        this.template = 'aaa.htm.hbs'
        this.refer = 'aaa.htm'        
        this.gen = 'aaa'
        this.content = ''        
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
    }
    build(srcMap) {
        srcMap.content += ' 템플릿처리함 '
        console.log('AutoTemplate :' + srcMap.template);
        console.log('content :' + srcMap.content);
    }
}


class PhpParser extends ICompiler {
    constructor() {
        super();
    }
    build(srcMap) {
        srcMap.content += ' 파서 처리함 '
        console.log('PhpParser :' + srcMap.refer);
        console.log('content :' + srcMap.content);
    }
}
class AspParser extends ICompiler {
    constructor() {
        super();
    }
    build(srcMap) {
        srcMap.content += ' 파서 처리함 '
        console.log('AspParser :' + srcMap.refer);
        console.log('content :' + srcMap.content);
    }
}

class AspAnalyzer extends ICompiler {
    constructor() {
        super();

        this.analyzer = [];
        this.chain = null;
    }
    build(srcMap) {
        srcMap.content += ' 해석 처리함 '
        console.log('AspAnalyzer :' + srcMap.gen);
        console.log('content :' + srcMap.content);
    }
}

class Automation {
    constructor() {
        this.template =  new AutoTemplate(); 
        this.parser = [];
        this.analyzer = [];
    }
    setParser(p) {
        // ReferParser 상속 여부 검사
        this.parser.push(p);
    }
    setAnalyzer(a) {
        // 인터페이스 구현 여부 검사 (자유도가 높음)
        // 하위 중 중복 검사
        // install 을 기준으로 처리함
        this.analyzer.push(a);
    }

    build(a) {
        this.template.build(a);
        for (let i = 0; i < this.parser.length; i++) {
            this.parser[i].build(a);        
        }
        /**
         * !! 중요 엔트리 시점에만 로딩함
         */
        for (let i = 0; i < this.analyzer.length; i++) {
            this.analyzer[i].build(a);
        }
    }
}


let s = new SourceMap();
let a = new Automation();

a.setAnalyzer(new AspAnalyzer());
a.setParser(new AspParser());
a.setParser(new PhpParser());

a.build(s);

console.log(1)