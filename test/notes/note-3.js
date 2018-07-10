'use strict';

const { MessageTransceiver } = require('../../lib');
const q = MessageTransceiver.generateQuestion;
const o = MessageTransceiver.generateOptions;


module.exports = {

  'MASTER': [
    {
      // 非表示行対応
      'SHOW_HIDE': {
        question: [
          q.regular('アイウエオ'),
          q.removeIncludeFalsy(q.regular({ reg: '(.+)', item: 'item1' })),
          q.removeIncludeFalsy(q.regular({ reg: '(.+)', item: 'item2' })),
          q.regular('012345'),
        ],
        options: [
          o.regular('キャンセル'),
        ]
      },
      'SHOW_HIDE2': {
        question: [
          q.regular('abcdefg'),
          q.removeIncludeStrictFalse(q.regular({ reg: '(.+)', item: 'item1' })),
          q.removeIncludeStrictFalse(q.regular({ reg: '(.+)', item: 'item2' })),
          q.regular('012345'),
        ],
        options: [
          o.regular('キャンセル'),
        ]
      },
      'SHOW_HIDE3': {
        question: [
          q.regular('個人データ'),
          q.removeIncludeFalsy(q.regular('名前:', { reg: '(.+)', item: 'item1' })),
          q.removeIncludeFalsy(q.regular('年齢:', { reg: '(.+)', item: 'item2' })),
          q.removeIncludeFalsy(q.regular('住所:', { reg: '(.+)', item: 'item3' })),
        ],
        options: [
          o.regular('キャンセル'),
        ]
      },
    }
  ]

};
