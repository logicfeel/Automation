'use strict';

var util                = require('util');
var BaseTemplate        = require('./BaseTemplate');

function BaseClass() {
    BaseTemplate.call(this);
    
    this.PATT_GLOB['src']       = 'template/page/**/!(__*)*.hbs';
    this.PATT_GLOB['part']      = 'template/part/**/!(__*)*.hbs';
    this.PATT_GLOB['helper']    = 'part/**/!(__*)*.{hbs,js}';
    this.PATT_GLOB['decorator'] = 'template/decorator/**/!(__*)*.js';
    this.PATT_GLOB['data']      = 'template/data/**/*.{js,json}';

}
util.inherits(BaseClass, BaseTemplate);

var base = new BaseClass();
base.init();

base.build();

console.log('End');