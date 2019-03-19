"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GreeterS = require("./template");
const CCC = require("./var");
// 타입스크립트 형식 검사됨
let a = new GreeterS('null');
// let aaa = GreeterS;
let b = new GreeterS(1);
b.template2(11);
/**
 * 이런식으로 맞는 타입을 삽입하게함
 */
b.template2(CCC.abc);
const TemplateClass = require("./auto/TemplateClass");
const TemplateClass2 = require("./auto/TemplateClass2");
var tt = new TemplateClass(1);
var tt2 = new TemplateClass2(2);
//tt.layout_base;
tt.layout_base = tt2.layout_base; // __빨간줄
//tt.footer = tt2.layout_base;
tt.footer = tt2.layout_base; // __빨간줄
// tt.layout_base = 1;
tt.layout_base = tt.footer; // __빨간줄
tt.footer = tt.layout_base; // __빨간줄
tt.hero = tt2.hero; // __빨간줄
tt.web1 = tt.web2; // __빨간줄
tt.web2 = tt.web1; // __빨간줄
tt.web1 = tt.web; // __빨간줄
tt.web = tt.web2;
tt.web_in = tt.web; // __빨간줄
var NS;
(function (NS) {
    let View;
    (function (View) {
        class TemplateClass {
            /**
             * 생성자
             * @param message 해더 메세지
             */
            constructor(message) {
                // 속성 기본값 안됨
                this.table = 'aabc';
                this.table2 = 'aabc'; // 속성 기본값 안됨
                this.table3 = 'aabc'; // 속성 기본값 안됨
                this.head = message;
            }
            /**
             * @param abc 입력값
             */
            greet(abc) {
                return "Hello, " + this.head;
            }
            /**
             * 이벤트
             */
            on() {
            }
        }
        View.TemplateClass = TemplateClass;
    })(View = NS.View || (NS.View = {}));
})(NS || (NS = {}));
var aa = NS.View.TemplateClass;
/**
 * 기본값과 네임스페이스 값을 2개를 내보내야 함
 *  - 기본값 : .js 에서 사용할 경우
 *  - 네임스페이스 : .ts 에서 로딩할 경우
 */
//# sourceMappingURL=test.js.map