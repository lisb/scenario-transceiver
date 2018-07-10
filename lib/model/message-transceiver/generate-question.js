'use strict';

const _ = require('lodash');
const escapeRegex = require('../../utils/escape-regex');


/**
 * セレクトスタンプの本文用の生成関数
 * @example
 * const { MessageTransceiver } = require('MessageTransceiver');
 * const q = MessageTransceiver.generateQuestion;
 */
class GenerateQuestion {

  /**
   * @example
   * question: [
   *   q.regular('本の情報'),
   *   q.regular('No.', { reg: '([0-9]+)', item: 'recordNo' }),
   *   q.regular({ reg: '([^]*)', item: 'details' })
   * ]
   */
  regular(...msgs) {
    return ({ kind, opts = false, to = false }, doEscape = true) => {
      if (to) {
        const getTo = (msg) => _.get(msg, 'item');
        const hasItem = (msg) => _.has(msg, 'item');
        return msgs.filter(hasItem).map(getTo);
      } else {

        // 受信用パターン作成
        if ('RECEIVER' === kind) {
          const hasReg = (msg) => _.has(msg, 'reg');
          const setReg = (msg) => hasReg(msg) ? msg.reg : this.escapeMessage(msg, doEscape);
          return [...msgs.filter(x => x).map(setReg), '\n'];
        };

        // 送信用メッセージ作成
        if ('GENERATOR' === kind) {
          const hasItem = (msg) => (_.has(msg, 'item') && _.has(opts, msg.item));
          const getDefs = (msg) => msg.hasOwnProperty('default') ? msg.default : msg;
          const setOpts = (msg) => hasItem(msg) ? opts[msg.item] : getDefs(msg);
          return [...msgs.filter(x => x).map(setOpts), '\n'];
        };
      }
    };
  }


  /**
   * 行単位がFalsyの場合に、その行を削除する
   * @example
   * question: [
   *   q.removeIsFalsy(q.regular({ reg: '([^]*)', item: 'details' }))
   * ]
   */
  removeIsFalsy(qFunc) {
    return (...opts) => {
      const msgArr = cutTail(qFunc(...opts));

      if ('RECEIVER' === opts[0].kind) {
        return ['(?:', ...msgArr, '|)'];
      }

      if (('GENERATOR' === opts[0].kind) && this.everyFalsy(msgArr.slice(0, -1))) {
        return [];
      }

      return msgArr;
    };
  }


  /**
   * 行単位が(===)Falseの場合に、その行を削除する
   * @example
   * question: [
   *   q.removeIsStrictFalse(q.regular({ reg: '([^]*)', item: 'details' }))
   * ]
   */
  removeIsStrictFalse(qFunc) {
    return (...opts) => {
      const msgArr = qFunc(...opts);

      if ('RECEIVER' === opts[0].kind) {
        return ['(?:', ...msgArr, '|)'];
      }

      if (('GENERATOR' === opts[0].kind) && this.everyStrictFalse(msgArr.slice(0, -1))) {
        return [];
      }

      return msgArr;
    };
  }


  /**
   * 行単位がFalsyの場合に、その行を削除する
   * @example
   * question: [
   *   q.removeIncludeFalsy(q.regular({ reg: '([^]*)', item: 'details' }))
   * ]
   */
  removeIncludeFalsy(qFunc) {
    return (...opts) => {
      const msgArr = qFunc(...opts);

      if ('RECEIVER' === opts[0].kind) {
        return ['(?:', ...msgArr, '|)'];
      }

      if (('GENERATOR' === opts[0].kind) && this.includeFalsy(msgArr)) {
        return [];
      }

      return msgArr;
    };
  }


  /**
   * 行単位が(===)Falseの場合に、その行を削除する
   * @example
   * question: [
   *   q.removeIncludeStrictFalse(q.regular({ reg: '([^]*)', item: 'details' }))
   * ]
   */
  removeIncludeStrictFalse(qFunc) {
    return (...opts) => {
      const msgArr = qFunc(...opts);

      if ('RECEIVER' === opts[0].kind) {
        return ['(?:', ...msgArr, '|)'];
      }

      if (('GENERATOR' === opts[0].kind) && this.includeStrictFalse(msgArr)) {
        return [];
      }

      return msgArr;
    };
  }


  /** @private */
  escapeMessage(msg, doEscape) {
    return doEscape
      ? escapeRegex(msg)
      : msg;
  }


  /**
   * 配列中の値が全てfalsyか判定
   * @private
   * @param {Array} arr
   * @return {boolean} 全てfalsyの場合にtrue
   */
  everyFalsy(arr) {
    const isFalse = arg => !arg;
    return arr.every(isFalsy);
  }


  /**
   * 配列中の値が全てfalseか判定
   * @private
   * @param {Array} arr
   * @return {boolean} 全てfalseの場合にtrue
   */
  everyStrictFalse(arr) {
    const isFalse = arg => false === arg;
    return arr.every(isFalse);
  }


  /**
   * 配列の中にfalsyを含んでいるか判定
   * @private
   * @param {Array} arr
   * @return {boolean} falsyを含んでいる場合にtrue
   */
  includeFalsy(arr) {
    const isFalsy = arg => !arg;
    return arr.some(isFalsy);
  }


  /**
   * 配列の中にfalseを含んでいるか判定
   * @private
   * @param {Array} arr
   * @return {boolean} falseを含んでいる場合にtrue
   */
  includeStrictFalse(arr) {
    const isFalse = arg => false === arg;
    return arr.some(isFalse);
  }
};

module.exports = new GenerateQuestion;
