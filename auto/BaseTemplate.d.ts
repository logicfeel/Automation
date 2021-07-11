/**
 * 클래스임
 */
declare class BaseTemplate {
    
    /**
     * 베이스 템플릿의 ㅣ생성자.
     * @param pBasePath {String} 문자열 전달.
     */
    constructor(pBasePath: String);

    /**
     * 초기화임
     */
    init() : void;
}

export = BaseTemplate;