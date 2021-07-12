(function(global) {

    "use strict";

    //==============================================================
    // 1. 모듈 네임스페이스 선언
    global._W               = global._W || {};
    global._W.Interface     = global._W.Interface || {};

    //==============================================================
    // 2. 모듈 가져오기 (node | web)
    var util;
    var IObject;

    if (typeof module === "object" && typeof module.exports === "object") {     
        util                = require("./utils");
        IObject             = require("./i-object");
    } else {
        util                = global._W.Common.Util;
        IObject             = global._W.Interface.IObject;
    }

    //==============================================================
    // 3. 모듈의존성 검사
    if (typeof util === "undefined") throw new Error("[util] module load fail...");
    if (typeof IObject === "undefined") throw new Error("[IObject] module load fail...");

    //==============================================================
    // 4. 모듈 구현    
    var IMarshal  = (function (_super) {
        /**
         * 최상위 객체
         * @constructs Interface.IMarshal
         * @interface
         * @extends Interface.IObject
         */
        function IMarshal() {
            _super.call(this);
        }
        util.inherits(IMarshal, _super);

        /**
         * 객체 얻기
         * @returns {Object}
         */
        IMarshal.prototype.getObject  = function() {
            throw new Error("[ getObject() ] Abstract method definition, fail...");
        };

        /**
         * GUID 얻기
         */
        IMarshal.prototype.getGUID  = function() {
            throw new Error("[ getGUID() ] Abstract method definition, fail...");

        };

        return IMarshal;
    }(IObject));

    //==============================================================
    // 5. 모듈 내보내기 (node | web)
    if (typeof module === "object" && typeof module.exports === "object") {     
        module.exports = IMarshal;
    } else {
        global._W.Interface.IMarshal = IMarshal;
    }
    
}(typeof module === "object" && typeof module.exports === "object" ? global : window));