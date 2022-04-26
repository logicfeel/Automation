let  temp = `
    src='ref.1'
    if ....
    src='refer.2'
    for
    src='refer.3'
    while
    src='refer.4.'
    dim 
    src='refer.5..'
`;


let refInfo = [
    { idx: 10, txt:'ref.1', rep: 'reg::1000'},
    { idx: 38, txt:'refer.2', rep: 'reg::20000'},
    { idx: 64, txt:'refer.3', rep: 'reg::30000'},
    { idx: 92, txt:'refer.4.', rep: 'reg::40000'},
    { idx: 120, txt:'refer.5..', rep: 'reg::50000!!!!'},
]


// console.log(temp.indexOf('ref.1'))
// console.log(temp.indexOf('refer.2'))

// console.log(temp.indexOf('src='))
// console.log(temp.indexOf(/src=/))

// let r1 = temp.match(/src=/)

// let result = /src=/gi.exec(temp);





// console.log(r1)
// console.log(result)


/**
 * index 위치와 문자열
 * 
 * 인덱스 위치에서 택스트가 여부검사
 *  - 부분을 잘라서 text 와 비교
 * 
 * 조회로직
 *  - 반복문
 *  - 캡쳐부분 교체
 *  - index 변경
 *  ## 이방식은 안됨!!
 * 
 * 새로운 함수를 만들면된다.
 *  - 함수(원본문자열 배열[idx:시작위치, len:길이, rep:교체할문자열] )
 */

function replaceObject(orgStr, arrObj) {

    var obj
    var base_idx = 0, idx = 0;
    var org = orgStr;
    var org_prev = '', org_next = ''

    for(var i = 0; i < arrObj.length; i++) {
        obj = arrObj[i];
        idx = obj.idx + base_idx;                           // 시작 인텍스
        if (org.substr(idx, obj.txt.length) === obj.txt) {
            org_prev = org.slice(0, idx);                  // 앞 문자열
            org_next = org.slice(idx + obj.txt.length);   // 뒤 문자열
            org = org_prev + obj.rep + org_next;
            base_idx = base_idx + obj.rep.length - obj.txt.length;
        } else {
            console.warn('실패 '+ obj);
        }
    }
    return org;
}

let r = replaceObject(temp, refInfo)
console.log(r)
console.log(temp)

console.log(0)
