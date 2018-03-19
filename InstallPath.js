'use strict';

var path            = require('path');


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

/**
 * 인스톨 정보(경로) 구성 클래스
 * 
 * InstallPath('node_modules/module_m/dist/ALL.sql', 'dist', 'install', ''node_modules/module_m')
 * InstallPath('[...]', 'dist', 'install', ''node_modules/module_m')
 * @param {*} original  대상 경로 + 파일명 (타입 : Array, String)
 * @param {*} source    경로명
 * @param {*} target    (*선택) 타겟(설치) 경로명
 * @param {*} basePath  (*선택) original 경로에서 제거되는 경로
 */
function InstallPath(original, source, target, basePath, parentInstallPath) {
    
    this.source = source ? this._trimPath(source) : '';
    this.target = target ? this._trimPath(target) : '';
    this.file = {};
    this.path = [];
    this._parent = parentInstallPath;
    this.basePath = basePath ? basePath : '';
    
    if (this.basePath.length > 0) {
        this.basePath = basePath.indexOf('\\') > -1 ? basePath.replace(/\\/g, '/') : basePath;
    }

    var _format;
    
    if (original) {
        if (Array.isArray(original)) {
            for (var i = 0; i < original.length; i++) {
                _format = this.pathFormat(original[i]);
                this.add(_format);
            }
        } else {
            _format = this.pathFormat(original);
            this.add(_format);
        }
    }
}
(function() {
    
    // TODO: trimPath 명으로 변경
    InstallPath.prototype._trimPath = function(path) {
        return path.replace('/', '');
    };

    // TODO: dir 깊이 0 이하일 경우 예외 처리?
    InstallPath.prototype.add = function(format) {

        var _sursor;
        var _next;
        var _nextFormat;
        var _install;

        // 1. 현재 위치의 파일일 경우
        if (this.source === format.dirs[0] && format.depth === 1) {
            this.file[format.filename] = '';
        } else {

            if (format.depth < 1) {
                gulpError('하위 폴더가 없습니다.'); 
            }

            _sursor     = this.contains(format.dirs[1]);
            _next       = this.nextSource(format.path);
            _nextFormat = this.pathFormat(_next.string);

            // 2. 자식중에 위치가 있는 경우 (하위 재귀적 호출)
            if (_sursor > -1) {
                // 찾아서 넣어야함
                this.path[_sursor].add(_nextFormat);

            // 3. 자식에 없는 경우 (신규 생성)
            } else {
                _install = new InstallPath(_next.string, _next.source, _next.source, '', this);
                
                // 4. 자식에 하위가 있는 경우 
                if (_next.depth > 1) {
                    _install.add(_nextFormat);
                }
                
                this.path.push(_install);
            }
        }
    };

    // 자식에 유무 검사
    InstallPath.prototype.contains = function(source) {

        var sursor = -1;

        for (var ii = 0; ii < this.path.length; ii++) {
            if (this._trimPath(this.path[ii].source) === source) sursor = ii;
        }

        return sursor;
    };

    // 다음 폴더 조회 (리턴)
    InstallPath.prototype.nextSource = function(pathStr) {

        var arrPath = pathStr.split('/');
        var nextString;
        var nextPath;

        if (arrPath.length > 0 && arrPath[0] === '') {
            arrPath = arrPath.slice(1);   // 공백일 경우 첫 배열 삭제
        }

        nextString = arrPath.slice(1).join('/');
        nextPath = arrPath.slice(1, 2).toString();
        
        return {
            string: nextString,
            source: nextPath
        };
    };

    // path 포멧 리턴
    InstallPath.prototype.pathFormat = function(pathStr) {

        var _dir;
        
        if (pathStr.indexOf('\\') > -1) {
            pathStr = pathStr.replace(/\\/g, '/');   
        }

        // 기본 경로 제거
        pathStr = pathStr.replace(this.basePath, '');    
        
        _dir = pathStr.split('/');

        // 공백일 경우 첫 배열 삭제
        if (_dir.length > 0 && _dir[0] === '') {
            _dir = _dir.slice(1);   
        }

        pathStr = _dir.join('/');

        return {
            path: pathStr,
            dirname: path.dirname(pathStr),
            filename: path.basename(pathStr),
            depth: _dir.length - 1,
            dirs: _dir
        };
    };

    // path 포멧 리턴
    InstallPath.prototype.getObject = function() {
        
        var obj     = {};

        for (var prop in this) {
            if (typeof this[prop] !== "function") {

                // path 는 배열 InstallPath 객체 
                if (prop === 'path') {
                    obj[prop] = [];
                    for (var ii = 0; ii < this.path.length; ii++) {
                        obj[prop].push(this.path[ii].getObject());
                    }                
                
                // source 속성
                } else if (prop === 'source') {    
                    // REVIEW : 소스는 동적으로 실제 경로를 가져옴                
                    obj[prop] = this.getSource();   
                
                // 내부 속성은 제외
                } else if (prop.substr(0,1) != '_') {
                    obj[prop] = this[prop];
                }
            }
        }
        return obj;

    };

    InstallPath.prototype.getSource = function() {
        
        var _source = this.source;

        if (this._parent) {
            _source = this._parent.getSource() + '/' + _source;
        }
        return _source;
    };

    InstallPath.prototype.getTarget = function() {
        
        var _target = this.target;

        if (this._parent) {
            _target = this.rPathTrim(this._parent.getTarget()) + '/' + _target;
        }
        return _target;
    };

    InstallPath.prototype.rPathTrim = function(p_path) {
        
        if (typeof p_path === 'string') {
            if (p_path.charAt(p_path.length - 1) === '/') {
                p_path = p_path.substr(0, p_path.length - 1);
            }
        }
        return p_path;
    };


    InstallPath.prototype.getBasePath = function() {
        
        var _base;

        if (this.basePath) {
            _base = this.basePath;
        } else if (this._parent) {
            _base = this._parent.getBasePath();
        }
        return _base;
    };

    InstallPath.prototype.getInstall = function() {
        
        var arr = [];
        var target;
    
        for (var prop in this) {
            if (typeof this[prop] !== "function") {
 
                // file
                if (prop === 'file') {

                    for (var prop2 in this[prop]) {
                        var obj = {};
                        
                        // REVIEW this.rPathTrim 공통으로 뽑아야 하는지?
                        obj.src = this.rPathTrim(this.getBasePath()) + '/' + this.source + '/' + prop2;
                        target = this[prop][prop2] != '' ? this[prop][prop2] : prop2;
                        obj.dest = this.rPathTrim(this.getTarget()) + '/' + target;
                        arr.push(obj);
                    }
                
                // path
                } else if (prop === 'path') {

                    for (var ii = 0; ii < this.path.length; ii++) {
                        arr = arr.concat(this.path[ii].getInstall());
                    }
                }
            }
        }
        return arr;
    };


    InstallPath.prototype.reset = function() {

        this.source = '';
        this.target = '';
        this.file = {};
        this.path = [];
        this.basePath = '';
        this._parent = null;
    };

    InstallPath.prototype.load = function(obj, parent) {
        
        var _obj;
        var _install;

        if (!(obj instanceof Object)) {
            throw new Error('Object 객체가 아닙니다.');
        }

        if (parent && !(parent instanceof InstallPath)) {
            throw new Error('InstallPath 객체가 아닙니다.');
        }
        // _obj = JSON.parse(JSON.stringify(obj));
        // TODO: 참조 부분 끊게 만들어야 함

        _obj = obj;

        this.source     = _obj.source;
        this.target     = _obj.target;
        this.file       = _obj.file;
        this.basePath  = _obj.basePath;
        this._parent    = parent;

        for (var i = 0; i < _obj.path.length; i++) {
            _install = new InstallPath();
            _install.load(_obj.path[i], this);
            this.path.push(_install);
        }

        return this;
    };

    module.exports.InstallPath = InstallPath;

}());