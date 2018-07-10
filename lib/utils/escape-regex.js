'use strict';

/**
 * 正規表現に使用する文字列のエスケープを行う関数
 * @param {string} pattern - エスケープする文字列
 * @return {string} エスケープ後の文字列
 */
module.exports = (pattern) => {
  return pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
