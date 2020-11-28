// import braintree from 'braintree';
var braintree = require('braintree');

import keys from './keys';

export default new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: keys.mid,
  publicKey: keys.pbk,
  privateKey: keys.prk,
});