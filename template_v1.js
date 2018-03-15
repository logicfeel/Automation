'use strict';

var util            = require('util');

function Template() {
    // getter,setter 설정
    /**
     * getter : 필요 없음?
     * setter : 내부적으로 compiler 수행
     */
    this.parts = {};    
}

Template.prototype.getPart = function(partName) {
    console.log('Template.prototype.getPart');

};

function Part() {
}
Part.prototype.compile = function(params) {
    console.log('Template.prototype.compile');

};

// ------------------------------------
function Template_A() {
    Template.call(this);
}
util.inherits(Template_A, Template);

/**
 * 템플릿 설정
 * @param {*} partName 
 */
Template_A.prototype.setPartHead = function(partName) {
    console.log('Template_A.prototype.getPart');

};

// ------------------------------------
function Template_B() {
    Template.call(this);
}
util.inherits(Template_B, Template);

/**
 * 템플릿 설정
 * @param {*} title 
 */
Template_B.prototype.getPartHead = function(title) {
    console.log('Template_B.prototype.getPart');
    return;    // gulp.src ... <= 복사 기능

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
 *      + 호출처를 동적을 하는 경우 : GetPart(조각명)
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