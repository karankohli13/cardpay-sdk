'use strict';

const rp = require("request-promise"),
  uuid = require('uuid'),
  util = require('util'),
  cpConfig = require('./config'),
  shajs = require('sha.js'),
  Errors = require('./errors'),
  extend = util._extend;

function CardPayResponse(options) {
  this.options = cpConfig.authDomains.concat(options);
}

CardPayResponse.prototype.validateFields = function(req, res) {
  // create hahs
  let body = req.body;
  let sign = req.headers['signature'];
  if (!sign) throw Error(Errors.no_sign);

  let amt = body.payment_data.amount;
  console.log(body);
  amt = amt.toFixed(2);
  amt = [JSON.stringify(amt)];
  let str_body = JSON.stringify(body);
  let pre_hash = shajs('sha512').update(str_body + cpConfig.accessVars.c_secret).digest('hex');
  str_body = str_body.replace(/(?:"amount":)(.*?)(?:[1-9]\d*(\.\d+)?)/g, '"amount":'+ JSON.parse(amt));
  let hash = shajs('sha512').update(str_body + cpConfig.accessVars.c_secret).digest('hex');

  if (hash === sign || pre_hash === sign) {
    return true;
  } else throw Error(Errors.mismatch);


};


CardPayResponse.prototype.resolveDomain = function(req) {
  var host = req.get('host');
  var truncateAt = host.indexOf(':');
  var hosts = host.substr(0, truncateAt > -1 ? truncateAt : host.length);
  hosts = hosts.search(/[a-z]/i) != -1 ? hosts.split('.') : hosts = [hosts];
  var domain = hosts.length > 1 ? hosts[hosts.length - 2] + '.' + hosts[hosts.length - 1] : hosts[0];
  return domain;
};

module.exports = CardPayResponse;
