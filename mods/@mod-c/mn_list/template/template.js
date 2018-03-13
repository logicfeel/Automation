'use strict';

// gulp 4.0
var Auto            = require('../../../../');
var util            = require('util');

var hb              = require('gulp-hb');
var gulp            = require('gulp');  // gulp 4.0 기준
var mkdirp          = require('mkdirp');


// var writeJsonFile   = require('write-json-file');


function TemplateClass(tmp) {
    Auto.AutoTempalte.call(this, tmp);
    
    this.dirname = __dirname.replace(/\\/g,'/') + '/';
}
util.inherits(TemplateClass, Auto.AutoTempalte);


TemplateClass.prototype.getFooterPart = function(targetPath) {
    
    var _this = this;

    mkdirp(targetPath, function (err) {
        if (err) gulpError('디렉토리 생성 실패 (중복제외) :' + value.src + err);
        
        _this._compilePart('footer.hbs', targetPath);
    });
};

// // 사용자 정의 
// TemplateClass.prototype.getCompilePart = function(filename, targetPath) {
    
//     var _this = this;
    
//     mkdirp(targetPath, function (err) {
//         if (err) gulpError('디렉토리 생성 실패 (중복제외) :' + value.src + err);
        
//         _this._compilePart(filename, targetPath);
//     });
// };

// TemplateClass.prototype._compilePart = function(filename, targetPath) {
    
//     return gulp.src(this.dirname + 'parts/' + filename)
//         .pipe(hb({debug: true})
//             .partials(this.dirname + 'parts/**/*.hbs')
//             .helpers(this.dirname + '*.js')
//             .data(this.TMP)               // 패키지 정보
//         )
//         .pipe(gulp.dest(targetPath));

// };

module.exports = {
    TemplateClass: TemplateClass,
    PKG: require('../package.json')
};