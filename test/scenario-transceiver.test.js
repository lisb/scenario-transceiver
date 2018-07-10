'use strict';

const assert = require('assert');
const safeRegex = require('safe-regex');
const { ScenarioTransceiver } = require('../lib');

// 読み込むメッセージノートのパスを指定
const st = new ScenarioTransceiver('./test/notes');


/** @test {ScenarioTransceiver} */
describe('ScenarioTransceiver', () => {

  /** @test ALL Message RegExp Safe */
  describe('ScenarioTransceiver RegExp Safe', () => {

    it('正規表現の安全性チェック(ここで引っかかる場合はその正規表現が処理遅延に繋がる)', () => {
      const allMessageRegExp = st.generateReceiverQuestions();
      const validateResult = allMessageRegExp.filter(reg => !safeRegex(new RegExp(reg.pattern)));

      assert.deepStrictEqual(validateResult, []);
    });

  });
});


/** @test {ScenarioTransceiver} */
describe('ScenarioTransceiver', () => {

  /** @test {ScenarioTransceiver.generate} */
  describe('ScenarioTransceiver.generate', () => {

    it('USER:HELLO', () => {
      const message = st.generate({ key: 'USER:HELLO' });

      assert.deepStrictEqual(message, { text: 'おはよう。' });
    });

    it('USER:HOME', () => {
      const message = st.generate({ key: 'USER:HOME' });

      assert.deepStrictEqual(
        message,
        {
          question: '何をしますか？',
          options: [
            '本を探す',
            '本を返す',
            'おすすめ一覧',
          ]
        }
      );
    });

    it('USER:APPROVE:REASON', () => {
      const testOpts = { startDate: '10月10日', startTime: '22時30分' };
      const message = st.generate({ key: 'USER:APPROVE:REASON', opts: testOpts });

      assert.deepStrictEqual(
        message,
        {
          question: [
            '理由はなんですか？',
            `開始日：${ testOpts.startDate }、開始時刻：${ testOpts.startTime }`,
          ].join('\n'),
          options: [
            'キャンセル',
          ]
        }
      );
    });

    it('USER:AWAY NOT FOUND.', () => {
      const testOpts = { key: 'USER:AWAY', opts: {} };
      const message = st.generate(testOpts);

      assert.deepStrictEqual(message, false);
    });

    it('[EXAMPLE] BOOK:LIST', () => {
      const testOpts = { valid1: 'truthy...', bookName1: 'こころ', valid2: 0, bookName2: '我輩は' };
      const message = st.generate({ key: 'BOOK:LIST', opts: testOpts });

      assert.deepStrictEqual(
        message,
        {
          question: '有効な本の一覧です。無効なものは表示されません。',
          options: [
            `有効な本：${ testOpts.bookName1 }`,
          ]
        }
      );
    });

    it('[EXAMPLE] BOOK:ALL_LIST', () => {
      const testOpts = {
        bookName: [
          'こころ',
          '我輩は',
          '学問の',
        ]
      };
      const message = st.generate({ key: 'BOOK:ALL_LIST', opts: testOpts });

      assert.deepStrictEqual(
        message,
        {
          question: '本の一覧です。',
          options: testOpts.bookName
        }
      );
    });

    it('[EXAMPLE] BOOK:DETAIL', () => {
      const testOpts = { recordNo: 1234, details: 'この本のあらすじは、\n~~~~~~~です。', shareService: 'twitter' };
      const message = st.generate({ key: 'BOOK:DETAIL', opts: testOpts });

      assert.deepStrictEqual(
        message,
        {
          question: [
            '本の情報',
            `No.${ testOpts.recordNo }`,
            testOpts.details
          ].join('\n'),
          options: [
            '借りる',
            `${ testOpts.shareService }で共有する`,
            '戻る'
          ]
        }
      );
    });



    // note-3
    // 非表示行がある場合のテスト
    it('[note-3] MASTER:SHOW_HIDE 1', () => {
      const message = st.generate({ key: 'MASTER:SHOW_HIDE', opts: { item1: 'おはよう', item2: 'こんばんは' } });

      assert.deepStrictEqual(
        message,
        {
          question: [
            'アイウエオ',
            'おはよう',
            'こんばんは',
            '012345'
          ].join('\n'),
          options: [
            'キャンセル'
          ]
        }
      );
    });

    it('[note-3] MASTER:SHOW_HIDE 2', () => {
      const message = st.generate({ key: 'MASTER:SHOW_HIDE', opts: { item1: '', item2: '' } });

      assert.deepStrictEqual(
        message,
        {
          question: [
            'アイウエオ',
            '012345'
          ].join('\n'),
          options: [
            'キャンセル'
          ]
        }
      );
    });

    it('[note-3] MASTER:SHOW_HIDE2 1', () => {
      const message = st.generate({ key: 'MASTER:SHOW_HIDE2', opts: { item1: '', item2: '' } });

      assert.deepStrictEqual(
        message,
        {
          question: [
            'abcdefg',
            '',
            '',
            '012345'
          ].join('\n'),
          options: [
            'キャンセル'
          ]
        }
      );
    });

    it('[note-3] MASTER:SHOW_HIDE3', () => {
      const message = st.generate({ key: 'MASTER:SHOW_HIDE3', opts: { item1: '山田', item2: '', item3: '福岡' } });

      assert.deepStrictEqual(
        message,
        {
          question: [
            '個人データ',
            '名前:山田',
            '住所:福岡'
          ].join('\n'),
          options: [
            'キャンセル'
          ]
        }
      );
    });

  });


  /** @test {ScenarioTransceiver.parse} */
  describe('ScenarioTransceiver.parse', () => {

    it('USER:HOME', () => {
      const testOpts = { key: 'USER:HOME', opts: {} };
      const message = st.generate(testOpts);
      const { key, opts } = st.parse(message.question);

      assert.deepStrictEqual({ key, opts }, testOpts);
    });

    it('USER:HOME MESSAGE NOT FOUND.', () => {
      const testOpts = { key: 'USER:HOME', opts: {} };
      const message = st.generate(testOpts);
      const { key, opts } = st.parse('見つからないメッセージ例');

      assert.deepStrictEqual({ key, opts }, { key: undefined, opts: undefined });
    });


    // note-3
    // 非表示行がある場合のテスト
    it('[note-3] MASTER:SHOW_HIDE 1', () => {
      const testOpts = { key: 'MASTER:SHOW_HIDE', opts: { item1: undefined, item2: undefined } };
      const message = st.generate(testOpts);
      const { key, opts } = st.parse('アイウエオ\n012345');

      assert.deepStrictEqual({ key, opts }, testOpts);
    });

    it('[note-3] MASTER:SHOW_HIDE 2', () => {
      const testOpts = { key: 'MASTER:SHOW_HIDE', opts: { item1: 'おはよう', item2: undefined } };
      const message = st.generate(testOpts);
      const { key, opts } = st.parse('アイウエオ\nおはよう\n012345');

      assert.deepStrictEqual({ key, opts }, testOpts);
    });

    it('[note-3] MASTER:SHOW_HIDE 3', () => {
      const testOpts = { key: 'MASTER:SHOW_HIDE', opts: { item1: 'おはよう', item2: 'こんばんは' } };
      const message = st.generate(testOpts);
      const { key, opts } = st.parse('アイウエオ\nおはよう\nこんばんは\n012345');

      assert.deepStrictEqual({ key, opts }, testOpts);
    });

    it('[note-3] MASTER:SHOW_HIDE 4', () => {
      const testOpts = { key: 'MASTER:SHOW_HIDE3', opts: { item1: '山田', item2: undefined, item3: '福岡' } };
      const message = st.generate(testOpts);
      const { key, opts } = st.parse('個人データ\n名前:山田\n住所:福岡');

      assert.deepStrictEqual({ key, opts }, testOpts);
    });

  });



  /** @test {ScenarioTransceiver.generate text message} */
  describe('ScenarioTransceiver.generate テキストメッセージ', () => {

    it('TEXT-HOME:TEST-1', () => {
      const message = st.generate({ key: 'TEXT-HOME:TEST-1' });

      assert.deepStrictEqual(message, { text: 'おはよう。' });
    });

    it('TEXT-HOME:TEST-2', () => {
      const message = st.generate({ key: 'TEXT-HOME:TEST-2' });

      assert.deepStrictEqual(message, { text: 'おはよう。' });
    });

    it('TEXT-HOME:TEST-3', () => {
      const message = st.generate({ key: 'TEXT-HOME:TEST-3' });

      assert.deepStrictEqual(message, { text: 'おはよう。こんにちは。' });
    });

    it('TEXT-HOME:TEST-4', () => {
      const message = st.generate({ key: 'TEXT-HOME:TEST-4', opts: { goodnight: 'こんばんは。' } });

      assert.deepStrictEqual(message, { text: 'おはよう。こんにちは。こんばんは。' });
    });

    it('TEXT-HOME:TEST-5', () => {
      const message = st.generate({ key: 'TEXT-HOME:TEST-5', opts: { goodnight: 'こんばんは。' } });

      assert.deepStrictEqual(message, { text: 'おはよう。こんにちは。\nこんばんは。' });
    });

  });

});
