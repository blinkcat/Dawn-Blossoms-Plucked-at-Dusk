type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

type AnyFunction = (...args: any[]) => any;

interface AnyObject {
  [index: string]: any;
}
