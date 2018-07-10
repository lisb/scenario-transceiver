'use strict';

const { MessageTransceiver } = require('../../lib');
const q = MessageTransceiver.generateQuestion;
const o = MessageTransceiver.generateOptions;


module.exports = {

  'USER': [
    {
      'HELLO2': {
        text: 'おはよう。'
      },

      'HOME': {
        question: '何をしますか？',
        options: [
          '本を探す',
          '本を返す',
          'おすすめ一覧',
        ]
      }
    },
    {
      'APPROVE': [
        {
          'START_DATE2': {
            question: [
              q.regular('超勤開始日を入力してください。'),
              q.regular(''),
              q.regular('選択肢にない場合は日付を入力してください。'),
              q.regular('例）4月5日の場合'),
              q.regular('4/5'),
            ],
            options: [
              o.regular('本日 [', { item: 'day1' }, ']'),
              o.regular('翌日 [', { item: 'day2' }, ']'),
              o.regular('翌々日 [', { item: 'day3' }, ']'),
              o.either({ item: 'edit', truthy: '編集せずに戻る', falsy: '申請をキャンセル' }),
            ]
          },

          'START_TIME2': {
            question: [
              q.regular('超勤開始時刻を入力してください。'),
              q.regular(''),
              q.regular('例）18時5分から開始する場合'),
              q.regular('1805'),
            ],
            options: [
              o.either({ item: 'edit', truthy: '編集せずに戻る', falsy: '申請をキャンセル' }),
            ]
          }
        },
      ],
    }
  ],


  'CHIEF': [
    {
      'HELLOx': {
        text: 'おはよう。chief'
      },
    },
  ],


  'ADMIN': [
    {
      'HELLO': {
        text: 'おはよう。admin'
      },
    },
  ],

};
