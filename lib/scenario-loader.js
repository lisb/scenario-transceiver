'use strict';

const fs = require('fs');
const path = require('path');
const safeLoadModule = require('./utils/safe-load-module');
const MessageNote = require('./model/message-note');
const messageNote = new MessageNote();


/**
 * シナリオメッセージ読込・解析
 * @example
 * class ScenarioTransceiver extends ScenarioLoader
 */
class ScenarioLoader {

  /**
   * @param {string} [root='./notes'] - シナリオメッセージを格納しているディレクトリのパス
   */
  constructor(root = './notes') {
    this.root = root;

    // シナリオメッセージの読み込みと解析
    this.messageBook = this.loadScenarioBook();

    // 受信・送信パターンセット
    this.receiverMap = this.registerReceiverMap();


    // DEBUG
    if (2 <= process.env.DEBUG_SPEC) {
      const inspect = arg => console.log(require('util').inspect(arg, false, null));
      inspect(this.receiverMap);
    }
  }


  /** @private */
  loadScenarioBook() {
    const messageNotes = this.loadMessageNotes();

    // シナリオメッセージの生成
    return messageNote.create(messageNotes);
  }


  /** @private */
  loadMessageNotes() {
    try {
      const jsFiles = fs.readdirSync(this.root).filter(file => '.js' === path.extname(file));

      return this.loadModules(jsFiles);

    } catch(err) {
      console.log('[ScenarioTransceiver] not found dir.');
      throw new Error(err);
    }
  }


  /** @private */
  loadModules(jsFiles) {
    return jsFiles.map(fileName => safeLoadModule(path.resolve(this.root, fileName))).filter(x => x);
  }

};

module.exports = ScenarioLoader;
