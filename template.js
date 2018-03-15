
var requireObj = {
    Part: "",
    getPartHead: function(abc) {
        return "ABC";
    }
    
};

/**
 * 클래스와의 결합
 */
function TemplateA() {
    
    this.compile = {};    // setter 수정
   

}

// 상위에 배치
TemplateA.prototype.import = function(mod, part) {
    console.log('TemplateA.prototype.import');
    
    var _partials = [];
    var _data = [];
    var _helpers = [];
    var _decorators = [];

    return {
        compile: function(title, compileName) {
            console.log('compile/compileName 파일 <= 조각파일');
            
            console.log(_partials.join('__'));
            
            
            // TODO: 외부 모듈에서 실행후 가져옴
            // compile/compileName 파일 <= 조각파일
        },
        partials: function(pattern) {
            _partials.push(pattern);
        },
        data: function(pattern) {
            _data.push(pattern);
        },
        helpers: function(pattern) {
            _helpers.push(pattern);
        },
        decorators: function(pattern) {
            _decorators.push(pattern);
        },
        template: function() {
            requireObj.getPartHead("A");
        },
        // temp: requireObj.getPartHead("A")
    };
};

// 외부 종속을 고정해 놓은 경우
TemplateA.prototype.setPart = function() {
    console.log('TemplateA.prototype.setPart');

    var precompile = '';
    precompile = this.import('M1', 'head.asp');
    
    precompile.partials('조각1');
    precompile.partials('조각2');
    
    precompile.data('데이터1');
    precompile.helpers('핼퍼1');
    precompile.decorators('대코1');
    // precompile.helpers('...');

    // 조각, 핼퍼, 데이터, 데코 추가 등록
    /**
     * 서브 (호출처) 추가 등록
     *  - 조각(string, 경로)
     *  - 핼퍼(경로, require, {nm: func..}) 
     *  - 데이터(경로, {..}) 
     *  - 데코(경로, {..}) 
     */
    // precompile.template()
    precompile.temp()
    precompile.compile(title, 'HD.asp');
};


TemplateA.prototype.setPartHead2 = function(title) {
    console.log('TemplateA.prototype.setPartHead2');

    var precompile = '';
    precompile = this.import('M1', 'head.asp');
    
    precompile.partials('조각1');
    precompile.partials('조각2');
    
    precompile.data('데이터1');
    precompile.helpers('핼퍼1');
    precompile.decorators('대코1');
    // precompile.helpers('...');

    // 조각, 핼퍼, 데이터, 데코 추가 등록
    /**
     * 서브 (호출처) 추가 등록
     *  - 조각(string, 경로)
     *  - 핼퍼(경로, require, {nm: func..}) 
     *  - 데이터(경로, {..}) 
     *  - 데코(경로, {..}) 
     */
    // precompile.template()
    precompile.temp()
    precompile.compile(title, 'HD.asp');
};

// "노출형 Set"
TemplateA.prototype.setPartHead = function(title) {
    console.log('TemplateA.prototype.setHead');

    var precompile = '';
    precompile = this.import('M1', 'head.asp');
    
    precompile.partials('조각1');
    precompile.partials('조각2');
    
    precompile.data('데이터1');
    precompile.helpers('핼퍼1');
    precompile.decorators('대코1');
    // precompile.helpers('...');

    // 조각, 핼퍼, 데이터, 데코 추가 등록
    /**
     * 서브 (호출처) 추가 등록
     *  - 조각(string, 경로)
     *  - 핼퍼(경로, require, {nm: func..}) 
     *  - 데이터(경로, {..}) 
     *  - 데코(경로, {..}) 
     */

    precompile.compile(title, 'HD.asp');
};

/**
 * 해더 조각 얻기 "노출형 Get"
 * @param {String}  title 내용의 타이틀
 * @param {String}  path 리턴 복사의 경로 (절대 vs 상대 ?)
 * @return {String}  리턴타입
 */
TemplateA.prototype.getPartHead = function(title, path) {
    
    var __path = 'src/parts/header.asp.hbs';

    return ;
};

/**
 * 
 * @param {*} title 타이틀 설정 (*임의 시나리오)
 */
TemplateA.prototype.setHead = function(title) {
    console.log('TemplateA.prototype.setHead');

    var precompile = '';
    precompile = this.import('M1', 'head.asp');

    // 조각, 핼퍼, 데이터, 데코 추가 등록
    /**
     * 서브 (호출처) 추가 등록
     *  - 조각(string, 경로)
     *  - 핼퍼(경로, require, {nm: func..}) 
     *  - 데이터(경로, {..}) 
     *  - 데코(경로, {..}) 
     */
    
    // 파일명이 모듈명이 됨
    this.parts["HD"] = precompile.compile(title);

    precompile.compile(title, this.compile["HD.asp"]);

};


// ####################################
// 테스트

var i = new TemplateA();
i.setHead2('제목임');


// 조인방식 1안
a.setHead(i.getPartHead());

// 조인방식 2안
a.setHead(i.getPartHead);

/**
 * 
 *  - Get (얻기)  
 *      + 호출을 고정해 놓은 경우   : GetPartHead(전달객체)
 *      + 호출처를 동적을 하는 경우 : GetPart(조각명, 전달객체)
 * 
 *  - Set (설정)
 *      + 설정을 고정해 놓은 경우   : SetPartHead(패턴)
 *      + 설정을 동적으로 하는 경우 : SetPart(설정조각명)
 * 
 *  - Import (얻기, 설정) 합쳐진 경우 <= 복사 기능
 *      + Import(호출Part, 모듈명, 파트명, 전달객체)
 *      + Import_HeadToHeader(전달객체)
 * 
 * 
 * 이슈
 *  - 
 */


console.log('-End-');