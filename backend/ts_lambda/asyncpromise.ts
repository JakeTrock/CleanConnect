import async from 'async';
import util from 'util';
// import jwt from 'jsonwebtoken';

export default {
  forEachOf: util.promisify(async.forEachOf),
  waterfall: util.promisify(async.waterfall),
  // sign: util.promisify(jwt.sign),
  // verify: util.promisify(jwt.verify)
};