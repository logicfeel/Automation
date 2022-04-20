
class Compiler {
    constructor(programName) {

    }
    static commandMain(args) {}

    parseOption() {}
    build(srcs, opts) {}
        compile(path, destPath, opts) {}
            semanticAnalyze(ast, types, opts) {}
            writeFile(dest, source) {}
            newFileParser(file, loader, err) {}
        link(opts) {}
}

class AST {}
class TypeTable {}
class IR {}
class AssemblyCode {}

class Parser {
    static parseFile(file) {}
}
//_______________________________________
/**
 *  - 만들다 (build)
 *  - 번역 (compile)
 *  - 구문해석(parse)   : 코드를 문법을 기준으로 추상트리로 만듬 (RegExpParser)
 *  - 타입테이블        : 타입(형식)에 대한 키와 값 목록표 (SourceMap)
 *  - 의미해석(analyze) : 참조에 대한 값 설정 (ReferenceLoacation)
 *  - 코드생성
 *  - 모으기
 *  - 연결
 */
