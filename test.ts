
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



// b.template2(aaa)



