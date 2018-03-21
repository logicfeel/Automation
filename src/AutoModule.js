'use strict';

var util            = require('util');
var through         = require('through2');

var AutoBase        = require('./AutoBase');


//#####################################
// AutoModule
function AutoModule(basePath, TemplateClass) {
    AutoBase.call(this, basePath, TemplateClass);

    this.AUTO_TYPE = 'M';
    // 오버라이딩
    this.PATH['dist'] = 'dist/';
}
util.inherits(AutoModule, AutoBase);


AutoModule.prototype.init = function(gulpInst) {
    AutoBase.prototype.init.call(this, gulpInst);
    if (this.LOG.debug) console.log('AutoModule.prototype.init');
    
};


AutoModule.prototype.pipe_cfg_replace = function(p_this) {
    
    var _this = p_this;

    return through.obj(function(file, enc, cb) {
        var result;
        var filePath = String(file.relative);
        
        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }else if(file.isBuffer()) {
            result = String(file.contents);
            _this.CFG.replace.forEach(function(value, index, arr) {
                
                // REVIEW:  !! JSON 파일은 정규식 지원 안함
                if ((value.src instanceof RegExp && filePath.search(value.src) > -1) ||
                    value.src === filePath || value.src.length === 0) {
                    result = result.replace(value.string, value.replacement);
                }
            });
        }

        // if (file.isStream()) {
        //   file.contents = file.contents.pipe(prefixStream(prefixText));
        // }
        
        // 파이프 파일에 저장
        file.contents = new Buffer(result);

        cb(null, file);
    });
    // return through.obj();
};


/** 
 * --------------------------------------------------
 * 객체명 교체
 * @param fullName:     (*필수) 원본이름 
 * @param prefix:       (*선택) 객체명 + 접두사(.) + 타겟명
 * @param suffix:       (*선택) 객체명 + 접미사(.)
 * @param obj:          (*선택) 객체명 
 * @param replacement:  (*필수) 교체할 객체명 
 * @param flag:         (*필수) 0:유지, 1: 제거, 2: 교체,  3:교체(있을때만) * FN 에서 사용
 * 
 * @return 변경된 fullName
 */
AutoModule.prototype.prefixNameBuild = function(fullName, prefix, suffix, obj, replacement, flag) {

    var _fullName;

    if (flag === 1 ) {          // 제거
        _fullName = fullName.replace(suffix, '');
    } else if (flag === 2) {    // 교체(일괄)
        if (typeof obj === 'undefined' || obj.trim() === '') {
            _fullName = replacement + '.' + prefix;
            _fullName = fullName.replace(prefix, _fullName);
        } else {
            _fullName = suffix.replace(obj, replacement);
            _fullName = fullName.replace(suffix, _fullName);
        }        
    } else if (flag === 3) {    // 3:교체(있을때만)
        if (typeof obj !== 'undefined') {
            _fullName = suffix.replace(obj, replacement);
            _fullName = fullName.replace(suffix, _fullName);
        }
    }
    return _fullName;
};


module.exports = AutoBase;

