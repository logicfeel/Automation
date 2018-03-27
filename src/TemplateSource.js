
'use strict';

var fs              = require('fs');
var util            = require('util');
var glob            = require('glob'); 
var hb              = require('gulp-hb');


function TemplateSource(pAutoTemplate, pPath, pPathInfo, pContent) {
    
    // TODO: 예외 검사
    this._AutoTemplate = pAutoTemplate;
    this.path = pPath;          // 조각 경로 (호출기준)

    // TODO:
    this.absolute;  // 절대주소
    this.relative;  // 상대주소

    // this.code = pCode;
    this.content = pContent;    // 조각내용 string
    this.pathInfo = pPathInfo;
    
    this._part = null;
    this._data = null;
    this._helper = null;
    this._decorator = null;

    try {

        fs.accessSync(pPath, fs.constants.R_OK);
        this.content = fs.readFileSync(pPath);

    } catch (err) {

        if (err.code === 'ENOENT') {
            try {
                fs.writeFileSync(this.pathInfo.savePath, this.content);   // TODO: 상위 속성으로 변경
            } catch (err) {
                gulpError('error 템플릿 소스 쓰기 실패 :' + this.pathInfo.savePath, 'TemplateSource');    
            }
        } else {
            gulpError('error 템플릿 소스 읽기 실패 :' + pPath, 'TemplateSource');
        }
    }
};

TemplateSource.prototype.compile = function(data) {

    // var args = Array.prototype.slice.call(arguments);
    // var compilePath = '@compile';
    var AutoBase = this._AutoTemplate._AutoBase;
    var pathBase = AutoBase.PATH.base;
    var _saveDir = '';
    var _this = this;
    var _dirname;

    // TODO: pCode 추소 검토 그리고 코드 값 this.AutoBase 참조 방식으로 변경
    if (this.code == 'src') {
        // _saveDir = 'src/';
        _saveDir = AutoBase.PATH['src'];
    } else if  (this.code == 'part') {
        // _saveDir = 'template/parts/';
        _saveDir = AutoBase.PATH['template_part'];
    } else if  (this.code == 'page') {
        // _saveDir = 'template/';
        _saveDir = AutoBase.PATH['template_page'];
    }
    
    // REVIEW: path 도 상대주소로 가져와야 할지?
    _dirname = path.relative(_saveDir, path.dirname(this.path));
    _dirname = _dirname ? _dirname + '/' : '';
    _saveDir = _saveDir + AutoBase.PATH['compile'] + _dirname;

    // REVIEW: 파라메터 값을로 읽어와야 함 
    return gulp.src(this.path)
        .pipe(hb({ debug: AutoBase.LOG['debug'] })
            // 아규먼트
            .data(data)
            // 패키지 정보
            .data(pathBase + AutoBase.FILE['PKG'])
            // 기본 정보 로딩 (glob경로)
            .partials(pathBase  + AutoBase.PATT_GLOB['part'])
            .decorators(pathBase + AutoBase.PATT_GLOB['decorator'])
            .helpers(pathBase + AutoBase.PATT_GLOB['helper'])
            .data(pathBase + AutoBase.PATT_GLOB['data'])
            // 조각 추가 정보 로딩 (배열 glob 경로)
            .partials(_this._part)
            .decorators(_this._decorator)
            .helpers(_this._helper)
            .data(_this._data)
        )
        .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
        .pipe(gulp.dest(pathBase + _saveDir)
    );
};


TemplateSource.prototype.partials = function(pattern) {
    this._part = this._part ? this._part : [];
    this._part.push(pattern);
};


TemplateSource.prototype.data = function(pattern) {
    this._data = this._data ? this._data : [];
    this._data.push(pattern);
};


TemplateSource.prototype.helpers = function(pattern) {
    this._helper = this._helper ? this._helper : [];
    this._helper.push(pattern);
};


TemplateSource.prototype.decorators = function(pattern) {
    this._decorator = this._decorator ? this._decorator : [];
    this._decorator.push(pattern);
};

// REVEIW: 제거 하는 메소드도 넣어야 할듯


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

module.exports  = TemplateSource;