'use strict';

const _ = require('lodash');
const Joi = require('joi');


class MergeMessageNote {

  constructor(options = { }) {

    this.options = options;

    this.anySchema = Joi.compile(Joi.any().required());
    this.stringSchema = Joi.compile(Joi.string().required());
    this.arraySchema = Joi.compile(Joi.array().required());
    this.objectSchema = Joi.compile(Joi.object().required());
    this.funcSchema = Joi.compile(Joi.func().required());

    // テキストメッセージ
    this.textSchema = Joi.compile({
      text: this.stringSchema
    });

    // テキストメッセージ(配列 or 関数)
    this.textOptionSchema = Joi.compile({
      text: Joi.array().items(
        this.funcSchema
      ),
    });

    this.textStampSchema = Joi.compile({
      stamp_set: this.stringSchema,
      stamp_index: this.stringSchema,
      text: this.stringSchema,
    });

    this.textFileSchema = Joi.compile({
      text: this.stringSchema,
      name: this.stringSchema,
      path: this.stringSchema,
      type: this.stringSchema,
    });

    // セレクトスタンプ(通常)
    this.selectSchema = Joi.compile({
      question: this.stringSchema,
      options : Joi.array().items(
        this.stringSchema
      )
    });

    // セレクトスタンプ(配列 or 関数)
    this.selectTransceiverSchema = Joi.compile({
      question: Joi.array().items(
        //this.stringSchema,
        this.funcSchema
      ),
      options : Joi.array().items(
        //this.stringSchema,
        this.funcSchema
      )
    });


    this.messages = { };
  }


  validateArrayError(data) {
    return Joi.validate(data, this.arraySchema, this.options).error;
  }


  validateObjectError(data) {
    return Joi.validate(data, this.objectSchema, this.options).error;
  }


  createBook(data) {
    if (this.validateObjectError(data)) {
      console.log('[Error]', data);
      throw new Error('MessageNotes is not object.');
    }


    this.mergeMessageNotes(data);

    return this.messages;
  }


  mergeMessageNotes(data) {
    // ヘッダーチェック(object)
    if (this.validateObjectError(data)) {
      console.log('[Error]', data);
      throw new Error('MessageNotes HeadObject is not object.');
    }


    // ネスト
    for (const [ mkey, nestData ] of Object.entries(data)) {
      if (_.has(nestData, 'text') ||
         (_.has(nestData, 'question') && _.has(nestData, 'options'))) {
        this.validateType(mkey, nestData);
      } else {
        this.validateNestFromObject(mkey, nestData);
      }
    }
  }


  validateNestFromObject(mkey, data) {
    // from Object to Object
    if (!this.validateObjectError(data)) {
      // Objectが続く場合は、メッセージタイプチェック
      return this.validateMessageArrayObject(mkey, data);
    }

    // from Object to Array
    if (!this.validateArrayError(data)) {
      return this.validateNestFromArray(mkey, data);
    }


    // !Object & !Array の場合はエラー
    console.log('[Error]', data);
    throw new Error('MessageNotes ObjectValue is not object and array.');
  }


  validateNestFromArray(mkey, data) {
    // ネスト
    for (let i = 0; i < data.length; ++i) {
      const nestData = data[i];

      // from Array to Array ... error
      if (!this.validateArrayError(nestData)) {
        console.log('[Error]', nestData);
        throw new Error('MessageNotes array from array.');
      }

      // from Array to Object
      if (!this.validateObjectError(nestData)) {
        this.validateNestFromObject(mkey, nestData);
        continue;
      }


      // !Object & !Array の場合はエラー
      console.log('[Error]', data);
      throw new Error('MessageNotes ArrayArray.');
    }
  }



  // メッセージタイプ
  validateMessageArrayObject(mkey, data) {
    // ネスト
    for (const [ mkey2, nestData ] of Object.entries(data)) {

      const mkeyNext = this.joinKey(mkey, mkey2);

      if (!this.validateObjectError(nestData)) {
        // メッセージタイプチェック
        this.validateType(mkeyNext, nestData);
        continue;
      }

      if (!this.validateArrayError(nestData)) {
        // from Object to Array
        this.validateNestFromArray(mkeyNext, nestData);
        continue;
      } else {
        console.log('[Error]', nestData);
        throw new Error('MessageNotes ObjectValue is not object and array.');
      }
    }
  }


  validateType(mkey, data) {
    if (_.has(data, 'text')) {
      return this.validateTypeText(mkey, data);
    }

    if (_.has(data, 'question') && _.has(data, 'options')) {
      return this.validateTypeSelect(mkey, data);
    }


    console.log('[Error]', data);
    throw new Error('MessageNotes MessageType is invalid type.');
  }


  validateTypeText(mkey, data) {
    if (!Joi.validate(data, this.textSchema, this.options).error) {
      this.messages[mkey] = data;
      return;
    }

    if (!Joi.validate(data, this.textOptionSchema, this.options).error) {
      this.messages[mkey] = data;
      return;
    }

    if (!Joi.validate(data, this.textStampSchema, this.options).error) {
      this.messages[mkey] = data;
      return;
    }

    if (!Joi.validate(data, this.textFileSchema, this.options).error) {
      this.messages[mkey] = data;
      return;
    }


    console.log('[Error]', data);
    throw new Error('MessageNotes TypeCheck invalid type for text.');
  }


  validateTypeSelect(mkey, data) {
    if (!Joi.validate(data, this.selectSchema, this.options).error) {
      this.messages[mkey] = data;
      return;
    }

    if (!Joi.validate(data, this.selectTransceiverSchema, this.options).error) {
      this.messages[mkey] = data;
      return;
    }


    console.log('[Error]', data);
    throw new Error('MessageNotes TypeCheck invalid type for select.');
  }


  joinKey(...keys) {
    return keys.join(':');
  }
}


module.exports = MergeMessageNote;
