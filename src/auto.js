
var fs = require('fs');

var PropertyCollection = require('entitybind').PropertyCollection;
var MetaElement = require('entitybind').MetaElement;

var BaseTemplate    = require('r.x.x-auto').BaseTemplate;

class Automation extends MetaElement {
    constructor(basePath){
        super();

        this.dirname = basePath || __dirname;

        this.BASE_PATH = {
            src: this.dirname + '/src',
            dist: this.dirname + '/dist',
        };

        // 속성 생성
        this.mod = new AutoCollection(this);        // 하위 모듈
        this.src = new SourceCollection(this);      // 소스
        this.dep = {};                              // 의존 모듈 소스
        this.template = new BaseTemplate(this.dirname)
        
        // 속성 설정
        this.template._isWrite = true;              // 템플릿 저장
    }
    getObject(p_context) {

        var obj     = {};

        for (var prop in this) {
            if (this[prop] instanceof MetaElement) {
                obj[prop] = this[prop].getObject(p_context);
            } else if (prop.substr(0, 1) !== '_') {
                obj[prop] = this[prop];
            }
        }
        return obj;                        
    }

}


class AutoCollection extends PropertyCollection {
    constructor(onwer) {
        super(onwer);
    }
}


class SourceCollection extends PropertyCollection {
    constructor(onwer) {
        super(onwer);
    }
    load() {
        // 타입 검사해야함
        var arr;
        var path = this._onwer.BASE_PATH.src;
        var f;

        // REVIEW:: 비동기 성능이슈 있음
        arr = fs.readdirSync(path);
        
        for (var i = 0; i < arr.length; i++) {
            
            // 대상 파일의 필터  TODO::
            
            // 컬렉션에 등록
            f = new AutoSource(arr[i]);
            f.fullPath = path + '/' + arr[i];
            this.add(arr[i], f);
        }

        console.log(2)
    }
}

class AutoSource extends MetaElement {
    constructor(filename, content) {
        super();
        
        // 원본 전체 경로
        this.fullPath = '';        
        // 파일명
        this.filename = filename || '';
        // 원본 파일 내용
        this.content = content || '';
        // 참조 파일
        this.ref = [];
        // 목적파일
        // this.target = {
        //     dist: '/dist',          // 자신 경로 기준
        //     depend: '/depend',      // 자신의 경로 기준
        //     install: '/install',    // 엔트리 경로 기준
        // },
        this.target = {
            dist: { path: '/dist', name: this.filename },
            depend: { path: '/depend', name: this.filename },
            install: { path: '/install', name: this.filename },
        }
        
        var _this = this;

        this.flag = 'dist'; // dist, depend, install 


        this.rfile = function(aa, bbb) {
            var target = _this.target[_this.flag];
            return target.path + '/' + target.name;
        }
    
    }
    /**
     * 템플릿에 제공하는 객체 기준
     * @param {*} p_context 
     * @returns 
     */
    getObject(p_context) {

        var obj     = {
            fullPath: this.fullPath,
            filename: this.filename(),
            filePath: null,
            file: null, /** 현재 파일을 기준  */
        };

        return obj;                        
    }
    /**
     * obj J
     */
    filename() {

    }
    /**
     * 
     * @param {*} org 원본 타입
     * @param {*} tag 목적 위치
     */
    copy(org, tar) {
        var obj = {
            file: '',
            ref: [],
        };

        // 원본 복사
        obj.file  = this.target[org].path + '/' + this.target[org].name;
        // 참조 정보
        for(var i =0; i < this.ref.length; i++) {
            obj.ref.push(this.ref[i].target[tar].path + '/' + this.ref[i].target[tar].name );
        }
        fileMap.push(obj);
    }
}


module.exports = {
    Automation: Automation,

};