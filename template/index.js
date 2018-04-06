'use strict';

var handlebars      = require('handlebars');
var handlebarsWax   = require('handlebars-wax');
var fs              = require('fs');
var path            = require('path');

var AutoTemplate    = require('./AutoTemplate');

function AutoBase() {

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

    // 파일명
    this.FILE = {
        CFG: 'auto_module.json',
        PKG: 'package.json',
        MAP: 'installemap.json',
        GULP: 'gulpfile.js'
    };

    
    this.PATH = {
        base: '',
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

    this.TMP = new AutoTemplate(this);

}

AutoBase.prototype._template_publish = function _template_publish(cb) {

    // var hbObj = this.getTemplateObj();

    var hbObj = this.TMP._public.getTemplateInfo();

    // // TODO: 아래 부분이 중복됨
    // return gulp.src(this.PATH['base']  + this.PATT_GLOB['page'])
    //     .pipe(hb({debug: this.LOG['debug']})
    //         .partials(hbObj.part)
    //         .helpers(hbObj.helper)
    //         .decorators(hbObj.decorator)
    //         .data(hbObj.data)
    //         .data(this.PATH['base'] + this.FILE['PKG'])               // 패키지 정보
    //         .data(this.PATH['base'] + this.FILE['CFG'])               // 설정 정보 (auto_module.json)
    //     )
    //     .pipe(rename({extname: ''}))                            // 파일명.확장자.hbs
    //     .pipe(gulp.dest(this.PATH['base'] + this.PATT_GLOB['dist'])
    // );
    // var content = fs.readFileSync(pPath);


    for(var i = 0; i < this.TMP.page.length; i++) {

        var hb = handlebars.create();
        var wax = handlebarsWax(hb);

        // 전역
        wax.partials(hbObj.part);
        wax.helpers(hbObj.helpers);
        wax.decorators(hbObj.decorator);
        wax.data(hbObj.data);
   
        // 지역
        wax.partials(this.TMP.page[i]._part);
        wax.helpers(this.TMP.page[i]._helper);
        wax.decorators(this.TMP.page[i]._decorator);
        wax.data(this.TMP.page[i]._data);

        var template = wax.compile(this.TMP.page[i].content);
        
        console.log(template());
    }




    // var h = Handlebars.create();
    // // 전역, 지역
    // h.registerPartial();    
    // h.registerHelper();

    // data 는 병합
    // var template = wax.compile('{{>ccc}} {{lorem}} {{ipsum}} {{>ccc}}');
    // // var template = h.compile('abc {{foo}} aaa');
    // var result = template({foo: "VVV"});
    // fs.writeFileSync(this.pathInfo.savePath, result);   // TODO: 상위 속성으로 변경


};

// AutoBase.prototype.getTemplateObj = function getTemplateObj() {
    
//     var i = 0;
//     var _part = {};
//     var _helper = {};
//     var _decorator = {};
//     var _data = {};
//     var _propName = '';
//     var _dirname = '';
//     var _basename = ''

//     // gulp-hp 전달 객체 조립 
//     for(i = 0 ; this.TMP && i < this.TMP.part.length; i++) {
//         _dirname = path.dirname(path.relative(this.PATH['template_part'], this.TMP.part[i].path));
//         _dirname  = _dirname === '.' ? '' : _dirname;   // 현재 디렉토리 일 경우 
//         _dirname  = _dirname != '' ? _dirname + '/' : _dirname;
//         _basename =  path.basename(this.TMP.part[i].path, this.PATT_GLOB['ext']);  // 확장자 제거(.hbs)
        
//         _part[_dirname + _basename] = this.TMP.part[i].content.toString();
//     }

//     // REVEIW: 아래 문법이 무난? 검토 _helper = this.TMP ? Object.assign({}, this.TMP.helper.slice(0, this.TMP.helper.length - 1)) : {};
//     for(i = 0 ; this.TMP && i < this.TMP.helper.length; i++) {
//         _helper = Object.assign(_helper, this.TMP.helper[i]);
//     }

//     for(i = 0 ; this.TMP && i < this.TMP.decorator.length; i++) {
//         _decorator = Object.assign(_decorator, this.TMP.decorator[i]);
//     }

//     for(i = 0 ; this.TMP && i < this.TMP.data.length; i++) {
//         _data = Object.assign(_data, this.TMP.data[i]);
//     }
//     return {
//         part: _part,
//         helper: _helper,
//         decorator: _decorator,
//         data: _data
//     }
// };


var auto = new AutoBase();

auto._template_publish();

console.log('End');