'use strict';

const getType = require('../../utils/get-type');


class MessageCheckType {

  selectFunction(selectObject) {
    const { question, options } = selectObject || { };

    if (!this.isArray(question)) return false;
    if (!this.isAllFunction(question)) return false;
    if (!this.isArray(options)) return false;
    if (!this.isAllFunction(options)) return false;

    return true;
  }


  selectNormal(selectObject) {
    const { question, options } = selectObject || { };

    if (!this.isString(question)) return false;
    if (!this.isArray(options)) return false;
    if (!this.isAllString(options)) return false;

    return true;
  }


  textFunction(textObject) {
    const { text } = textObject || { };

    if (!this.isArray(text)) return false;
    if (!this.isAllFunction(text)) return false;

    return true;
  }


  isArray(arg) {
    return 'Array' === getType(arg);
  }


  isString(arg) {
    return 'String' === getType(arg);
  }


  isFunction(arg) {
    return 'Function' === getType(arg);
  }


  isAllFunction(args) {
    return args.every(arg => this.isFunction(arg));
  }


  isAllString(args) {
    return args.every(arg => this.isString(arg));
  }

};

module.exports = new MessageCheckType;
