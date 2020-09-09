import braintree from 'braintree';
import keys from './keys';
export default braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: keys.mid,
  publicKey: keys.pbk,
  privateKey: keys.prk,
});