var filePathMapping = {
  name: '파일경로',
  id: 'GUID',
  mapping: [
    {
        text: '',
        obj: null,
    },
    {
        text: '',
        obj: 'NPM명.객체명',
    },
    {
        text: '',
        ref: 'GUID',
    },
  ],
};


//==============================
// GUID 는 파일과 객체와 물리적 분리에 효과적임
var filePathMapping = {
    src: [
        {
            path: '파일경로/파일명',
            guid: 'GUID',
            mapping: [
                {
                  text: '',
                  ref: 'GUID',
                  obj: null,    // write JSON 시점에 무시됨
                },
                {
                text: '',
                ref: 'GUID',
                obj: null,    // write JSON 시점에 무시됨
                },
            ],            
        }
    ],
    dep: [
        {
            path: '/@depend/모듈명.객체명/파일명',
            guid: 'GUID',
            mapping: [
              {
                  text: '',
                  ref: 'GUID',
                  obj: null,    // write JSON 시점에 무시됨
              },
            ],            
        }

    ],
    out: [
        {
            path: '/outer/파일명',
            guid: 'GUID',
            mapping: [
              {
                  text: '',
                  ref: 'GUID',  // 내부참조만 있음
                  obj: null,    // write JSON 시점에 무시됨
              },
            ],            
        }
    ],

  };

  //==============================
  // path 경로를 키로 사용함 : 유일성이 보장됨
var filePathMapping = {
    src: [
        {
            path: '파일경로/파일명1.php',   // path 가 키로사용
            ref: [
                {
                    text: '',
                    path: '파일명/경로명',
                    obj: null,    // write JSON 시점에 무시됨
                },
            ]
        }
    ],
    dep: [
        {
            path: '/@depend/모듈명.객체명/파일명',
        }
    ],
    out: [
        {
            path: '/outer/파일명',
            ref: [
              {
                  text: '/outer/ee/vvv.css',
                  path: '/outer/파일명',
              },
            ],            
        }
    ],

  };