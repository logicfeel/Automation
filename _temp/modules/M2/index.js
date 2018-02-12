'use strict';

var gulpfile        = require('./gulpfile.js'); 

// gulpfile();
// gulpfile.run();
// gulpfile.run('defaultss');

module.exports = function(prefixPath, destPath, task) {
    console.log('module/M1/index.js  loading <interface>');
    gulpfile(prefixPath, destPath, task);
};

