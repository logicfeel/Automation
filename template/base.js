'use strict';

var util                = require('util');
var BaseTemplate        = require('./BaseTemplate');

function BaseClass() {
    BaseTemplate.call(this);
    
    this.PATT_GLOB['src']       = 'template/page/**/!(__*)*.hbs';
    this.PATT_GLOB['part']      = 'template/part/**/!(__*)*.{hbs,js}';
    this.PATT_GLOB['helper']    = 'template/helper/**/!(__*)*.js';
    this.PATT_GLOB['decorator'] = 'template/decorator/**/!(__*)*.js';
    this.PATT_GLOB['data']      = 'template/data/**/*.{js,json}';

    this.REG_EXP['src'] = [/(?:.*template\/page\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'];
    this.REG_EXP['part'] = [/(?:.*template\/part\/)([\w\/\-.@]*)(?:\.hbs|\.js)\b/gi, '$1'];
    this.REG_EXP['data'] = [/(?:.*template\/data\/)([\w\/\-.]*)(?:\.js|\.json)\b/gi, '$1'];
    this.REG_EXP['helper'] = [/(?:.*template\/helper\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];
    this.REG_EXP['decorator'] = [/(?:.*template\/decorator\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];

    this.PATH['src'] = 'template/page/';
}
util.inherits(BaseClass, BaseTemplate);

BaseClass.prototype.init = function() {
    BaseTemplate.prototype.init.call(this);
    
    console.log('BaseClass.prototype.init');

    var base2 = new BaseClass2();
    base2.init();

    var t = this.import(base2, this);

    // this.data = {'abc': 'ddd'};
    
    this.src.add('add2', '동적으로 추가한 컨텐츠');
    this.src.add('addv2', './testjs');
    // this.src.add('testjs', '....');

    // var a = {A: 'aaa'};
    // a.get = function() {return 'kkk'};

    // console.log(a);

};


// ################################

function BaseClass2() {
    BaseTemplate.call(this);
    
    this.PATT_GLOB['src']       = 'temp2/page/**/!(__*)*.hbs';
    this.PATT_GLOB['part']      = 'temp2/part/**/!(__*)*.{hbs,js}';
    this.PATT_GLOB['helper']    = 'temp2/helper/**/!(__*)*.js';
    this.PATT_GLOB['decorator'] = 'temp2/decorator/**/!(__*)*.js';
    this.PATT_GLOB['data']      = 'temp2/data/**/*.{js,json}';

    this.REG_EXP['src'] = [/(?:.*temp2\/page\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'];
    this.REG_EXP['part'] = [/(?:.*temp2\/part\/)([\w\/\-.@]*)(?:\.hbs|\.js)\b/gi, '$1'];
    this.REG_EXP['data'] = [/(?:.*temp2\/data\/)([\w\/\-.]*)(?:\.js|\.json)\b/gi, '$1'];
    this.REG_EXP['helper'] = [/(?:.*temp2\/helper\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];
    this.REG_EXP['decorator'] = [/(?:.*temp2\/decorator\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];
}
util.inherits(BaseClass2, BaseTemplate);

// ####################

var base = new BaseClass();
base.init();



base.build();
// base2.build();

// ####################

// var t = base.import(base2);




// t.build();

// ####################





console.log('End');