'use strict';

const rp = require("request-promise"),
  uuid = require('uuid'),
  util = require('util'),
  cpConfig = require('./config'),
  extend = util._extend;

let sandbox_url = "https://sandbox.cardpay.com/";
let production_url = "https://cardpay.com/";

var REQUIRED_FIELDS = {
  default: ['m_id', 'm_desc', 'p_method', 'pd_currency', 'pd_amount', 'c_email', 'c_id', 'c_locale', 'ru_success', 'ru_decline', 'ru_cancel', 'ru_inprocess'] //+SIGN
};

function CardPayRequest(paymentData, options) {
  this.data = extend({}, paymentData);
  this.data.timestamp = new Date().toISOString();
  this.options = extend({}, cpConfig.accessVars);
  this.options = extend(this.options, options);
  console.log(this.options)
}

// ToDo cache token for 5 minutes
CardPayRequest.prototype.sign = function() {
  let options = {
    method: 'POST',
    uri: (this.options.production ? production_url : sandbox_url) + 'api/auth/token',
    form: {
      grant_type: this.options.g_type,
      terminal_code: this.options.t_code,
      password: this.options.pwd
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache'
    }
  };
  return rp(options);
};


CardPayRequest.prototype.pay = function(access_token) {

  let options = {
    method: 'POST',
    uri: (this.options.production ? production_url : sandbox_url) + 'api/payments',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Authorization': 'Bearer ' + access_token
    },
    body: {
      "request": {
        "id": uuid.v4(),
        "time": new Date().toISOString()
      },
      "merchant_order": {
        "id": this.data.m_id,
        "description": this.data.m_desc
      },
      "payment_method": this.data.p_method,
      "payment_data": {
        "currency": this.data.pd_currency,
        "amount": this.data.pd_amount
      },
      "customer": {
        "email": this.data.c_email,
        "id": this.data_c_id,
        "locale": this.data.c_locale
      },
      "return_urls": {
        "success_url": this.data.ru_success,
        "decline_url": this.data.ru_decline,
        "cancel_url": this.data.ru_cancel,
        "inprocess_url": this.data.ru_success.ru_inprocess
      }
    },
    json: true
  };

  return rp(options);

};


CardPayRequest.prototype.validateFields = function() {
  var reqFields = REQUIRED_FIELDS[this.options.cipher] ? REQUIRED_FIELDS[this.options.cipher] : REQUIRED_FIELDS['default'];
  var data = this.data;

  var reqFailed = reqFields.filter(function(fieldKey) {
    return !data[fieldKey] || data[fieldKey] === '';
  });
  if (reqFailed.length > 0) {
    return ['Missing required fields.', reqFailed];
  }

  var validCurr = false;
  for (var currKey in cpConfig.supportedCurrencies) {
    if (cpConfig.supportedCurrencies[currKey] === this.data.pd_currency) {
      validCurr = true;
      break;
    }
  }
  if (!validCurr) {
    return ['Unsupported currency.', ['pd_currency']];
  }

  var validPmethod = false;
  for (var pmethodKey in cpConfig.paymentMethods) {
    if (cpConfig.paymentMethods[pmethodKey] === this.data.p_method) {
      validPmethod = true;
      break;
    }
  }
  if (!validPmethod) {
    return ['Unsupported payment method.', ['p_method']];
  }

  if (this.data.c_locale) {
    var validLang = false;
    for (var langKey in cpConfig.supportedlanguages) {
      if (cpConfig.supportedlanguages[langKey] === this.data.c_locale) {
        validLang = true;
        break;
      }
    }
    if (!validLang) {
      return ['Unsupported language.', ['c_locale']];
    }
  }

  var invalidFields = [];
  // req field validation
  if (this.data.m_id.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/i) === null) {
    invalidFields.push('m_id');
  }

  if (this.data.pd_amount.match(/^[0-9]{1,9}(\.[0-9]+)?$/) === null) {
    invalidFields.push('pd_amount');
  }

  if (this.data.ru_success.match(/^(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))?$/) === null) {
    invalidFields.push('ru_success');
  }

  if (this.data.ru_cancel.match(/^(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))?$/) === null) {
    invalidFields.push('ru_cancel');
  }

  if (this.data.ru_inprocess.match(/^(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))?$/) === null) {
    invalidFields.push('ru_inprocess');
  }

  if (invalidFields.length > 0) {
    return ['Invalid fields.', invalidFields];
  } else {
    return null;
  }

};

module.exports = CardPayRequest;
