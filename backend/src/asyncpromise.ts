import async from 'async';
import pify from 'pify';
import util from 'util';

const EXCLUDE_METHODS: string[] = ['apply', 'memoize', 'log', 'dir', 'noConflict']
const sync: { [key: string]: any } = async;
function remove(arr: Array<string>, element: string) {
  const index = arr.indexOf(element)
  index !== -1 && arr.splice(index, 1)
}

const methods: Array<any> = Object.keys(async)

EXCLUDE_METHODS.forEach((exclude: string) => {
  remove(methods, exclude)
})

const asyncPromise = methods.reduce((accumulator: { [key: string]: any }, method: string) => {
  accumulator[method] = pify(sync[method])
  return accumulator
}, {})

export default methods.reduce(function (accumulator: { [key: string]: any }, method: any) {
  accumulator[method] = (function () {
    const cb = arguments[arguments.length - 1]
    const proxy = util.isFunction(cb) ? async : asyncPromise
    return proxy[method]
  })()
  return accumulator
}, {})