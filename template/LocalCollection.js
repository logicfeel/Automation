'use strict';

var util                = require('util');
var copyFileSync        = require('fs-copy-file-sync');     // node 에 기본 추가됨
var fs                  = require('fs');

var BaseCollection      = require('./BaseCollection');
var TemplateSource      = require('./TemplateSource');


function LocalCollection(pAttr, pAutoTemplate) {
    BaseCollection.call(this, pAttr, pAutoTemplate);

    this._AutoTemplate = pAutoTemplate;
    this._Ext_JS = /\.js$/;
}
util.inherits(LocalCollection, BaseCollection);

/**
 * 로컬 컬렉션 추가
 *  - 파일경로를 추가하는 경우
 *  - 속성명만 추가한 경우
 *  - 속성명 및 값을 추가하는 경우
 *  - pContent : LocalCollection 으로 가져온 경우
 *      + 복사 일어나야 함
 * 
 *  - 사례 : add
 *      + pAttr 이 파일 경로인 경우
 *          * 파일을 정보와, 파일 내용을 가져옴
 *              * content 가 있는 경우
 *                  - string 
 *                  - LocalCollection
 *      + pAttr 이 파일명이 아닌 경우
 *          * 저장할 파일 정보와
 *  - 사례 : = 대입
 *       
 * @param {*} pAttr 
 * @param {*} pContent 
 */
LocalCollection.prototype.add = function(pAttr, pContent) {

    var pathInfo = this.getPathInfo(this._SCOPE, pAttr);
    var content;

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
        new TemplateSource(this._AutoTemplate, pathInfo.attrName, pathInfo.loadPath, content),
        pathInfo.attrName,
        null,                       // Getter
        function(pIdx, newValue) {  // Setter

            // 3-1. TemplateSource 를 삽입한경우
            if (newValue instanceof TemplateSource) {
                // 파일 복사
                copyFileSync(newValue.path, pathInfo.savePath);
                
                this._items[pIdx] = newValue.clone(pathInfo.attrName, pathInfo.savePath);
            
            // 3-(2,3) : String, function, Object
            } else {
                this._items[pIdx] = newValue;
            }
           

            // TODO: 템플릿 소스의 경우 
            /**
             * - 파일만 복사할지?
             * - 속성을 깊게 복사할지..
             */
            // copyFileSync(newValue.path, pathInfo.savePath);
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
