'use strict';

const ValidateMessageNote = require('./validate-message-note');
const MergeMessageNote = require('./merge-message-note');
const sortMessageNote = require('./sort-message-note');


class MessageNote {

  constructor(opts) {
    this.validateMessageNote = new ValidateMessageNote(opts);
    this.mergeMessageNote = new MergeMessageNote(opts);
  }


  create(messageNotes) {
    // シナリオメッセージのバリデーション
    this.validateMessageNote.checkType(messageNotes);

    // シナリオメッセージのマージ・ソート
    this.messageObject = sortMessageNote(messageNotes.map(note => this.mergeMessageNote.createBook(note)));


    this.display();

    return this.messageObject;
  }


  display() {
    const messageCount = Object.keys(this.messageObject).length;

    if (0 === messageCount) {
      console.log(`[${ new Date() }] INFO ScenarioMessageKeys... none.`);
    } else {
      console.log(`[${ new Date() }] INFO ScenarioMessageKeys... ${ messageCount }`);
      // DEBUG
      if (1 <= process.env.DEBUG_SPEC) {
        const log = Object.keys(this.messageObject).map((mkey, idx) => `${ ++idx }) ${ mkey }`);
        console.log(log.join('\n'));
      }
    }
  }
}

module.exports = MessageNote;
