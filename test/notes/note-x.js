'use strict';

const { MessageTransceiver } = require('../../lib');
const q = MessageTransceiver.generateQuestion;
const o = MessageTransceiver.generateOptions;


module.exports = {
  'BOOK': {
    'LIST': {
      question: [
        q.regular('有効な本の一覧です。無効なものは表示されません。'),
      ],
      options: [
        o.either({ item: 'valid1', truthy: [ '有効な本：', { item: 'bookName1' } ], falsy: '' }),
        o.either({ item: 'valid2', truthy: [ '有効な本：', { item: 'bookName2' } ], falsy: '' }),
      ]
    },
    'ALL_LIST': {
      question: [
        q.regular('本の一覧です。'),
      ],
      options: [
        o.list({ item: 'bookName' })
      ]
    },
    'DETAIL': {
      question: [
        q.regular('本の情報'),
        q.regular('No.', { reg: '([0-9]+)', item: 'recordNo' }),
        q.regular({ reg: '([^]*)', item: 'details' })
      ],
      options: [
        o.regular('借りる'),
        o.regular({ item: 'shareService' }, 'で共有する'),
        o.regular('戻る')
      ]
    }
  }
};
