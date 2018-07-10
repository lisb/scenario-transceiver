# ScenarioTransceiver
メッセージ送信/受信をサポートするパッケージ
---

## Require
node8+  
lodash  
joi   


## Usage


```
const path = require('path');
const { ScenarioTransceiver } = require('scenario-transceiver');

// 読み込むメッセージノートのパスを指定
const st = new ScenarioTransceiver(path.resolve('test/notes'));



// 送信メッセージを生成する
const message1 = st.generate({ key: 'USER:HOME' });
console.log('\nmessage1:', message1);

const message2 = st.generate({ key: 'USER:HELLO' });
console.log('\nmessage2:', message2);

const message3 = st.generate({ key: 'USER:APPROVE:REASON', opts: { startDate: '10月10日', startTime: '22時30分' } });
console.log('\nmessage3:', message3);
//res.send(message);



// メッセージキーと抽出項目を取得する
// 受信メッセージパターンに一致する対象が存在しない場合は、それぞれのパラメータにundefinedを返す
const { key, opts } = st.parse(message3.question);

console.log('key:', key);
console.log('opts:', opts);
```

### 本文オプション/選択肢オプション

本文や選択肢生成の為のオプションメソッドを使用し、動的項目を含めたメッセージを作成する。

test/notes/note-x.js

```js
const { MessageTransceiver } = require('scenario-transceiver');
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
```

### [本文オプション] question.regular

* セレクトスタンプの本文を作成するメソッド  
Array-likeな値を渡すことで文字列を生成する。

```js
const { MessageTransceiver } = require('scenario-transceiver');
const q = MessageTransceiver.generateQuestion;
const o = MessageTransceiver.generateOptions;

module.exports = {
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
};
```

* 送信メッセージの作成と受信メッセージの正規表現の作成を兼ねている為、動的項目には`reg`に一致させる正規表現を渡す必要がある。
* 動的項目は`item`プロパティに渡す。
* 送信メッセージの作成時に、動的項目を`item`に渡すことで動的な本文を作成する。
* 動的項目の正規表現を`reg`に渡してあることから、受信メッセージの判別を行い、その項目に該当する値を抽出して`item`の値をプロパティ名としたオブジェクトを取得できる。
例）opts.recordNo// '123'

### [本文削除オプション] question.remove*

* 条件によって行の非出力を行うメソッド
* 本文オプションを引数として実行する
`q.removeIncludeFalsy(q.regular({ reg: '(.+)', item: 'item1' }))`

#### [本文削除オプション] removeIncludeFalsy()
項目内にfalsyが含まれる場合、その項目を非出力とする
  
#### [本文削除オプション] removeIncludeStrictFalse()
項目内にfalseが含まれる場合、その項目を非出力とする
  
#### [本文削除オプション] removeIsFalsy()
項目内全てがfalsyの場合、その項目を非出力とする

#### [本文削除オプション] removeIsStrictFalse()
項目内全てがfalseの場合、その項目を非出力とする

例）
```js
q.removeIncludeFalsy(q.regular({ reg: '(.+)', item: 'item1' })),
```

#### [本文オプション] default
項目内にdefaultがある場合、itemで指定したプロパティが存在しない場合に、defaultの値を出力する

例）
```js
const today = (d = new Date) => `${d.getFullYear()}月${d.getMonth() + 1}日`;
...
q.regular({ reg: '(.+)', item: 'no_exist', default: 'Hi' }),
q.regular({ reg: '(.+)', item: 'no_exist', default: today() }),
```



### [選択肢オプション] option.regular(value1, value1, ...)

* セレクトスタンプの選択肢を作成するメソッド
Array-likeな値を渡すことで選択肢文字列を生成する。
* 本文オプションとは異なり、正規表現のプロパティを持たない。

```js
options: [
  o.regular('借りる'),
  o.regular({ item: 'shareService' }, 'で共有する'),
  o.regular('戻る')
]
```


### [選択肢オプション] option.either(value)

* `item`がtruthyかどうかで、`truthy`プロパティか`faly`プロパティかどちらかが有効となる。
* 引数には１オブジェクトのみを渡す

```js
options: [
  o.either({ item: 'valid1', truthy: [ '有効な本：', { item: 'bookName1' } ], falsy: '' }),
  o.either({ item: 'valid2', truthy: [ '有効な本：', { item: 'bookName2' } ], falsy: '' }),
]
```

### [選択肢オプション] option.list(value)

* `item`プロパティで示すオブジェクトのプロパティを、選択肢としてリスト出力する。

```js
'ALL_LIST': {
  question: [
    q.regular('本の一覧です。'),
  ],
  options: [
    o.list({ item: 'bookName' })
  ]
}
```





## Test

`npm test`  

test/scenario-transceiver.test.js  

```js
const assert = require('assert');
const safeRegex = require('safe-regex');
const { ScenarioTransceiver } = require('scenario-transceiver');

const st = new ScenarioTransceiver('./test/notes');


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

  });

});
```
