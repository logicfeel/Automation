
// <reference path="@types/template/index.d.ts" />

'use strict';

// C:/Users/Young/AppData/Local/Microsoft/TypeScript/2.8/node_modules/@types/... 을 참조함
// var gulp            = require('gulp');          // gulp 4.0 기준

// D:\PJ-GitHub\Automation\node_modules\@types\.. 을 참조함
// var GreeterS        = require('template');

// template.d.ts : 동일 폴더의 같은 파일  확장자만 다름 참조함

var GreeterS        = require('./template');

// D:\PJ-GitHub\Automation\@types\template\index.d.ts
// 타입 정의를 참조함
// var thisMod        = require('./');
// var tt =  new thisMod();



var t = new GreeterS('aa');
var r = t.template(32);



t.showGreeting('aaa');
// t.showGreeting(a);
t.greeting;
t.c;



// 타입스크립트 형식 검사됨
// let a = new GreeterS();


var TemplateClass        = require('./auto/TemplateClass');

var tt = new TemplateClass();
tt.layout_base;
tt.footer;


console.log('-End-');