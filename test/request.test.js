const chai = require('chai');
const expect = chai.expect;
var CardPayRequest = require('../lib/request');

describe('CardPayRequest', function() {
  this.enableTimeouts(false);

  it('should return token', async function() {
      let request = new CardPayRequest({}, {
        g_type: 'password',
        t_code: '19065',
        pwd: '2V1I7psS0Owj',
        c_secret: '7pAxG86Qz9Yu'
      });

      let response = await request.sign();
      response = JSON.parse(response);
      expect(response).to.contain.keys("token_type", "access_token", "refresh_token", "expires_in", "refresh_expires_in");

  });

  it('should return url', async function() {
      let request = new CardPayRequest({
        m_id: "9999",
        m_desc: 'sdasda',
        p_method: 'BANKCARD',
        pd_currency: 'EUR',
        pd_amount: 20,
        c_email: "karan@almora.io",
        c_id: "5sad3e123",
        c_locale: "en",
        ru_success: "http://70e47cb2.ngrok.io",
        ru_decline: "http://70e47cb2.ngrok.io",
        ru_cancel: "http://70e47cb2.ngrok.io",
        ru_inprocess: "http://70e47cb2.ngrok.io",
      }, {
        g_type: 'password',
        t_code: '19065',
        pwd: '2V1I7psS0Owj',
        c_secret: '7pAxG86Qz9Yu'
      });

      let response = await request.sign();
      response = JSON.parse(response);
      let pay = await request.pay(response.access_token);
      console.log(pay)
      expect(pay).to.contain.keys("redirect_url");

  });

});
