'use strict';

const version = exports.version = require('../package').version;

const supportedCurrencies = exports.supportedCurrencies = {
  EUR: 'EUR',
  USD: 'USD'
};

const supportedlanguages = exports.supportedlanguages = {
  SK: 'sk',
  EN: 'en',
  DE: 'de',
  HU: 'hu',
  CZ: 'cz',
  ES: 'es',
  FR: 'fr',
  IT: 'it',
  PL: 'pl'
};

const paymentMethods = exports.paymentMethods = {
  BANKCARD: 'BANKCARD'
}

const accessVars = exports.accessVars = {
  g_type: '',
  t_code: '',
  pwd: '',
  c_secret: ''
}


const authDomains = exports.authDomains = ["cardpay.com"];