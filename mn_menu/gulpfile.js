'use strict';

// gulp 4.0
var gulp        = require('gulp');

var auto        = require('.');

gulp.registry(auto.obj);


// // module.exports = {
// //     getTask: function() {
// //         m.setTaskPrefix(prefix)
// //     }
// // };
// module.exports = {
//     obj: m,
//     runTask: function(name) {
//         gulp.series(name)();
//         // m.series(name)();
//     }
// };
