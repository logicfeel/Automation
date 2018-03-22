'use strict';



var util            = require('util');
var gulp            = require('gulp');  // gulp 4.0 기준
var DefaultRegistry = require('undertaker-registry');
var gutil           = require("gulp-util");
var replace         = require("gulp-replace");
var groupConcat     = require('gulp-group-concat');
var lazypipe        = require('lazypipe');

var AutoModule      = require('r.x.x-auto').AutoModule;


//#####################################
// AutoModModel
function AutoModModel(basePath, TemplateClass) {
    AutoModule.call(this, basePath, TemplateClass);
    
    this.PATT['src'] = 'src/**/*.sql';

    this.FILE_GROUP = {
        'ALL.sql': this.PATH.base + "src/**/*.sql",
        'U.sql': this.PATH.base + "src/*+(Table|U)/*.sql",
        'VW.sql': this.PATH.base + "src/*VW/*.sql",
        'FN.sql': this.PATH.base + "src/*FN/*.sql",
        'TF.sql': this.PATH.base + "src/*TF/*.sql",
        'TR.sql': this.PATH.base + "src/*TR/*.sql",
        'SP.sql': this.PATH.base + "src/*SP/*.sql",
        'ETC.sql': this.PATH.base + "src/*ETC/*.sql"
    };

    this.REG_EXP = {
        // USE [객체|DB명]
        USE_OBJ_NAME: /^\s*USE\s+((?:\[|")?(\w+)(?:\]|")?)\s+GO/g,    
        // 시스템 4줄 이상 주석 /****  ****/
        COMMENT: /\/\*{4,}.+\*{4,}\//g,                                     
        // 첫 공백
        FIST_SPACE: /^\s*/g,
        // 마지막 공백
        LAST_SPACE: /\s+$/g,
        // 마지막 2문자 (GO)
        LAST_GO: /..\s*$/g,                                                 
        /**
         * DDL 명령 alter => create
         * @param $1: CREATE | ALTER  
         * @param $2: TABLE | PROC | PROCEDURE | FUNCTION 
         */    
        DDL_COMMAND: /(alter|create)\s+(proc|procedure|function|table)(?!\s\S+\s*(add|with))/gi,
        /**
         * DDL create, alter "전체DDL문"  
         * @param $1: 객체명 + 접미사(.) + 타겟명
         * @param $2: 객체명 + 접미사(.)
         * @param $3: 객체명
         * @param $4: 타겟명 : 함수|프로시저|테이블명
         */
        DDL_ALL: /(?:(?:alter|create)\s+(?:proc|procedure|function|table)|references)\s+(((?:\[|")?(\w+)(?:\]|")?\.)?\[?(\w+)\]?)/gi,
        /**
         * DML SP 
         * @param $1: 객체명 + 접미사(.) + 타겟명
         * @param $2: 객체명 + 접미사(.)
         * @param $3: 객체명
         * @param $4: 타겟명 : 함수|프로시저|테이블명
         */
        DML_SP: /(?:EXEC|EXCUTE) +(?:@\w+\s*=\s*)?(((?:\[|")?(\w+)(?:\]|")?\.)?\[?(\w+)\]?)/gi,
        /**
         * DML FN 
         * @param $1: FUNCTION, TABLE 구분값 : 여부로 DDL, DML 구분 ## 필터링 후 사용 ##
         * @param $2: 객체명 + 접미사(.) + 타겟명
         * @param $3: 객체명 + 접미사(.)
         * @param $4: 객체명
         * @param $5: 타겟명 : 함수|프로시저|테이블명
         */
        DML_FN: /(\w+)?\s*(((?:\[|")?(\w+)(?:\]|")?\.)\[?(\w+)\]?)\s*\([^\)]*\)/gi,
        
        // 테스트 정규식
        // DDL create, alter "객체명사용목록"  $1: 전체명, $2: 객체명
        _DDL_OBJ: /(?:alter|create)\s+(?:proc|procedure|function|table)\s+(((?:\[|")?\w+(?:\]|")?\.)\[?\w+\]?)/gi,
        // 스칼라 함수 
        _SCALER: /[\S]+\.[\w]+\(.*\)/g,
        // DML_FN 조건 + "_FN" 이름 기준으로 찾기
        _DML_FN_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_FN\w+\]?)\s*\([^\)]*\)/gi,
        // DML_FN 조건 + "_TF" 이름 기준으로 찾기
        _DML_TF_NM: /(((?:\[|")?\w+(?:\]|")?\.)\[?\w+_TF\w+\]?)\s*\([^\)]*\)/gi
    };
}
util.inherits(AutoModModel, AutoModule);


AutoModModel.prototype.init = function(gulpInst) {
    AutoModule.prototype.init.call(this, gulpInst);
    if (this.LOG.debug) console.log('AutoModModel.prototype.init');

    gulpInst.task(this.PREFIX_NM + 'preinstall', gulpInst.series(
        this.__preinstall_cfg_build.bind(this), 
        this._save_cfg.bind(this)));
    
    gulpInst.task(this.PREFIX_NM + 'install', gulpInst.series(
        this._install_group.bind(this), 
        this._install_unit.bind(this)
        // , 
        // this._template_dist.bind(this),
        // this._template_publish.bind(this)
    ));
    
    gulpInst.task(this.PREFIX_NM + 'default', gulpInst.series(
        this.PREFIX_NM + 'preinstall', 
        this.PREFIX_NM + 'install',
        this.PREFIX_NM + 'template'
    ));
};


AutoModModel.prototype.preinstall = function preinstall(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.preinstall');
    
    return cb();
};


AutoModModel.prototype.install = function install(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.install');
    
    return cb();
};

AutoModModel.prototype.default = function (cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.default');
    
    return cb();
};


// 내부 클래스
/** 
 * --------------------------------------------------
 * install 공통
 * ! 파이프 파일을 통합하기 전에 이용
 */
AutoModModel.prototype.pipe_install_common = function pipe_install_common(cb) {
    
    var _this = this;
    var commonPipe = lazypipe()
        // DDL 명령 (create, alter)
        .pipe(replace, this.REG_EXP.DDL_COMMAND, function(match, p1, offset, string) {
            if (_this.CFG.options.ddl_create) {
                match = match.replace(p1, 'CREATE');
            }
            return match;
        })
        // DDL 구문 (객체명)
        .pipe(replace, this.REG_EXP.DDL_ALL, function(match, p1, p2, p3, p4, offset, string) {

            var _match;

            _match = _this.prefixNameBuild(match, p1, p2, p3, _this.CFG.obj_name, _this.CFG.options.obj_type);
            
            if (_this.CFG.prefix_name.length > 0 ||  _this.CFG.suffix_name.length > 0) {
                _match = _match.replace(p4, _this.CFG.prefix_name + p4 + _this.CFG.suffix_name);
            }
            return _match;
        })
        // DML 구문 (프로시저)
        .pipe(replace, this.REG_EXP.DML_SP, function(match, p1, p2, p3, p4, offset, string) {

            var _index = null;
            var _targetName = '';
            var _match = '';

            // _replace에서 타겟명 변경 안된것 처리
            if (_this.CFG.prefix_name.length > 0 ||  _this.CFG.suffix_name.length > 0) {
                _targetName = _this.CFG.prefix_name + p4 + _this.CFG.suffix_name;
                _match = match.replace(p4, _targetName);
            } else {
                _match = match;
            }

            if (_this.CFG.options.obj_fnc_type === 0) return _match;     // 유지 이후 처리 안함

            _this.CFG._replace.some(function(value, index, arr){
                if (value.string === match) {
                    _index = index;
                    return true;
                }
            });

            if (_index != null) {
                return _this.CFG._replace[_index].replacement;
            } else {
                return _match;
            }
        })
        // DML 구문 (스칼라, 테이블)
        .pipe(replace, this.REG_EXP.DML_FN, function(match, p1, p2, p3, p4, p5, offset, string) {

            var _match;
            var _index = null;

            if (_this.CFG.options.obj_fnc_type === 0) return match;     // 유지 이후 처리 안함

            if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION' ||
                p1.toUpperCase().trim() === 'REFERENCES') {
                return  match;
            } else {
                _this.CFG._replace.some(function(value, index, arr){
                    if (value.string === match) {
                        _index = index;
                        return true;
                    }
                });
                if (_index != null) _match = _this.CFG._replace[_index].replacement;    
            }
            return _match;
        })
        // USE [객체명]
        .pipe(replace, this.REG_EXP.USE_OBJ_NAME, function(match, p1, p2, offset, string) {

            var _match;

            if (_this.CFG.clear.use) return '';

            // 객체명 있는 경우 교체함
            _match = _this.prefixNameBuild(match, null, p1, p2, _this.CFG.obj_name, 3); 
            return _match;
        })
        // 주석 /** **/ 
        .pipe(replace, this.REG_EXP.COMMENT, function(match, p1, offset, string) {
            
            if (_this.CFG.clear.comment) return '';
            return match;
        })
        // 첫 빈줄 제거
        .pipe(replace, this.REG_EXP.FIST_SPACE, '')    
        // 마지막 빈줄 제거
        .pipe(replace, this.REG_EXP.LAST_SPACE, '')
        // 정규표현 : 마지막 GO
        .pipe(replace, this.REG_EXP.LAST_GO, function(match, p1, offset, string) {
            if (_this.CFG.options.last_go && match.trim() != 'GO') return match + '\n\nGO--Auto\n\n';
            else return match + '--End\n\n';
        })
        .pipe(this.pipe_cfg_replace, this);

        // return cb();
    return commonPipe();
}

AutoModModel.prototype.__preinstall_cfg_build = function __preinstall_cfg_build(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype.__preinstall_cfg_build');
    
    var _this = this;
    
    _this.CFG['_replace'] = [];
    _this.CFG.distPath = this.PATH.dist;

    return gulp.src(this.PATH.base + this.PATT['src'])
        .pipe(replace(this.REG_EXP.DML_SP, function(match, p1, p2, p3, p4, offset, string) {
                var objData = {};
                var _match;

                // 제외 조건 : 유지 + 객체 없음
                if (_this.CFG.options.obj_fnc_type === 1 && typeof p3 === 'undefined') return match;
                // 제외 조건 : 있을때만 교체 + 객체 없음
                if (_this.CFG.options.obj_fnc_type === 3 && typeof p3 === 'undefined') return match;

                _match = _this.prefixNameBuild(match, p1, p2, p3, _this.CFG.obj_name, _this.CFG.options.obj_fnc_type);

                if (_this.CFG.prefix_name.length > 0 ||  _this.CFG.suffix_name.length > 0) {
                    _match = _match.replace(p4, _this.CFG.prefix_name + p4 + _this.CFG.suffix_name);
                }
        
                objData = {
                    src: this.file.relative,
                    string: match,
                    replacement: _match
                };
                _this.CFG['_replace'].push(objData);

                return match;
            })
        )
        .pipe(replace(this.REG_EXP.DML_FN, function(match, p1, p2, p3, p4, p5, offset, string) {
                var objData = {};
                var _match;

                if (p1.toUpperCase().trim() === 'TABLE' || p1.toUpperCase().trim() === 'FUNCTION' ||
                    p1.toUpperCase().trim() === 'REFERENCES') {
                    return  match;
                }

                //  this.CFG.options.obj_fnc_type (* fn은 있을 경우만 교체)
                _match = _this.prefixNameBuild(match, p2, p3, p4, _this.CFG.obj_name, _this.CFG.options.obj_fnc_type);
                
                if (_this.CFG.prefix_name.length > 0 ||  _this.CFG.suffix_name.length > 0) {
                    _match = _match.replace(p5, this.CFG.prefix_name + p5 + _this.CFG.suffix_name);
                }

                objData = {
                    src: this.file.relative,
                    string: match,
                    replacement: _match
                };
                _this.CFG["_replace"].push(objData);

                return match;
            })
        );    
};


AutoModModel.prototype._install_group = function _install_group(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype._install_group');

    var _this = this;

    if (!this.CFG.options.intall_group)  return cb();

    return gulp.src(this.PATH.base + this.PATT['src'])
        .pipe(_this.pipe_install_common())
        .pipe(groupConcat(_this.FILE_GROUP))          // REVEIW: 이전에 gulp.dest 하면 없어짐
        .pipe(gulp.dest(_this.PATH.base + _this.PATH.dist));
};


AutoModModel.prototype._install_unit = function _install_unit(cb) {
    if (this.LOG.debug) console.log('AutoModModel.prototype._install_unit');

    var _this = this;

    if (!this.CFG.options.intall_unit) return cb();

    return gulp.src(this.PATH.base + this.PATT['src'])
        // .pipe(_this.pipe_install_common())
        .pipe(gulp.dest(_this.PATH.base + _this.PATH.dist));    
};


/**
 * gulp 오류 출력
 * TODO: 위치 조정
 * @param {*} errName 오류 구분 명칭
 * @param {*} message 오류 메세지
 */
function gulpError(message, errName) {
    // 제사한 오류 출력
    // if (this.ERR_LEVEL === 1) {
    //     throw new gutil.PluginError({
    //         plugin: errName,
    //         message: message
    //     });                
    // } else {
        throw new Error(message);
    // }
}


module.exports = AutoModModel;