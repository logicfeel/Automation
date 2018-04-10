'use strict';

var util                = require('util');
var copyFileSync        = require('fs-copy-file-sync');     // node 에 기본 추가됨
var fs                  = require('fs');

var BaseCollection      = require('./BaseCollection');
var TemplateSource      = require('./Sources').TemplateSource;


function LocalCollection(pAttr, pAutoTemplate) {
    BaseCollection.call(this, pAttr, pAutoTemplate);

    // this._AutoTemplate = pAutoTemplate;
    this._Ext_JS = /\.js$/;
}
util.inherits(LocalCollection, BaseCollection);

/**
 * 로컬 컬렉션 추가
 * @param {String, id, LocalCollection, TemplateSource} pAttr     
 *      - String : 속성명(가상)  ex> abc/bcde
 *      - id : require ID 개념 동적으로 추가할 경우 파이롤 분리해서 로딩 (arg[1] 무시됨)
 *      - LocalCollection : 컬렉션의 모든 값 복제 및 파일 복사 (arg[1] 무시됨)
 *      - TemplateSource : TS 복제 및 파일 복사 (arg[1] 무시됨)
 * @param {undefined, TemplateSource, String, Function} pContent  
 *      - undefined : arg[0] 이 String이 아닌 경우,  *예외처리함
 *      - TemplateSource :  TS 복제 및 파일 복사
 *      - String : 컨텐츠 본문으로 삽입됨 (.hbs, return 'str')
 *      - Function : 함수 수행후 리턴 String 을 통해서 2차 파싱함
 */
LocalCollection.prototype.add = function(pAttr, pContent) {

    var pathInfo = this.getPathInfo(this._SCOPE, pAttr);
    var content;

    // if (typeof pContent === 'string') {
    //     _obj2 = require.resolve(pContent) === '' ? {} : require(pContent);
    // } else if (typeof pContent === 'object') {
    //     _obj2 = pContent;
    // }


    // 1-1. 동적 로딩 (require) 확장자가 .js  경우
    if (this._Ext_JS.exec(pAttr)) {
        content = require(pAttr);
    } else {
        try {
            // 1-2. 정적 파일 *.*  (*.js제외)
            content = fs.readFileSync(pAttr);
        } catch (err) {
    
            // 1-(3,4). String, Object 인 경우
            if (!(pContent instanceof TemplateSource)) {
                content = pContent ? pContent : '';
            }
        }
    }

    this.pushAttr(
        new TemplateSource(this._BaseTemplate, pathInfo.attrName, pathInfo.loadPath, content),
        pathInfo.attrName,
        null,                       // Getter
        /** 
         * Setter
         * @param {TemplateSource, String, Function} newValue
         *      - 1. TemplateSource : 의 복제 내용과 연결
         *      - 2. String : 컨텐츠 본문에 삽입
         *      - 3. Function : 함수 수행후 리턴 String 을 통해서 2차 파싱함
         *                  module.exports일 경우 단일 
         */
        function(pIdx, newValue) {  // Setter

            // 1. TemplateSource 를 삽입한경우
            if (newValue instanceof TemplateSource) {
                
                // 객체 복제
                this._items[pIdx] = newValue.clone(pathInfo.attrName, pathInfo.savePath);
                
                // 파일 복사
                copyFileSync(newValue.path, pathInfo.savePath);
            
            // 2/3. : String
            } else if (newValue instanceof String ||  newValue instanceof Function) {
                this._items[pIdx].content = newValue;
            
            } else {
                throw new Error('입력 타입 오류 :' + typeof newValue);
            }
        }
    );
    
    // 1-5 content 가 TemplateSource 인 경우 (pushAttr.setter호출됨 )
    if (pContent instanceof TemplateSource) {
        this[pathInfo.attrName] = pContent;
    }
    
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


module.exports = LocalCollection;
