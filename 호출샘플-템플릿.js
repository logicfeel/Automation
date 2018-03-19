


function AutoTemplate() {
    this.part = ['p1.asp', 'p2.asp'];  // Larray에 추가  속성명이 있는 배열
    this.src = ['aaa', 'bbb'];  // Larray에 추가  속성명이 있는 배열
    this.data = ['d1.json', 'd2.json'];  // Larray에 추가  속성명이 있는 배열
}

var a = new AutoTemplate();


/**
 * 1) 조각에서 가져와서 소스에 "덮어쓰기"
 */
var t = a.part['p1.asp'];
a.src["aaa"] = t;

/**
 * 2) 조각에서 가져와서 "컴파일후" 소스에 "덮어쓰기"
 */
// 2-1
 var t = a.part['p1.asp'];
t.data('~');
t.partials('~');
a.src["aaa"] = t.compile();

// 2-2
var t = a.part['p1.asp'];
t.data('~');
t.partials('~');
a.src["aaa"].compile = t;

// 2-3
//단축형도 가능하고 
var t = a.part['p1.asp'];
t.data('~');
t.partials('~');
a.src["aaa"] = t;
a.src["aaa"].compile();

a.part['p1.asp'].data('~');
a.part['p1.asp'].partials('~');
a.src["aaa"] = a.part['p1.asp'];
a.src["aaa"].compile();

var at = this.import('모듈명');
at.part['p1.asp'].data('~');
at.part['p1.asp'].partials('~');
this.src["aaa"] = at.part['p1.asp'];
this.src["aaa"].compile();

var at = this.import('모듈명');
this.data.push('신규데이터');
this.data["신규데이터"] = at.data['p1.json'];



/**
 * 3) 조각에서 가져와서 소스에 "추가하기"
 */
a.src.push('pro');
 var t = a.part['p1.asp'];
a.src["pro"] = t;

/**
 * 4) 조각에서 가져와서 "컴파일후" 소스에 "추가하기"
 */
a.src.push('pro');
 var t = a.part['p1.asp'];
t.data('~');
t.partials('~');
a.src["pro"] = t.compile();
