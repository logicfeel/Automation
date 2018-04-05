'use strict';

var AutoTemplate        = require('./AutoTemplate');
var TemplateCollection  = require('./TemplateCollection');
var TemplateSource      = require('./TemplateSource');

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

    this.TMP = new AutoTemplate(this);

}

console.log('End');