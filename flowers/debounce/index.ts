/**
 * debounce
 * 一段时间内(>=threshold)将多次操作合并为一次
 *
 * @export
 * @param {function} fn
 * @param {number} threshold 时间区间长度
 * @param {boolean} immediate 函数在时间区间的开始触发，或是在结尾触发
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @see https://css-tricks.com/debouncing-throttling-explained-examples/
 * @returns
 */
export default function debounce(fn: () => any, threshold: number, immediate = false) {
  let timeout: any;
  let result: any;
  let args: IArguments;
  let ctx: any;

  function later() {
    if (!immediate) {
      result = fn.apply(ctx, args);
    }
    timeout = null;
  }

  return function() {
    args = arguments;
    ctx = this;
    if (timeout) {
      clearTimeout(timeout);
    } else if (immediate) {
      result = fn.apply(ctx, args);
    }
    timeout = setTimeout(later, threshold);
    return result;
  };
}
