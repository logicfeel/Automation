'use strict';

var LocalSource    = require('./src/depends').LocalSource;


var i = new LocalSource();



// 사용사례


var use = require('./test1/meta.json');


console.log('index.js...');
// console.log( require( "./package.json" ) );
console.log( use );

module.exports = {};