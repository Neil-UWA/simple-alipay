'use strict';

let Alipay = require('../alipay.js');
let assert = require('assert');
let sinon = require('sinon');
let config = require('../../config/main');

describe('Alipay', function() {

  beforeEach(function(){
    this.alipay = new Alipay({partner: 'neil'});
  });

  describe('constructor', function() {
    it('works', function(){
      let alipay = new Alipay();
      assert.equal(alipay.gateway, '');
      assert.deepEqual(alipay.config, {});
      assert.ok(alipay instanceof Alipay);
    });

    it('sets default_params', function(){
      let config = {
        partner: 'neil',
        account_name: '妞',
        email: 'email',
        buyer_account_name: 'buyer_account_name',
        gateway: 'https://mapi.alipay.com/gateway.do'
      };
      let alipay = new Alipay(config);
      assert.deepEqual(alipay.config, config);
    });
  });

  describe('.create_batch_trans_notify', function() {
    it('return batch trans url', function(){
      let alipay = new Alipay(config.alipay)
      let url = alipay.create_batch_trans_notify({
        service: 'batch_trans_notify',
        partner: null,
        _input_charset: 'utf-8',
        sign_type: 'MD5',
        sign: '12312131',
        account_name: '',
        detail_data: '',
        batch_no: '',
        batch_num: '',
        batch_fee: '',
        email: '',
        pay_date: 'YYYYMMDD',
        notify_url: '',
        buyer_account_name: '',
        extend_param: ''
      });
      assert.ok(/https:\/\/*/.test(url));
    });
  });

  describe('.createSign', function() {
    let params = {
      service: 'batch_trans_notify',
      partner: null,
      _input_charset: 'utf-8',
      sign_type: 'MD5',
      sign: '12312131',
      account_name: '',
      detail_data: '',
      batch_no: '',
      batch_num: '',
      batch_fee: '',
      email: '',
      pay_date: 'YYYYMMDD',
      notify_url: '',
      buyer_account_name: '',
      extend_param: ''
    };
    let spy1, spy2, spy3, result;
    beforeEach(function(){
      spy1 = sinon.spy(this.alipay, 'parseFilter');
      spy2 = sinon.spy(this.alipay, 'createLinkStr');
      spy3 = sinon.spy(this.alipay, 'MD5');
      result = this.alipay.createSign(params);
    });
    afterEach(function(){
      spy1.restore();
      spy2.restore();
      spy3.restore();
    });

    it('should invoke .parseFilter', function(){
      assert.equal(spy1.callCount, 1);
    });

    it('should invoke .createLinkStr', function(){
      assert.equal(spy1.callCount, 1);
    });

    it('should invoke .MD5', function(){
      assert.equal(spy1.callCount, 1);
    });

    it('should return params with sign and sign_type', function(){
      assert.equal(result.sign_type, 'MD5');
      assert.ok(/[\w\d]{32}/.test(result.sign));
    });
  });

  describe('.createLinkStr', function() {
    it('should linked querystring ascending order', function(){
      let params = {
        service: 'batch_trans_notify',
        partner: null,
        _input_charset: 'utf-8',
        sign_type: 'MD5',
        sign: '12312131',
        pay_date: 'YYYYMMDD'
      };
      let str = this.alipay.createLinkStr(params);
      assert.equal(str, '_input_charset=utf-8&partner=null&pay_date=YYYYMMDD&service=batch_trans_notify&sign=12312131&sign_type=MD5');
    });
  });

  describe('.parseFilter', function() {
    it('should remove empty value, sign_type and sign,', function(){
      let params = {
        service: 'batch_trans_notify',
        partner: null,
        _input_charset: 'utf-8',
        sign_type: 'MD5',
        sign: '12312131',
        account_name: '',
        detail_data: '',
        batch_no: '',
        batch_num: '',
        batch_fee: '',
        email: '',
        pay_date: 'YYYYMMDD',
        notify_url: '',
        buyer_account_name: '',
        extend_param: ''
      };
      let parsedParams = this.alipay.parseFilter(params);
      assert.deepEqual(parsedParams, {
        service: 'batch_trans_notify',
        _input_charset: 'utf-8',
        pay_date: 'YYYYMMDD'
      });
    });
  });

  describe('.MD5', function() {
    it('should return a 32-bit md5 string', function(){
      assert.ok(/\w{32}/.test(this.alipay.MD5('123')));
    });
  });
});

