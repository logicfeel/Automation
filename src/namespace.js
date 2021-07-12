/**
 * 공통 네임스페이스
 * @namespace _W
 */

/**
 * 공통 네임스페이스
 * @namespace Common
 * @memberof _W
 */

/** 
 * 공통 유틸리티 네임스페이스
 * @namespace _W.Common.Util
 */

/** 
 * 컬렉션 네임스페이스
 * @namespace Collection 
 * @memberof _W
 */

/** 
 * 인터페이스 네임스페이스
 * @namespace Interface 
 */

/**
 * 테스트1
 * @class ABC
 * @implements {Interface.ICollection}
 */

/**
 * 테스트2
 * @class ABC2
 * @implements {ICollection}
 */

/**
 * @interface Metric
 */
/**
 * @function
 * @name Metric#getName
 * @returns {string}
 */
/**
 * @function
 * @name Metric#compute
 * @param context
 * @param [extra]
 * @returns {Promise<object>}
 * @example  <caption>Add *this* to your application.properties.</caption>
 * {@lang bash}
 * foo=bar
 */

/**
 * @constructor
 * @implements {Metric}
 */
 function ActivityScoreMetric () {
    // [REDACTED]
}
ActivityScoreMetric.prototype = {
  compute: function (context, extra) {
      // [REDACTED]
  },

  getName: function () {
    return 'activity_score'
  }
}
