'use strict';

const { MessageTransceiver } = require('../../lib');
const q = MessageTransceiver.generateQuestion;
const o = MessageTransceiver.generateOptions;


module.exports = {

  'USER': [
    {
      'HELLO': {
        text: 'おはよう。'
      },

      'HOME': {
        question: '何をしますか？',
        options: [
          '超勤申請',
          '終了・変更・延長',
          '取消申請',
          '履歴ダウンロード',
        ]
      }
    },
    {
      'APPROVE': [
        {
          'START_DATE': {
            question: [
              q.regular('開始日を入力してください。'),
              q.regular(''),
              q.regular('選択肢にない場合は日付?を入力してください。'),
              q.regular('例）4月5日の[場合]'),
              q.regular('4/5'),
            ],
            options: [
              o.regular('本日 [', { item: 'day1' }, ']'),
              o.regular('翌日 [', { item: 'day2' }, ']'),
              o.regular('翌々日 [', { item: 'day3' }, ']'),
              o.either({ item: 'edit', truthy: '編集せずに戻る', falsy: '申請をキャンセル' }),
            ]
          },

          'START_TIME': {
            question: [
              q.regular('開始時刻を入力してください。'),
              q.regular(''),
              q.regular('例）18時5分から開始する場合'),
              q.regular('1805'),
            ],
            options: [
              o.either({ item: 'edit', truthy: '編集せずに戻る', falsy: '申請をキャンセル' }),
            ]
          },

          'REASON': {
            question: [
              q.regular('理由はなんですか？'),
              q.regular('開始日：', { item: 'startDate', reg:'(.+)' }, '、開始時刻：', { item: 'startTime', reg: '(.+)' }),
            ],
            options: [
              o.regular('キャンセル'),
            ]
          },


        },
      ],
    }
  ],


  'CHIEF': [
    {
      'HELLO': {
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
