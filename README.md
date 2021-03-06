# CardPay

## Installation

```sh
$ npm install cardpay-sdk --save
```

## Documentation

<a name="configure"></a>
### configure(configObj);

Configuration global parameters.

__Arguments__
* `configObj`
    * `production` - true for production and false for sandbox (Default `false`)
    * `g_type` - grant_type (Should be `password` as stated in [OAuth specification](https://tools.ietf.org/html/rfc6749#section-4.4.2))
    * `t_code` - terminal_code (Unique terminal code used by the Cardpay payment system)
    * `pwd` - password (Terminal password)
    * `c_secret` - callback secret (Callback secret is also generated by Cardpay and received by Merchant with terminal code)

__Usage__
```javascript
const cardpay = require('cardpay-sdk')
let configObj = {
   production: false,
   g_type: '',
   t_code: '',
   pwd: '',
   c_secret: ''
}
cardpay.configure(configObj);
```

<a name="pay"></a>
### pay(paymentParams, [configObj]);

Create redirect url

__Arguments__

* `paymentParams`
    * `m_id` - Merchant Order ID **Required**
    * `m_desc` - Merchant Order Description **Required** or [`global config`](#configure)
    * `p_method` - Payment Method **Required** or [`global config`](#configure)
    * `pd_currency` - Payment Currency *Optional* or [`global config`](#configure)
    * `pd_amount` - Payment Amount **Required**
    * `c_id` - Unique Customer ID **Required**
    * `c_email` -  Customer Email Address **Required**
    * `c_locale` - Customer Language *Optional* or [`global config`](#configure)
    * `ru_success` - Return Success URL **Required** or [`global config`](#configure)
    * `ru_decline` -  Return Decline URL **Required** or [`global config`](#configure)
    * `ru_cancel` - Return Cancel URL **Required** or [`global config`](#configure)
    * `ru_inprocess` - Return In Process URL **Required** or [`global config`](#configure)

* `configObj` - *Optional* - use [`global config`](#configure) first

__Usage__
```javascript
let paymentData = {
    m_id: "00b46e01-3994-4ac2-939e-2d5052a65961",
    m_desc: 'sdasda',
    p_method: 'BANKCARD',
    pd_currency: 'EUR',
    pd_amount: "5.01",
    c_email: "x@x.io",
    c_id: "5sad3e123",
    c_locale: "en",
    ru_success: "http://70e47cb2.ngrok.io/success",
    ru_decline: "http://70e47cb2.ngrok.io/decline",
    ru_cancel: "http://70e47cb2.ngrok.io/cancel",
    ru_inprocess: "http://70e47cb2.ngrok.io/process",
};

let options = {
    test: true
}

// using async/await
try{
let payment = await cardpay.pay(paymentData, options);
}
catch(e){
// catch errors
}

// using promises
cardpay.pay(paymentData)
.then(success => {
// redirect URL
};
.error(err => {
}}
```

<a name="pay"></a>
### verify(options);

Verify callback signature middleware

__Arguments__

* `options` - *Optional* - ["domain"]

__Usage__
```javascript
app.post('/callback' , cardpay.verify(['ngrok.io']), async function(req, res, next) {
// your code here
}

```