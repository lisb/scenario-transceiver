'use strict';

module.exports = (messages) => {

  // 同メッセージキーは先に読み込まれた方を優先
  const filteredMessages = filterByMessageKey(messages);

  // ソート
  const sortMessages = filteredMessages.sort(sortMessageKeys);

  // オブジェクトに変換
  const messageObject = messagesToObject(sortMessages);


  return messageObject;
};


const filterByMessageKey = (messages) => {
  const filteredMessages = [];
  const uniqueMessages = { };
  let sno = 0;

  for (const message of Array.from(messages)) {
    for (const [ mkey, mobj ] of Object.entries(message)) {

      // 先に読み込んだ順に優先する
      if (!uniqueMessages[mkey]) {
        uniqueMessages[mkey] = true;

        filteredMessages.push({
          key: mkey,
          value: mobj,
          sno: ++sno,
          actions: mkey.split(':')
        });
      }
    }
  }

  return filteredMessages;
};


const sortMessageKeys = (a, b) => {
  // 1) actions length 短さ
  if (a.actions.length < b.actions.length) return false;
  if (a.actions.length > b.actions.length) return true;

  // 2) actions[0-(length-2)] 比較
  if (a.actions.slice(0, -1).join(':') === b.actions.slice(0, -1).join(':')) {
    // 3) index (sno)
    if (a.sno < b.sno) {
      return false;
    }
  }


  return true;
};


const messagesToObject = (messagesArray) => {
  const messageObject = { };

  for (let i = 0; i < messagesArray.length; ++i) {
    const m = messagesArray[i];
    messageObject[m.key] = m.value;
  }

  return messageObject;
};
