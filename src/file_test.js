var fileMap = [];


class FileInfo {
    constructor(filename, content) {
        // 원본 전체 경로
        this.fullPath = '';        
        // 파일명
        this.filename = filename || '';
        // 원본 파일 내용
        this.content = content || '';
        // 참조 파일
        this.ref = [];
        // 목적파일
        // this.target = {
        //     dist: '/dist',          // 자신 경로 기준
        //     depend: '/depend',      // 자신의 경로 기준
        //     install: '/install',    // 엔트리 경로 기준
        // },
        this.target = {
            dist: { path: '/dist', name: this.filename },
            depend: { path: '/depend', name: this.filename },
            install: { path: '/install', name: this.filename },
        }
    }
    /**
     * 
     * @param {*} org 원본 타입
     * @param {*} tag 목적 위치
     */
    copy(org, tar) {
        var obj = {
            file: '',
            ref: []
        };

        // 원본 복사
        obj.file  = this.target[org].path + '/' + this.target[org].name;
        // 참조 정보
        for(var i =0; i < this.ref.length; i++) {
            obj.ref.push(this.ref[i].target[tar].path + '/' + this.ref[i].target[tar].name );
        }
        fileMap.push(obj);
    }
}

var f1 = new FileInfo('f1.html');
var f2 = new FileInfo('f2.html');
var f3 = new FileInfo('f3.html');

f1.ref.push(f2);
f1.ref.push(f3);
f2.ref.push(f3);

f1.target.install.name = 'Copy_' + f1.target.install.name;
f2.target.install.name = 'Copy_' + f2.target.install.name;

// 시연

// dist 의 경우
f1.copy('dist', 'dist');    // 엔트리 포인트
f2.copy('dist', 'dist');
f3.copy('dist', 'dist');

// dist 의 경우

f1.copy('install', 'install');  // 엔트리 포인트
f2.copy('install', 'install');
f3.copy('install', 'install');


console.log(1)