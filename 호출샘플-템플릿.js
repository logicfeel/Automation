


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
var t = a.part['p1.asp'];
t.data('~');
t.partials('~');
a.src["aaa"] = t;
a.src["aaa"].compile();


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
