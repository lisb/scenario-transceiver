'use strict';

const _ = require('lodash');
const getType = require('./utils/get-type');
const escapeRegex = require('./utils/escape-regex');
const checkType = require('./model/message-check-type');
const ScenarioLoader = require('./scenario-loader');


/**
 * メッセージ送受信サポート
 * @example
 * const st = new ScenarioTransceiver(path.resolve('test/notes');
 * // メッセージキーより送信メッセージを生成
 * const message1 = st.generate({ key: 'USER:HOME' });
 * // 生成したメッセージを送信
 * robot.send({ room }, message1);
 *
 * // メッセージキーとパラメータより送信メッセージを生成
 * const message3 = st.generate({ key: 'USER:SCHEDULE:DATETIME', opts: { startDate: '10月10日', startTime: '22時30分' } });
 * // 生成したメッセージを送信
 * robot.send({ room }, message3);
 *
 * // メッセージキーと抽出項目を取得する
 * const { key, opts } = st.parse(message3.question) || {};
 * console.log('key:', key);
 * console.log('opts:', opts);
 */
class ScenarioTransceiver extends ScenarioLoader {


  /**
   * 受信メッセージパターンに一致した場合、メッセージキーと抽出項目を返す
   * @param {string} msg - 一致するメッセージパターンを検索するメッセージ
   * @return {{?key: string, ?opts: Object}} 一致したメッセージキーと抽出項目
   */
  parse(msg) {
    const setTo = (matches, to) => to.reduce((obj, key, matchIdx) => Object.assign({}, obj, { [key]: matches[ matchIdx + 1 ] }), {});
    const exportsTo = (matches, to) => (matches !== null) ? setTo(matches, to) : false;
    const exportMatchesTo = ({ msg, pattern, to }) => exportsTo(pattern.exec(msg), to);

    for (const [ key, { pattern, to } ] of this.receiverMap.entries()) {
      if (pattern.test(msg)) {
        const opts = exportMatchesTo({ msg, pattern, to });
        if (opts === false) {
          // RegExp.text = OK & RegExp.match = false の場合
          console.log('[BUG] parse test -> ok, exec -> ng');
          console.log('[BUG] msg >> ', msg);
          return false;
        } else {
          return { key, opts };
        }
      }
    }

    return { };
  }


  // 送信メッセージをパターンキーと変数をセットして返す
  generate({ key, opts }) {
    const messageObject = this.messageBook[key];

    // キーに該当するメッセージが見つからない場合
    if (!messageObject) {
      console.log('[BUG] not found match key.');
      console.log('[BUG] key >> ', key);
      return false;
    }


    // メッセージタイプ判定
    if (checkType.selectFunction(this.messageBook[key]) ||
        checkType.selectNormal(this.messageBook[key])) {

      // セレクトスタンプの場合
      return {
        question: this.transceiver(messageObject, { opts, kind: 'GENERATOR' }, false),
        options : this.optionCreator(messageObject, { opts })
      };
    } else {
      // 以外の場合
      return this.textCreator(messageObject, { opts });
    }
  }


  // 受信メッセージ判別パターンをMapに登録
  registerReceiverMap() {
    const receiverQuestions = this.generateReceiverQuestions();
    // console.log('registerReceiverMap:', receiverQuestions);//test

    const toReceiverPattern = ({ pattern, to }) => ({ pattern: new RegExp('^' + pattern + '$'), to });
    const receiverPattern = receiverQuestions.map(question => ([ question.key, toReceiverPattern(question) ]));

    return new Map(receiverPattern);
  }


  generateReceiverQuestions() {
    return Object.keys(this.messageBook)
      .filter(key => {
        if (checkType.selectFunction(this.messageBook[key]) ||
            checkType.selectNormal(this.messageBook[key])) {
          return true;
        }
      })
      .map(key => ({
        key,
        pattern: this.transceiver(this.messageBook[key], { to: false, kind: 'RECEIVER' }, true),
        to:      this.transceiver(this.messageBook[key], { to: true }),
      }));
  }


  transceiver(messageObject, params, doEscape = true) {
    if (checkType.selectNormal(messageObject)) {
      // 通常のセレクトスタンプの場合

      return params.to
        ? [ ]
        : (doEscape ? escapeRegex(messageObject.question) : messageObject.question);

    } else {
      // パターン設定するセレクトスタンプの場合

      const execFunc = (frgmnt) => frgmnt(params, doEscape);
      const flatOnlyTruthy = (nestArr) => _.flatten(nestArr).filter(x => x);

      const preparedFragments = flatOnlyTruthy(messageObject.question.map(execFunc));

      // to: true  -> 受信時に抽出する対象key
      // to: false -> 受信パターン/送信メッセージ 末尾の\nを取り除く
      return params.to
        ? preparedFragments
        : preparedFragments.join('').replace(/\n$/, '').replace(/\n\|\)$/, '|)');
    }
  }


  optionCreator(messageObject, params) {
    if (checkType.selectNormal(messageObject)) {
      // 通常のセレクトスタンプの場合

      return messageObject.options;
    } else {
      // パターン設定するセレクトスタンプの場合

      const execFunc = (frgmnt) => frgmnt(params);
      const flatOnlyTruthy = (nestArr) => _.flatten(nestArr).filter(x => x);

      const preparedFragments = flatOnlyTruthy(messageObject.options.map(execFunc));

      return preparedFragments;
    }
  }


  /**
   * @return {{text: string}}
   */
  textCreator(messageObject, params) {
    if (checkType.textFunction(messageObject)) {
      // 動的項目設定するテキストメッセージの場合

      const execFunc = (frgmnt) => frgmnt(params);
      const flatOnlyTruthy = (nestArr) => _.flatten(nestArr).filter(x => x);

      const preparedFragments = flatOnlyTruthy(messageObject.text.map(execFunc));

      return { text: preparedFragments.join('\n') };
    } else {
      // 通常のセレクトスタンプの場合

      return messageObject;
    }
  }

};

module.exports = ScenarioTransceiver;
