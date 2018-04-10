/**
 * throttle
 * 控制频繁的操作按照一定的频率执行，每threshold执行一次。
 *
 * @export
 * @param {function} fn
 * @param {number} threshold
 * @param {object} [option={ leading: false, trailing: false }]
 * - leading 函数在时间区间的开始触发，或是在结尾触发。
 * - trailing 表示当调用方法时，未到达threshold指定的时间间隔，则启动计时器延迟调用fn
 * @see http://www.cnblogs.com/fsjohnhuang/p/4147810.html?utm_source=tuicool&utm_medium=referral
 * @returns
 */
export default function throttle(
  fn: () => any,
  threshold: number,
  option = { leading: false, trailing: false }
) {
  let timeout: any;
  let previous = 0;
  let result: any;
  let ctx: any;
  let args: IArguments;

  function later() {
    // 保证fn在下一个时间区间再调用??
    previous = option.leading === false ? 0 : Date.now(); // previous = Date.now(); ??
    timeout = null;
    result = fn.apply(ctx, args);
  }

  return function() {
    ctx = this;
    args = arguments;
    const now = Date.now();
    // 设置在时间区间结尾触发fn
    if (!previous && option.leading === false) {
      previous = now;
    }
    const remaining = threshold - (now - previous);
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = fn.apply(ctx, args);
    } else if (!timeout && option.trailing === true) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}
