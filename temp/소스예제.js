/**
 * 오토의 사용법을 나열해 본다
 */

// 오토 추가
this.mod.add('view', obj);
this.mod.add('view', obj, 2);   // 0:모드, 1:sub, 2:super
this.mod.sub('view', obj);
this.mod.super('view', obj);

// 검색
var s1 = this.mod.select('e1 > e2');

// 교체
this.mod.replace('a1 > a2', obj);

// 소스 정보 접근
var path  = this.src['abc.asp.hbs'].path;
var path  = this.src['sub/abc-d.C.asp'].name;

// 수동 태스크
this.task.doDepend();
this.task.doDist();
this.task.doInstall();

// 템플릿 접근
this.template.publish();

// 파서 접근
this.parser.parse();

