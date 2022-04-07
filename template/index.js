'use strict';

var BaseTemplate        = require('./BaseTemplate');

var bt = new BaseTemplate(__dirname);

// bt.PATT_GLOB['src']       = 'template/page/**/!(__*)*.hbs';
// bt.PATT_GLOB['part']      = 'template/part/**/!(__*)*.{hbs,js}';
// bt.PATT_GLOB['helper']    = 'template/helper/**/!(__*)*.js';
// bt.PATT_GLOB['decorator'] = 'template/decorator/**/!(__*)*.js';
// bt.PATT_GLOB['data']      = 'template/data/**/*.{js,json}';

// bt.REG_EXP['src'] = [/(?:.*template\/page\/)([\w\/\-.@]*)(?:\.hbs)\b/gi, '$1'];
// bt.REG_EXP['part'] = [/(?:.*template\/part\/)([\w\/\-.@]*)(?:\.hbs|\.js)\b/gi, '$1'];
// bt.REG_EXP['data'] = [/(?:.*template\/data\/)([\w\/\-.]*)(?:\.js|\.json)\b/gi, '$1'];
// bt.REG_EXP['helper'] = [/(?:.*template\/helper\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];
// bt.REG_EXP['decorator'] = [/(?:.*template\/decorator\/)([\w\/\-.]*)(?:\.js)\b/gi, '$1'];

// bt.PATH['src'] = 'template/page/';
bt._isWrite = true;
bt.data2 = {in: "index"};

bt.build();

console.log('-End');

