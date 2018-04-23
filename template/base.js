'use strict';

var util                = require('util');
var BaseTemplate        = require('./BaseTemplate');

function TemplateClass() {
    BaseTemplate.call(this, __dirname);
    
    // this.PATT_GLOB['src']       = 'template/page/**/!(__*)*.hbs';
    // this.PATT_GLOB['part']      = 'template/part/**/!(__*)*.{hbs,js}';
    // this.PATT_GLOB['helper']    = 'template/helper/**/!(__*)*.js';
    // this.PATT_GLOB['decorator'] = 'template/decorator/**/!(__*)*.js';
    // this.PATT_GLOB['data']      = 'template/data/**/*.{js,json}';

    // this.REG_EXP['src'] = [/(?:.*template\/page\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'];
    // this.REG_EXP['part'] = [/(?:.*template\/part\/)([\w\/\-.@]*)(?:\.hbs|\.js)\b/gi, '$1'];
    // this.REG_EXP['data'] = [/(?:.*template\/data\/)([\w\/\-.]*)(?:\.js|\.json)\b/gi, '$1'];
    // this.REG_EXP['helper'] = [/(?:.*template\/helper\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];
    // this.REG_EXP['decorator'] = [/(?:.*template\/decorator\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];

    // this.PATH['src'] = 'template/page/';
    // this.PATH['src'] = 'src/';
}
util.inherits(TemplateClass, BaseTemplate);

TemplateClass.prototype.getDirname = function() {
    return __dirname;
};

TemplateClass.prototype.init = function() {
    BaseTemplate.prototype.init.call(this);
    
    console.log('TemplateClass.prototype.init');

    // var base2 = new TemplateClass2();
    // base2.init();

    var t = this.import('../temp2/base2', this);

    // this.data = {'abc': 'ddd'};
    
    // 네임스페이스 로딩
    this.using(t.namespace);
    
    this.src.add('add2', '동적으로 추가한 컨텐츠');
    this.src.add('addv2', './testjs');
    // this.src.add('testjs', '....');

    // var a = {A: 'aaa'};
    // a.get = function() {return 'kkk'};

    // console.log(a);

};

var base = new TemplateClass();
// base.init();



base.build();
// base2.build();

// ####################

// var t = base.import(base2);




// t.build();

// ####################





console.log('End');