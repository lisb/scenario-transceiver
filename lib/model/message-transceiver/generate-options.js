'use strict';

const _ = require('lodash');


/**
 * セレクトスタンプの選択肢用の生成関数
 * @example
 * const { MessageTransceiver } = require('MessageTransceiver');
 * const o = MessageTransceiver.generateOptions;
 */
class GenerateOptions {


  /**
   * opts[item] 出力
   * @example
   * options: [
   *   o.regular('使用言語に', { item: 'langName' }, 'を選択する')
   * ]
   */
  regular(...msgs) {
    return ({ opts = false }) => {
      const checkOpts = (msg) => (_.isObject(opts) && _.has(msg, 'item'));
      const setOpts = (msg) => checkOpts(msg) ? opts[msg.item] : msg;
      const objOrOther = (msg) => _.isObject(msg) ? setOpts(msg) : msg;
      return msgs.map(objOrOther).join('');
    };
  }


  /**
   * opts[item] == true => one 出力, else => other 出力
   * @example
   * options: [
   *   o.either({ item: 'validate1', truthy: [ 'はい。', { item: 'langName' }, 'です' ], falsy: 'いいえ' })
   * ]
   */
  either(...msgs) {
    return ({ opts = false }) => {
      const regularOrStr = (msgs) => Array.isArray(msgs) ? this.regular(...msgs)({ opts }) : msgs;
      const checkOpts = (msg) => (_.isObject(opts) && _.has(msg, 'item'));
      const which = (msg, bool) => bool ? regularOrStr(msg.truthy) : regularOrStr(msg.falsy);
      const setOpts = (msg) => checkOpts(msg) ? which(msg, opts[msg.item]) : msg;
      const objOrOther = (msg) => _.isObject(msg) ? setOpts(msg) : msg;
      return msgs.map(objOrOther).join('');
    };
  }


  /**
   * opts = [{item},...]
   * @example
   * options: [
   *   o.list({ item: lunchPlace })
   * ]
   */
  list(...msgs) {
    return ({ opts = false }) => {
      const checkOpts = (msg) => (_.isObject(opts) && _.has(msg, 'item'));
      const setOpts = (msg) => checkOpts(msg) ? opts[msg.item] : [msg];
      const objOrOther = (msg) => _.isObject(msg) ? setOpts(msg) : msg;
      return _.head(msgs.map(objOrOther));
    };
  }

};

module.exports = new GenerateOptions;
