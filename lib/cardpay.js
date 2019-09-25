'use strict';

const cpConfig = require('./config'),
  CardPayRequest = require('./request'),
  CardPayResponse = require('./response'),
  Errors = require('./errors');

module.exports = {
  version: cpConfig.version,
  currencies: cpConfig.supportedCurrencies,
  languages: cpConfig.supportedlanguages,

  configure: function(options) {
    if (options.g_type && options.t_code && options.pwd)
      for (let key in cpConfig.accessVars) {
        cpConfig.accessVars[key] = options[key];
      } else throw (Errors.validation_err)
  },

  pay: async function(data, options) {

    let request = new CardPayRequest(data, options);
    let validateResponse = request.validateFields();
    if (validateResponse !== null)
      throw Errors.validation_err;
    let token = await request.sign();
    token = JSON.parse(token);
    return request.pay(token.access_token);
  },

  verify: function(options) {

    return function(req, res, next) {

      let response = new CardPayResponse(options);

      let urlToTest,
        excludeTheseUrls;

      // Skip out on non mutable REST methods
      if (/GET|HEAD|OPTIONS|TRACE/i.test(req.method)) {
        return next();
      }

      urlToTest = response.resolveDomain(req);

      console.log("######### domain #########")
      console.log(urlToTest);
      console.log("####################")

      let urls = Object.values(response.options);

      excludeTheseUrls = urls.filter(function(excludeUrl) {
        return urlToTest.indexOf(excludeUrl) === 0;
      });

      if (!excludeTheseUrls.length) {
        return next(Errors.noauth_domain);
      }

      try {
        response.validateFields(req, res);
      } catch (err) {
        return next(err);
      }
      return next();
    };
  }

};
