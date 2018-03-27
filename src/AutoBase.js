'use strict';

var util            = require('util');
var gulp            = require('gulp');  // gulp 4.0 기준
var DefaultRegistry = require('undertaker-registry');
var rename          = require('gulp-rename');
var fs              = require('fs');
var hb              = require('gulp-hb');
var path            = require('path');
var writeJsonFile   = require('write-json-file');
var rm              = require('gulp-rm');

var AutoTempalte    = require('./AutoTemplate');

function AutoBase(basePath, TemplateClass) {
    DefaultRegistry.call(this);

    // 기본 경로    
    var _base = basePath ? basePath : this.getDirname();
    
    _base = path.relative(process.cwd(), _base);            // 상대경로 반환
    _base = _base ? _base.replace(/\\/g,'/') + '/' : '';    // 접근 '/' 경로 변경

    // 경로 설정
    this.PATH = {
        base: _base,
        nodes: 'node_modules/',
        // module: '../**/@mod*/',
        // i_module: '../**/@instance/',
        dist: '',                                       // 하위에서 정의
        map: 'map/',
        src: 'src/',
        compile: '@compile/',
        template: 'template/',
        template_part: 'template/part/',
        template_page: 'template/page/'
    };

    // gulp.src(pattern) 에서 사용 패턴 그룹
    this.PATT = {
        src:    '',                                         // 하위에서 정의
        buffer: '**/__*.*',                                 // 내부 컴파일에 포함된 파일(파일은 참조용도)
        copy:   '**/@*.*'                                   // 외부에서 복사된 파일명
    }

    // 템플릿 패턴
    this.PATT_GLOB = {
        ext: '.hbs',                                        // 템플릿 파일 확장자
        dist: 'publish/',                                   // 템플릿 배포 폴더 
        src: 'src/**/!(__*)*.hbs',                          // 일반 배치 소스 (__시작하는 파일은 제외)
        page: 'template/page/**/!(__*)*.hbs',               // 템플릿 배포 소스
        part: 'template/part/**/!(__*)*.{hbs,js}',          // partical명 : 파일명
        helper: 'template/helper/**/!(__*)*.js',            // helper(메소드)명 : export 객체명
        decorator: 'template/decorator/**/!(__*)*.js',      // decorators(메소드)명 : export 객체명            
        data: 'template/data/**/*.{js,json}'                // data명 : 파일명.객체명  TODO: data/ 폴더 명 사용 불필요 할듯 이미 구분됨
    };
    
    // 테스크 명 접두사 명칭
    this.PREFIX_NM = '';
    
    // 파일명
    this.FILE = {
        CFG: 'auto_module.json',
        PKG: 'package.json',
        MAP: 'installemap.json',
        GULP: 'gulpfile.js'
    };

    // 로딩 객체
    this.CFG = this.load(this.PATH['base'] + this.FILE['CFG']);
    this.PKG = this.load(this.PATH['base'] + this.FILE['PKG']);
    this.MOD = null;  // 하위(종속) 자동모듈
    
    this.TMP = TemplateClass ? new TemplateClass(this) : null;
    
    // TODO: 
    this.AUTO_TYPE = '';
    // if (this instanceof AutoInstance)   this.AUTO_TYPE = 'I';
    // if (this instanceof AutoModule)     this.AUTO_TYPE  = 'M';
    
    this.ERR_LEVEL = 1;
}
util.inherits(AutoBase, DefaultRegistry);


// 전역 속성
AutoBase.prototype.ERR_LEVEL = 0;
AutoBase.prototype.I_MOD_IGNORE = 0;

AutoBase.prototype.LOG = {
    silent: true,       // gulp 로그 비활성화
    notresult: false,   // 설치 모듈/파일 정보 (마지막)
    debug: true,        // 디버깅시 상세 콘솔 로그 표시
    sub: false          // 서브 모듈 여부
};



AutoBase.prototype.getDirname = function() {
    return __dirname;
}

/**
 * undertaker-registry 태스크 등록
 * @param {*} gulpInst gulp 공유
 */
AutoBase.prototype.init = function(gulpInst) {
    if (this.LOG['debug']) console.log('AutoBase.prototype.init');
    
    // this.runTask.call(this);
    gulpInst.task(this.PREFIX_NM + 'reset', gulpInst.series(
        this.reset.bind(this), 
        this._reset_dir.bind(this),
        this._reset_del.bind(this)
    ));

    gulpInst.task(this.PREFIX_NM + 'template', gulpInst.series(
        this._load_mod.bind(this), 
        this.template.bind(this),
        this._template_dist.bind(this),
        this._template_publish.bind(this)
    ));

};


/**
 * 오버라이딩  overriding
 * 테스크 설정
 * @param {*} name 테스트명
 * @param {*} fn 호출 함수, 내부 연결 함수, 또는 사용자 주입 함수
 */
AutoBase.prototype.set  =function set(name, fn) {
    var task = this._tasks[name] = fn.bind(this);
    return task;
};

/**
 * 오버라이딩
 * 이름으로 태스크 함수 얻기
 * @param {*} name 
 */
AutoBase.prototype.get  =function get(name) {
    var task = this._tasks[name];
    return task;
};


// 파일 초기화
AutoBase.prototype.reset = function reset(cb) {
  if (this.LOG['debug']) console.log('AutoBase.prototype.reset');
  
  // REVIEW: 기능확인
  reset.description = '초기화 (폴더, 객체)';

  return gulp.src(this.PATH['base'] + '.' + this.FILE['CFG'])
    .pipe(rename(this.FILE['CFG']))
    .pipe(gulp.dest(this.PATH['base'] + './'));
};

// 폴더 초기화
AutoBase.prototype._reset_dir = function _reset_dir(cb) {
    if (this.LOG['debug']) console.log('AutoBase.prototype._reset_dir');

    return gulp.src(
            [
                this.PATH['base'] + this.PATH['dist'], 
                this.PATH['base'] + this.PATH['map'],
                this.PATH['base'] + this.PATH['src'] + this.PATH['compile'],
                this.PATH['base'] + this.PATH['template_page'] + this.PATH['compile'],
                this.PATH['base'] + this.PATH['template_part'] + this.PATH['compile']
            ], 
            {read: false, allowEmpty :  true})
        .pipe(clean());
};


AutoBase.prototype._reset_del = function _reset_dir(cb) {
    if (this.LOG['debug']) console.log('AutoBase.prototype._reset_dir');

    return gulp.src(
            [
                this.PATH['base'] + tthis.PATH['src'] + this.PATT['buffer'],
                this.PATH['base'] + tthis.PATH['src'] + this.PATT['copy'],
                this.PATH['base'] + this.PATH['template_page'] + this.PATT['buffer'],
                this.PATH['base'] + this.PATH['template_page'] + this.PATT['copy']
            ],
            {read: false})
        .pipe(rm());
};


AutoBase.prototype._save_cfg = function _save_cfg(cb) {
    if (this.LOG['debug']) console.log('AutoBase.prototype._save_cfg');

    writeJsonFile.sync(this.PATH['base'] + this.FILE['CFG'], this.CFG);

    return cb();
};


AutoBase.prototype._load_mod = function _load_mod(cb) {
    if (this.LOG['debug']) console.log('AutoBase.prototype._load_mod');

    var _relativePath;
    var _sub;
    var _instance;

    // 설치 모듈 로딩 : 경로
    this.MOD = {};

    for (var _prop in this.PKG.dependencies) {

        _sub            = require(_prop);
        
        // 검사 후 로딩 
        if (_sub.AutoClass) {
            _relativePath   = path.relative(process.cwd(), path.dirname(require.resolve(_prop)));
            _instance = new _sub.AutoClass(_relativePath);
            
            // 하위 인스턴스 무시
            if (this.I_MOD_IGNORE && _instance instanceof AutoInstance) break;

            // if (typeof _sub.TemplateClass === 'function') {
            //     this.TMP = new _sub.TemplateClass(this);
            // }
           
            _instance.setTaskPrefix(_prop);
            this.MOD[_prop] = _instance;
            
            gulp.registry(_instance);
        }
    }
    return cb();
};


AutoBase.prototype.template = function template(cb) {
    if (this.LOG['debug']) console.log('AutoBase.prototype.template');
    
    // 템플릿이 지정 되어 있는 경우
    if (this.TMP instanceof AutoTempalte) {
        this.TMP.before_template();
    }

    return cb();
};

AutoBase.prototype._template_publish = function _template_publish(cb) {
    if (this.LOG['debug']) console.log('AutoBase.prototype._template_publish');

    var hbObj = this.getTemplateObj();

    // TODO: 아래 부분이 중복됨
    return gulp.src(this.PATH['base']  + this.PATT_GLOB['page'])
        .pipe(hb({debug: this.LOG['debug']})
            .partials(hbObj.part)
            .helpers(hbObj.helper)
            .decorators(hbObj.decorator)
            .data(hbObj.data)
            .data(this.PATH['base'] + this.FILE['PKG'])               // 패키지 정보
            .data(this.PATH['base'] + this.FILE['CFG'])               // 설정 정보 (auto_module.json)
        )
        .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
        .pipe(gulp.dest(this.PATH['base'] + this.PATT_GLOB['dist'])
    );
};


AutoBase.prototype._template_dist = function _template_dist(cb) {
    if (this.LOG['debug']) console.log('AutoBase.prototype._template_dist');

    var hbObj = this.getTemplateObj();

    return gulp.src(this.PATH['base']  + this.PATT_GLOB['src'])
        .pipe(hb({debug: this.LOG['debug']})
            .partials(hbObj.part)
            .helpers(hbObj.helper)
            .decorators(hbObj.decorator)
            .data(hbObj.data)
            .data(this.PATH['base'] + this.FILE['PKG'])               // 패키지 정보
            .data(this.PATH['base'] + this.FILE['CFG'])               // 설정 정보 (auto_module.json)            
        )
        .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
        .pipe(gulp.dest(this.PATH['base'] + this.PATH['dist'])
    );
};

// TODO: 위치는 변경
AutoBase.prototype.getTemplateObj = function getTemplateObj() {
    
    var i = 0;
    var _part = {};
    var _helper = {};
    var _decorator = {};
    var _data = {};
    var _propName = '';
    var _dirname = '';
    var _basename = ''

    // gulp-hp 전달 객체 조립 
    for(i = 0 ; this.TMP && i < this.TMP.part.length; i++) {
        _dirname = path.dirname(path.relative(this.PATH['template_part'], this.TMP.part[i].path));
        _dirname  = _dirname === '.' ? '' : _dirname;   // 현재 디렉토리 일 경우 
        _dirname  = _dirname != '' ? _dirname + '/' : _dirname;
        _basename =  path.basename(this.TMP.part[i].path, this.PATT_GLOB['ext']);  // 확장자 제거(.hbs)
        
        _part[_dirname + _basename] = this.TMP.part[i].content.toString();
    }

    // REVEIW: 아래 문법이 무난? 검토 _helper = this.TMP ? Object.assign({}, this.TMP.helper.slice(0, this.TMP.helper.length - 1)) : {};
    for(i = 0 ; this.TMP && i < this.TMP.helper.length; i++) {
        _helper = Object.assign(_helper, this.TMP.helper[i]);
    }

    for(i = 0 ; this.TMP && i < this.TMP.decorator.length; i++) {
        _decorator = Object.assign(_decorator, this.TMP.decorator[i]);
    }

    for(i = 0 ; this.TMP && i < this.TMP.data.length; i++) {
        _data = Object.assign(_data, this.TMP.data[i]);
    }
    return {
        part: _part,
        helper: _helper,
        decorator: _decorator,
        data: _data
    }
};


AutoBase.prototype.set_pkg = function(path) {
    this.PKG = this.load(path);
};


AutoBase.prototype.set_cfg = function(path) {
    this.CFG = this.load(path);
};


AutoBase.prototype.load = function(path) {
    
    var obj;

    try {
        obj = JSON.parse(fs.readFileSync(path));
        if (!obj) {
            console.log('___error file 없음: '+ path + '___');
            throw new Error("에러!");
        }
    } catch(err) {
        gulpError('error 설정/패키지 읽기 실패 :' + err);
    }

    return obj;    
};


// TODO: 이부분 제거 가능 상위에 삽입
AutoBase.prototype.setTaskPrefix  = function(name) {
    if (name.length > 0 ) this.PREFIX_NM = name + ':';
};


/**
 * gulp 오류 출력
 * TODO: 위치 조정
 * @param {*} errName 오류 구분 명칭
 * @param {*} message 오류 메세지
 */
function gulpError(message, errName) {
    // 제사한 오류 출력
    // if (this.ERR_LEVEL === 1) {
    //     throw new gutil.PluginError({
    //         plugin: errName,
    //         message: message
    //     });                
    // } else {
        throw new Error(message);
    // }
}


module.exports  = AutoBase;