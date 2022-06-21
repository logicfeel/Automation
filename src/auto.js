const fs = require('fs');
const path = require('path');
const {MetaElement, PropertyCollection, MetaObject} = require('entitybind');
const {BaseTemplate} = require('r.x.x-auto');

class Automation extends MetaElement {
    constructor(basePath, isInstance){
        super();

        // if (isInstance !== true && typeof this.instance === 'undefined') {
        //     throw new Error('static instance : load fail...');
        // }
        this._isInstance = isInstance === true ? true : false;

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
        this.out = {};                              // 외부 소스 (독립적, 의존없음)
        this.template   = new BaseTemplate(this.dirname)
        this.task       = AutoTask.getInstance();
        this.package    = require(this.dirname +'/package.json');

        // 속성 설정
    }
    // this.template._isWrite = true;              // 템플릿 저장
    getObject(p_context) {

        let obj     = {};

        for (let prop in this) {
            if (this[prop] instanceof MetaElement) {
                obj[prop] = this[prop].getObject(p_context);
            } else if (prop.substring(0, 1) !== '_') {
                obj[prop] = this[prop];
            }
        }
        
        // dep 속성 설정
        const list = this.mod.getDependList();

        for (let i = 0; i < list.length; i++) {
            this.dep[list[i].key] = list[i].value.src;
        }

        return obj;                      
    }

    static getInstance(){
        const coClass = this;
        if (coClass.instance === null) {
            coClass.instance = new coClass();
            if (coClass.instance._isInstance === true) {
                throw new Error('인스턴스로 설정되어 static 객체를 사용할수 없습니다.');
            }
        }
        if (typeof coClass.instance === 'undefined') {
            throw new Error('Fail static 속성이 없습니다. : static instance = null');
        }
        return coClass.instance;        
    }

    init() {
        // src 원시소스 로딩
        this.src.load(this.PATH.src);
        // 객체 로딩
        // this.template.data2 = this.getObject();

        for (let i = 0; i < this.mod.count; i++) {
            this.mod[i].init();
        }
    }

}


class AutoCollection extends PropertyCollection {
    constructor(onwer) {
        super(onwer);
        
        this._super = [];
        this._sub = [];
    }
    
    _getSuperList() {
        
        let arr = [];
        let elm;
        let obj;

        for(let i = 0; i < this._super.length; i++) {
            elm = this[this._super[i]];
            if (elm.mod._super.length > 0) {
                arr = arr.concat(elm.mod._getSuperList());
            }
            obj = {
                key: `${elm.package.name}.${this._super[i]}`,
                value: elm
            };
            arr.push(obj);
        }
        return arr;
    }

    getObject(p_context) {

        let obj     = {};

        for (let prop in this) {
            if (this[prop] instanceof MetaElement) {
                obj[prop] = this[prop].getObject(p_context);
            } else if (prop.substring(0, 1) !== '_') {
                obj[prop] = this[prop];
            }
        }
        return obj;                      
    }


    getDependList() {
        
        let arr = [];
        let elm;
        let obj;

        for(let i = 0; i < this._sub.length; i++) {
            elm = this[this._sub[i]];
            obj = {
                key: `${elm.package.name}.${this._sub[i]}`,
                value: elm
            }
            arr.push(obj);
        }
        arr = arr.concat(this._getSuperList());
        return arr;
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

    select(seloector) {}

    select(seloector, obj) {}
   
}


class SourceCollection extends PropertyCollection {
    constructor(onwer) {
        super(onwer);
    }
    
    getObject() {
        return {}
    }

    load() {
        // 타입 검사해야함
        
        let path = this._onwer.BASE_PATH.src;

        this.readSource(path);
    }

    readSource(path, dir = '') {
        
        let arr;
        let f;

        arr = fs.readdirSync(path);

        for (let i = 0; i < arr.length; i++) {
            
            // REVIEW:: 비동기 성능이슈 있음
            
            // 대상 파일의 필터  TODO::
            if (fs.statSync(path+'/'+arr[i]).isFile()) {
                // 컬렉션에 등록
                f = new BaseSource(path + '/' + arr[i]);
                f.fullPath = path + '/' + arr[i];
                f._auto = this._onwer;
                this.add(dir + arr[i], f);
            } else if (fs.statSync(path +'/'+arr[i]).isDirectory()) {
                this.readSource(path + '/' + arr[i], arr[i] + '/');
            } 
        }
    }

}


class BaseSource extends MetaElement {
    constructor(filename) {
        super();
        
        let content = fs.readFileSync(filename,'utf-8');

        this.task       = AutoTask.getInstance();

        // 소속 auto
        this._auto = null;
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
            return target.path + '/' + target.name + '?'+ bbb;
        }

        // 개발 2단계 
        this.dist = new TargetSource('dist');
        this.dist.path = basePath.dist +'/' + path.basename(this.filename);
        this.dist._onwer = this;

        this.filename3 = this[this.task.cursor].getPath();
        // this.filename3 = this['dist'].getPath();
        this.filename4 = this.filename2();
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
     * obj this 사용에 문제가 있음
     * data2 를 thi 로 가르킴
     */
    filename2() {
        const task = this.task.cursor || 'dist';
        
        // return task
        return this[task].getPath();
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

    create_dist() {}
    create_install() {}
    create_depend() {}
    create_update() {}
    create_publish() {}
}

class TargetSource {
    constructor(depend) {
        this._onwer = null;
        this.path = '';
        this.content = '';
        this.dependTarget = depend;
    }
    
    getPath() {
        return this.path;
    }

    save(data = this.content) {
        
        const dir = this._onwer._auto.dirname;
        const dirname = path.parse(dir + this.path).dir;
        const _this = this;

        // 디렉토리 만들기
        const isExists = fs.existsSync( dirname );
        if( !isExists ) {
            fs.mkdirSync( dirname, { recursive: true } );
        }

        fs.writeFile(dir + this.path, data, 'utf8', function(error){ 
            console.log('write :'+ dir + _this.path);
        });        
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

    _dist(auto) {
      
        for(let i = 0; i < auto.mod.count; i++) {
            // 재귀 호출
            this._dist(auto.mod[i]);
        }
        // 템플릿 객체 구성
        auto.template.data2 = auto.getObject();
        // 템플릿 빌드
        let build = auto.template.build();
        let a_path = '';
        // 템플릿 소스 저장
        for (let i = 0; i < build.length; i++) {
            a_path = path.relative('src', build[i].key);
            if (auto.src[a_path]) {
                // .hbs 확장자 제거
                auto.src[a_path].dist.path = auto.src[a_path].dist.path.replace('.hbs','');
                auto.src[a_path].dist.save(build[i].value);
                // console.log('있음');
            }
        }
        // console.log(1);
    }

    init(auto) {
        // 엔트리 등록
        this.entry = auto;
        // 오토 초기화
        this.entry.init();
    }

    do_dist(auto) {
        this.cursor = 'dist';
        // 초기화
        this.init(auto);
        
        this._dist(auto);
    }

    do_install() {}
    do_depend() {}
    do_update() {}
    do_publish() {}


}

// export default Automation;

module.exports = {
    Automation: Automation,
};