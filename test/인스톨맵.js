
/**
 * 파일의 설치 위치 정보를 설정한다.
 *  - 절대경로는 키 역활을 한다.
 *      + 의존파일은 절대카기 존재하지 않는다.
 *  - 이중 구조로 변경하게 사용할지....
 */

// 내부 조회 파일 객체
let __fileMap = [
    {
        key: '@mod/id/file1.c',
        ins: 'install/common/file.c',  // /install/file.c 설치됨
    },
    {
        key: '@mod/id/file2.c',
        ins: 'file2.c', // /install 생략됨
    },
];

// 방식 1
var installMap = {
    '@out/file1.c': 'eeee', // @out, @dep, 내부 파일의 명칭 변경시
    // 외부의 파일 변경은 어떻게?

    // 객체명으로 변경하는 방식
    rename: {
        org: '/install/file.c',
        tar: '/install/2/file.c',
    },
    // 배열로 원본과 대상을 표현한 방식
    rename: ['/install/file.c', '/install/2/file.c'],
    // 콜백함수로 변경하는 방식
    renameCallback: (a, b) => {
        // 콜백 관련 내용을 정의한다.
        // a 원본키, b 변경키
    },
    renameCallback: (org) => {
        let tar = org + 'A';
        return tar;
    },
    renameCallback: (obj) => {
        let tar = obj.name + 'A' + obj.ext;
        return tar;
    },
    renameCallback: (name, obj) => {
        name = '이름';
        obj.key = '@Mod/[논리명/]file.c';
        obj.fs.name = '파일명';
        obj.fs.ext ='확장자';
        return name; // 이름을 그대로 통과할지, 조건으로 통과시킬지 저징
    },
    rename: [
        // 1. 지정한 파일명 변경
        {
            org: '/install/file.c',
            tar: '/install/$file.c.'            
        },
        // 2. 폴더 변경 : install 을 기준으로 한다.
        {
            dir: '/common',
            tar: '/cmn'
        },
        // 2-1. 정규식을 사용
        {
            dir: /[/](\w)/,
            chg: 'edt'   // !! 해석해야 한다.
        },
        // 2-2. 정규식 캡쳐 사용 콜백
        {
            dir: /[/](\w)/,
            chg: (r) => {
                return r[0] + '__';    // 해석: 첫번째 캡쳐이름뒤에 __를 추가한다.
            }
        }
    ],
    
};

/**
 * 중요!!
 *  - 인스톨맵은 설치 파일에 대한 정보만 관리한다.
 *  - 기본경로 : install/ + 모듈명 + '/' + 논리키 + 파일명
 */
var installMap = {
    file: [
        // 'install' 은 생략됨
        {
            key: 'file1.c',
            chg: '$file1.c' // 'change' 이름도 허용함
        },
        // install 시점에 파일 함침
        {
            keys: ['file2.c', 'file3.c'],   // 'list' 도 허용함
            chg: 'merge.c'
        }
    ],
    regexp: [   // 'regex', 'reg' 도 허용함 같음의미로
        {
            key: /fun(a-z)/,
            chg: (res, path) => {
                // return 이 null, '', undefined 이면 무시한다.
                return obj.dir + '/' + res[1] + '__' + obj.ext; // 해석: 이름뒤에 __ 추가
                return obj.full; // 동일한 이름이 매칭된다.
            }
        }
    ],
    map: (path) => {
        /**
         * 전체 파일 조회 콜백
         * 조건문으로 대상 파일 변경
         */
    }
}

// obj 의 구조 : install 을 최상위 폴더 기준으로 
var path = {
  dir: '/install/user/dir',
  base: 'file.txt',
  ext: '.txt',
  name: 'file',
  full: '/install/user/dir/file.txt'
};

/**
 * instll map 에 필요한 기능
 *
 *  - 파일명은 파일객체로 전달해서 가공을 용의하게 한다.
 *  
 *  - 파일명(경로) 변경
 *  - 확장자별 필터 구분
 *  - 로컬과 외부의 범위 지정 (검토!)
 *      + install 은 전체를 대상으로 지정한다.
 *  - 콜백을 통한 사용자화 함수 변경 제공
 *  
 */
