'use strict';

// gulp 4.0
var gulp        = require('gulp');
// var Auto        = require('../../../index');
var Auto        = require('d:/PJ-GitHub/Automation#1.x.x-auto/index');

var m = new Auto.AutoModModel();
gulp.registry(m);


// module.exports = {
//     getTask: function() {
//         m.setTaskPrefix(prefix)
//     }
// };
module.exports = {
    obj: m,
    runTask: function(name) {
        gulp.series(name)();
        // m.series(name)();
    }
};
