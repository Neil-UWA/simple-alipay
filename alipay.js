'use strict';
let lib = require('./lib/utils');
let crypto = require('crypto');
let request = require('request');
let querystring = require('querystring');

let Alipay = function (config) {
  this.config = config || {};
  this.secret_key = this.config.secret_key || '';
  this.gateway = this.config.gateway || '';
};

Alipay.prototype.create_batch_trans_notify = function (params) {
  let default_params = {
    partner: this.config.partner || '',
    account_name: this.config.account_name || '',
    email: this.config.email || '',
    buyer_account_name: this.config.buyer_account_name || '',
    notify_url: this.config.notify_url || ''
  };

  params = Object.assign({}, params, default_params, {
    service: 'batch_trans_notify',
    _input_charset: 'utf-8'
  });

  params = this.parseFilter(params);
  params = this.createSign(params, this.secret_key);

  return this.gateway + '?' + querystring.stringify(params);
};

/**
 * 创建web支付请求地址
 *
 * @param {Object} content 业务内容
 */
Alipay.prototype.createWebRequest_ = function (content) {
  let params = {
    _input_charset: 'utf-8',
    service: 'alipay.wap.create.direct.pay.by.user',
    partner: this.config.partner || '',
    seller_id: this.config.partner || '',
    notify_url: this.config.notify_url || '',
    return_url: this.config.return_url || ''
  };
  params = Object.assign({}, params, content);
  params = this.createSign(params, this.config.secret_key, 'MD5');
  return this.gateway + '?' + querystring.stringify(params);
};

/**
 * 创建web支付请求地址
 *
 * @param {Object} content 业务内容
 */
Alipay.prototype.createWebRequest = function (content) {
  let params = {
    _input_charset: 'utf-8',
    service: 'alipay.wap.create.direct.pay.by.user',
    partner: this.config.partner,
    seller_id: this.config.partner,
    notify_url: this.config.notify_url,
    return_url: this.config.return_url || ''
  };
  params.sign_type='RSA';
  params = Object.assign({}, params, content);
  params.sign = lib.createRSASign(params, this.config.private_key);
  console.log(params);
  return this.gateway + '?' + querystring.stringify(params);
};

/**
 * 创建APP支付请求地址
 *
 * @param {Object} content 业务内容
 */
Alipay.prototype.createAppRequest = function (content) {
  let params = {
    sign_type: 'RSA',
    _input_charset: 'utf-8',
    service: 'alipay.wap.create.direct.pay.by.user',
    partner: this.config.partner || '',
    seller_id: this.config.partner || '',
    notify_url: this.config.notify_url || '',
    return_url: this.config.return_url || ''
  };
  params = Object.assign({}, params, content);
  params.sign = lib.createRSASign(params, this.config.private_key);
  return this.gateway + '?' + querystring.stringify(params);
};

/**
 * createSign
 *
 * @param {Object} params 请求参数
 * @param {String} key 密钥
 * @param {String} sign_type 加密方式
 */
Alipay.prototype.createSign = function (params, key, sign_type) {
  let prestr = this.createLinkStr(this.parseFilter(params));
  if (!sign_type || sign_type === 'MD5') {
    params.sign = this.MD5(prestr + key);
    params.sign_type = 'MD5';
  } else if (sign_type === 'RSA') {
    let signer = crypto.createSign('RSA-SHA1');
    params.sign = signer.update(new Buffer(prestr, 'utf-8')).sign(key, 'base64');
    params.sign_type = 'RSA';
  }
  return params;
};

/**
 * createLinkStr
 * 对请求参数进行升序排序后做拼接
 *
 * @param {Object} params 请求参数
 * @returns {String} 拼接后的query
 */
Alipay.prototype.createLinkStr = function (params) {
  return Object.keys(params).sort().reduce(function (sorted, key) {
    sorted.push(`${key}=${params[key]}`);
    return sorted;
  }, []).join('&');
};

/**
 * parseFilter
 *
 * @param {Object} params 请求参数
 * @returns {Object} 过滤掉值为空的键值
 */
Alipay.prototype.parseFilter = function (params) {
  return Object.keys(params).reduce(function (init, key) {
    if (params[key] === '' ||
      params[key] === null ||
      params[key] === undefined ||
      key === 'sign' ||
      key === 'sign_type') return init;

    init[key] = params[key];
    return init;
  }, {});
};

/**
 * MD5
 *
 * @param {String} data
 * @returns {String} md5加密结果
 */
Alipay.prototype.MD5 = function (data) {
  return crypto.createHash('md5').update(data, 'utf8').digest('hex');
};

/**
 * verifyNotify
 *
 * 验证支付宝通知合法性
 */
Alipay.prototype.verifyNotify = function (notify_id) {
  let options = {
    uri: this.gateway,
    qs: {
      service: 'notify_verify',
      partner: this.config.partner,
      notify_id: notify_id
    }
  };
  return new Promise(function (resolve, reject) {
    request.post(options, function (err, res, body) {
      return err ? reject(err) : resolve(body === 'true');
    });
  });
};

Alipay.prototype.valdate = function (params) {
  let required_params = [
    'service',
    'partner',
    '_input_charset',
    'sign_type',
    'sign',
    'account_name',
    'detail_data',
    'batch_no',
    'batch_num',
    'batch_fee',
    'email',
    'pay_date'
  ];
};

module.exports = Alipay;

