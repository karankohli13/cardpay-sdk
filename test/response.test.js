const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const CardPay = require('../lib/cardpay');
const CardPayResponse = require('../lib/response');
const shajs = require('sha.js');

const secret = {
  g_type: 'password',
  t_code: '19065',
  pwd: '2V1I7psS0Owj',
  c_secret: '7pAxG86Qz9Yu'
};

CardPay.configure(secret);

function getSignatureAndBody() {

  let body = {
    callback_time: '2019-08-22T12:12:02.057Z',
    payment_method: 'BANKCARD',
    merchant_order: { id: '9999' },
    customer: { email: 'karan@almora.io', ip: '14.98.85.34', locale: 'en' },
    payment_data: {
      id: '2200739',
      status: 'DECLINED',
      amount: 20,
      currency: 'EUR',
      created: '2019-08-22T12:11:50.910323Z',
      decline_reason: 'Declined by 3-D Secure',
      decline_code: '04',
      is_3d: true
    },
    card_account: {
      masked_pan: '400000...0002',
      issuing_country_code: 'US',
      holder: 'SADK'
    }
  };

  let signature = shajs('sha512').update(JSON.stringify(body) + secret.c_secret).digest('hex');

  return { body, signature };

};

describe('CardPayResponse', function() {
  it('should call next() once', function() {
    let { signature, body } = getSignatureAndBody();
    console.log(signature);
    var req = httpMocks.createRequest({
      method: 'POST',
      headers: {
        signature: signature
      },
      body: body,
      url: '/callback'
    });
    var res = httpMocks.createResponse();

    let response = new CardPayResponse();
    let result = response.validateFields(req, res);

    expect(result).to.be.true;
  });
});
