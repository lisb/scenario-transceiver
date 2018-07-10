'use strict';


const types = {
  'Object'  : /Object/,
  'Array'   : /Array/,
  'Function': /Function/,
  'Error'   : /Error/,
  'Date'    : /Date/,
  'JSON'    : /JSON/,
  'Math'    : /Math/,
  'RegExp'  : /RegExp/,
  'String'  : /String/,
  'Number'  : /Number/,
  'Boolean' : /Boolean/,
  'Symbol'  : /Symbol/,
  'Promise' : /Promise/,
};

/**
 * getType
 * @example
 * if ('Date' === getType(new Date()) true;
 *
 * @param {*} arg - 型を知りたい変数
 * @return {string} typesの中から合致するKEY
 */
module.exports = (arg) => {
  return Object.keys(types).find(type => {
    return types[type].test(toString.call(arg));
  });
};
