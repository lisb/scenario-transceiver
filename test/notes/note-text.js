'use strict';

const { MessageTransceiver } = require('../../lib');
const t = MessageTransceiver.generateText;


module.exports = {

  'TEXT-HOME': [
    {
      'TEST-1': {
        text: 'おはよう。'
      },

      'TEST-2': {
        text: [
          t.regular('おはよう。')
        ]
      },

      'TEST-3': {
        text: [
          t.regular('おはよう。', 'こんにちは。')
        ]
      },

      'TEST-4': {
        text: [
          t.regular('おはよう。', 'こんにちは。', { item: 'goodnight' })
        ]
      },

      'TEST-5': {
        text: [
          t.regular('おはよう。', 'こんにちは。'),
          t.regular({ item: 'goodnight' }),
        ]
      },

    },
  ]

};
