'use strict';

var gulpfile        = require('./gulpfile.js'); 

// gulpfile();
// gulpfile.run();
// gulpfile.run('defaultss');

module.exports = function(setup) {
    console.log('module/M1/index.js  loading');
    // gulpfile.run('defaultss');
    gulpfile(setup);
};

