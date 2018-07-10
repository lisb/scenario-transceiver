'use strict';

const _ = require('lodash');


/**
 * テキストメッセージの動的項目用の生成関数
 * @example
 * const { MessageTransceiver } = require('MessageTransceiver');
 * const t = MessageTransceiver.generateText;
 */
class GenerateText {


  /**
   * opts[item] 出力
   * @example
   * text: [
   *   t.regular('使用言語に', { item: 'langName' }, 'を選択しています。')
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


};

module.exports = new GenerateText;
