"use strict";
let crypto = require('crypto');

module.exports = {
  //生成RSA-SHA1签名
  //privateKey为buffer
  createRSASign: function (params, privateKey) {
    let signer = crypto.createSign('RSA-SHA1');
    let prestr = this.linkSignStr(params);
    let sign = signer.update(new Buffer(prestr, 'utf-8')).sign(privateKey, 'base64');
    return sign;
  },

  //验证RSA-SHA1签名
  //publicKey为buffer
  verifyRSASign: function (params, sign, publicKey) {
    let verify = crypto.createVerify('RSA-SHA1');
    return verify.update(new Buffer(this.linkSignStr(params), 'utf-8')).verify(publicKey, sign, 'base64');
  }

};


