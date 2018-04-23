'use strict';

var util                = require('util');
var BaseTemplate        = require('../template/BaseTemplate');


// ################################

function TemplateClass2() {
    BaseTemplate.call(this, 'temp2/');
    
    this.PATH['src'] = 'page/';
    // this.PATT_GLOB['src']       = 'temp2/page/**/!(__*)*.hbs';
    // this.PATT_GLOB['part']      = 'temp2/part/**/!(__*)*.{hbs,js}';
    // this.PATT_GLOB['helper']    = 'temp2/helper/**/!(__*)*.js';
    // this.PATT_GLOB['decorator'] = 'temp2/decorator/**/!(__*)*.js';
    // this.PATT_GLOB['data']      = 'temp2/data/**/*.{js,json}';

    // this.REG_EXP['src'] = [/(?:.*temp2\/page\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'];
    // this.REG_EXP['part'] = [/(?:.*temp2\/part\/)([\w\/\-.@]*)(?:\.hbs|\.js)\b/gi, '$1'];
    // this.REG_EXP['data'] = [/(?:.*temp2\/data\/)([\w\/\-.]*)(?:\.js|\.json)\b/gi, '$1'];
    // this.REG_EXP['helper'] = [/(?:.*temp2\/helper\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];
    // this.REG_EXP['decorator'] = [/(?:.*temp2\/decorator\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];
}
util.inherits(TemplateClass2, BaseTemplate);


module.exports = TemplateClass2;