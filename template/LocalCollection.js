'use strict';

var util                = require('util');
var copyFileSync        = require('fs-copy-file-sync');     // node 에 기본 추가됨
var fs                  = require('fs');

var BaseCollection      = require('./BaseCollection');
var TemplateSource      = require('./Sources').TemplateSource;


function LocalCollection(pAttr, pBaseTemplate) {
    BaseCollection.call(this, pAttr, pBaseTemplate);

    // this._AutoTemplate = pAutoTemplate;
    this._Ext_JS = /\.js$/i;
    this._Ext_HBS = /\.hbs$/i;
}
util.inherits(LocalCollection, BaseCollection);

/**
 * 로컬 컬렉션 추가
 * @param {String, LocalCollection, TemplateSource} pAttr     속성의 명칭 정보 포함
 *      - String : 
 *          + 파일경로(.hbs) : 파일 읽기
 *          + 가상명 : 가상 파일 ex> abc/bcde
 *      - LocalCollection : 컬렉션의 모든 값 복제 및 파일 복사 (arg[1] 무시됨)
 *      - TemplateSource : TS 복제 및 파일 복사 (arg[1] 무시됨)
 * @param {undefined, String, TemplateSource, Function} pContent  내용
 *      - undefined : arg[0] 이 String이 아닌 경우,  *예외처리함
 *      - String : 
 *          + id(require) : 동적으로 추가할 경우 파일로 분리해서 로딩 (arg[1] 무시됨)
 *          + String : 컨텐츠 본문으로 삽입됨
 *      - TemplateSource :  TS 복제 및 파일 복사
 *      - Function : 함수 수행후 리턴 String 을 통해서 2차 파싱함
 */
LocalCollection.prototype.add = function(pAttr, pContent) {

    var pathInfo = this.getPathInfo(this._SCOPE, pAttr);
    var content;
    var baseTemplate = this._BT;
    var _this = this;

    // if (typeof pContent === 'string') {
    //     _obj2 = require.resolve(pContent) === '' ? {} : require(pContent);
    // } else if (typeof pContent === 'object') {
    //     _obj2 = pContent;
    // }
   
    // ****************************

    // String 인 경우
    if (typeof pAttr === 'string') {

        // 템플릿 경로인 경우
        if (this._Ext_HBS.exec(pAttr)) {

            try {
                // 1-2. 정적 파일 *.*  (*.js제외)
                content = fs.readFileSync(pAttr);
            } catch (err) {
                throw new Error('파일 읽기 오류 pAttr(*.hbs):' + pAttr);
            }
        }
        
        // arg[1] 조건
        if (typeof pContent === 'string') {
            
            try {
                obj = require(pContent);
            } catch (err) {
                content = pContent;
            }
        } 
        
    // TemplateSource (arg[1] 무시됨)
    } else if (pAttr instanceof TemplateSource) {
    
    // LocalCollection (arg[1] 무시됨)
    } else if (pAttr instanceof LocalCollection) {
    
    } else {
        throw new Error('입력 타입 오류 pAttr:' + typeof pAttr);
    }
  
    // 파일 여부 확인
    // fs.access(pAttr, fs.constants.R_OK, function(err) {

    //     // 파일이 없는 경우
    //     if (err) {

    //     // 파일이 있는 경우
    //     } else {
            
    //     }
    // });

    // 파일 유무 검사 후
    // 

    // 1-1. 동적 로딩 (require) 확장자가 .js  경우
    // if (this._Ext_JS.exec(pAttr)) {
    //     content = require(pAttr);
    // } else {
    //     try {
    //         // 1-2. 정적 파일 *.*  (*.js제외)
    //         content = fs.readFileSync(pAttr);
    //     } catch (err) {
    
    //         // 1-(3,4). String, Object 인 경우
    //         if (!(pContent instanceof TemplateSource)) {
    //             content = pContent ? pContent : '';
    //         }
    //     }
    // }

    this.pushAttr(
        new TemplateSource(this._BT, pathInfo.attrName, pathInfo.loadPath, content),
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
                _this._items[pIdx] = newValue.clone(pathInfo.attrName, pathInfo.savePath);
                
                // 파일 복사
                copyFileSync(newValue.path, pathInfo.savePath);
            
            // 2/3. : String
            } else if (typeof newValue === 'string' ||  typeof newValue === 'function') {
                _this._items[pIdx].content = newValue;
            
            } else {
                throw new Error('입력 타입 오류 :' + typeof newValue);
            }
        }
    );
    
    // 1-5 content 가 TemplateSource 인 경우 (pushAttr.setter호출됨 )
    // if (pContent instanceof TemplateSource) {
    //     this[pathInfo.attrName] = pContent;
    // }
    
    // 테스트
    // if (ns ==='part/ns/..') {
    //     this._part.ns.pushAttr
    // }
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
