
const fs = require('fs');
const { MetaElement, PropertyCollection, MetaObject} = require('entitybind');
const { BaseTemplate } = require('r.x.x-auto');

class Automation extends MetaElement {
    constructor(basePath){
        super();

        this.dirname = basePath || __dirname;

        this.BASE_PATH = {
            src: this.dirname + '/src',
            dist: this.dirname + '/dist',
        };

        this.PATH = {
            base: '',
            src: 'src'
        };

        // 속성 생성
        this.mod = new AutoCollection(this);        // 하위 모듈
        this.src = new SourceCollection(this);      // 소스
        this.dep = {};                              // 의존 모듈 소스
        this.template   = new BaseTemplate(this.dirname)
        this.task       = AutoTask.getInstance();
        this.package    = require('./package.json');

        // 속성 설정
        this.template._isWrite = true;              // 템플릿 저장
    }
    getObject(p_context) {

        let obj     = {};

        for (let prop in this) {
            if (this[prop] instanceof MetaElement) {
                obj[prop] = this[prop].getSuperObject(p_context);
            } else if (prop.substr(0, 1) !== '_') {
                obj[prop] = this[prop];
            }
        }
        return obj;                        
    }

    init() {
        // src 원시소스 로딩
        this.src.load(this.PATH.src);
    }

}


class AutoCollection extends PropertyCollection {
    constructor(onwer) {
        super(onwer);
        
        this._super = [];
        this._sub = [];
    }
    add(alias, obj) {
        super.add(alias, obj);
    }
    sub(alias, obj) {
        this.add(alias, obj);
        // 별칭 이름 등록
        this._sub.push(alias);
        // 의존 모듈 등록
        // this._onwer.dep[`${obj.package.name}.${alias}`] = obj;
    }
    super(alias, obj) {
        this.add(alias, obj);
        // 별칭 이름 등록
        this._super.push(alias);
        // 의존 모듈 등록  하위로 
        // this._onwer.dep[`${obj.package.name}.${alias}`] = obj;
        // 
    }
    getSuperObject() {
        let arr = [];
        let elm;
        let obj;

        for(let i = 0; i < this._super.length; i++) {
            elm = this[this._super[i]];
            obj = {
                key: `${elm.package.name}.${this._super[i]}`,
                value: elm
            }
            arr.push(obj);
            arr = arr.concat(elm.mod.getSuperObject());
        }
        return arr;
    }
}


class SourceCollection extends PropertyCollection {
    constructor(onwer) {
        super(onwer);
    }
    load() {
        // 타입 검사해야함
        let arr;
        let path = this._onwer.BASE_PATH.src;
        let f;

        // REVIEW:: 비동기 성능이슈 있음
        arr = fs.readdirSync(path);
        
        for (let i = 0; i < arr.length; i++) {
            
            // 대상 파일의 필터  TODO::
            
            // 컬렉션에 등록
            f = new BaseSource(path+ '/' + arr[i]);
            f.fullPath = path + '/' + arr[i];
            this.add(arr[i], f);
        }

        console.log(2)
    }
}


class BaseSource extends MetaElement {
    constructor(filename) {
        super();
        
        let content = fs.readFileSync(filename,'utf-8');

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
        // 상위에
        let basePath = {
            dist: '/dist',
            install: '/install',
            depend: '/depend',
            publish: '/publish',
        };
        let targetDir = {};

        this.target = {
            dist: { path: '/dist', name: this.filename },
            depend: { path: '/depend', name: this.filename },
            install: { path: '/install', name: this.filename },
        }
        
        let _this = this;

        this.flag = 'dist'; // dist, depend, install 


        this.rfile = function(aa, bbb) {
            let target = _this.target[_this.flag];
            return target.path + '/' + target.name;
        }
    
    }
    /**
     * 템플릿에 제공하는 객체 기준
     * @param {*} p_context 
     * @returns 
     */
    getObject(p_context) {

        let obj     = {
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
        let obj = {
            file: '',
            ref: [],
        };

        // 원본 복사
        obj.file  = this.target[org].path + '/' + this.target[org].name;
        // 참조 정보
        for(let i =0; i < this.ref.length; i++) {
            obj.ref.push(this.ref[i].target[tar].path + '/' + this.ref[i].target[tar].name );
        }
        fileMap.push(obj);
    }
}

class AutoTask extends MetaObject {
    
    static instance;
    
    constructor() {
        super();

        this.cursor = '';
        this.entryPath = '';
        this.entry = null;
    }
    
    static getInstance(){
        const coClass = this;
        if (!coClass.instance) coClass.instance = new coClass();
        return coClass.instance;        
    }
    init(auto) {
        // 엔트리 등록
        this.entry = auto;
    }

    do_dist(auto) {
        // 초기화
        this.init(this);
        // 소스 로딩
        this._onwer.src.load();
        // 템플릿 객체 구성
        this._onwer.template.data2 = this._onwer.getObject();
        // 템플릿 빌드
        this._onwer.template.build();
    }
}

module.exports = {
    Automation: Automation,

};