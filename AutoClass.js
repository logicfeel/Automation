'use strict';

// 외부 종속 클래스 수동 지정
// 사용할 타입 선언 :: 기존 규칙이 어긋나지 않음
var a   = require('.');


function AutoClass() {
    // 상속 설정
    // DefaultRegistry.call(this, __dirname);

    this.MOD = [];
}
// util.inherits(AutoBase, DefaultRegistry);

/***
 * new 생성 시점이 아니고
 * gulp.registry(i) 등록 시점에 실행됨
 * 수동 로딩 설정
 */
AutoClass.prototype.init = function(gulpInst) {
    // 오버라이딩 부모 호출
    Auto.AutoModModel.prototype.init.call(this, gulpInst);

    // 1단계 : 종속 객체 생성
    var i1 = new a.AutoClass();
    var i2 = new a.AutoClass();

    // 2단계 : 종속 객체 설정
    i1.count = 1;
    i1.caption = 'A';

    i2.Text = '버튼';
    i2.Index = 10;

    // 3단계 : Add(등록)
    this.MOD = [];
    this.MOD.push(i1);
    this.MOD.push(i2);
};

