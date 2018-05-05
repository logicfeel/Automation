
import GreeterS = require("./template");

import CCC = require("./var");


// 타입스크립트 형식 검사됨
let a = new GreeterS('null');

// let aaa = GreeterS;

let b = new GreeterS(1);


b.template2(11);



/**
 * 이런식으로 맞는 타입을 삽입하게함
 */
b.template2(CCC.abc);


import TemplateClass        = require('./auto/TemplateClass');
import TemplateClass2        = require('./auto/TemplateClass2');

var tt = new TemplateClass(1);
var tt2 = new TemplateClass2(2);
//tt.layout_base;

tt.layout_base = tt2.layout_base;   // __빨간줄
//tt.footer = tt2.layout_base;
tt.footer = tt2.layout_base;    // __빨간줄
// tt.layout_base = 1;

tt.layout_base = tt.footer; // __빨간줄
tt.footer = tt.layout_base; // __빨간줄


tt.hero = tt2.hero; // __빨간줄

tt.web1 = tt.web2;  // __빨간줄
tt.web2 = tt.web1;  // __빨간줄
tt.web1 = tt.web;   // __빨간줄
tt.web = tt.web2;
tt.web_in = tt.web; // __빨간줄


// b.template2(aaa)



