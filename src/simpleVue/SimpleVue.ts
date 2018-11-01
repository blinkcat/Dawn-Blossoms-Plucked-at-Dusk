/**
 * custom object
 *
 * @interface CustomObj
 * @template T
 */
interface CustomObj<T> {
  [index: string]: T;
}

export interface Options {
  el: string;
  data: CustomObj<any>;
  methods: CustomObj<(...args: any[]) => void>;
}

/**
 * @see https://juejin.im/post/5acc17cb51882555745a03f8
 * @class SimpleVue
 */
export class SimpleVue {
  data!: Options['data'];
  private el!: Element;
  private methods!: Options['methods'];
  private bindingMap!: { [index in keyof SimpleVue['data']]: { directives: Watcher[] } };

  constructor(private options: Options) {
    this.init(options);
  }

  private init(options: Options) {
    const el = document.querySelector(options.el);
    if (el) {
      this.el = el;
    } else {
      throw Error(`can not find ${el}`);
    }
    this.data = options.data;
    this.methods = options.methods;
    this.bindingMap = {};
    this.observe(this.data);
    this.compile(this.el);
  }

  /**
   *  hijack data
   *
   * @private
   * @memberof SimpleVue
   */
  private observe(data: SimpleVue['data']) {
    for (const k in data) {
      if (data.hasOwnProperty(k)) {
        let v = data[k];
        if (typeof v === 'object') {
          this.observe(v);
        }
        const bindings: SimpleVue['bindingMap'][any] = (this.bindingMap[k] = { directives: [] });
        Object.defineProperty(data, k, {
          enumerable: true,
          configurable: true,
          get() {
            return v;
          },
          set(newVal) {
            if (v !== newVal) {
              v = newVal;
              if (bindings.directives.length !== 0) {
                bindings.directives.forEach(watcher => watcher.update());
              }
            }
          }
        });
      }
    }
  }

  private compile(root: SimpleVue['el']) {
    const nodes = root.children;
    // tslint:disable-next-line prefer-for-of
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.children.length !== 0) {
        this.compile(node);
      }
      if (node.hasAttribute('v-click')) {
        node.addEventListener('click', () => {
          this.methods[node.getAttribute('v-click')!].bind(this.data)();
        });
      }
      if (
        node.hasAttribute('v-model') &&
        (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')
      ) {
        const attrVal = node.getAttribute('v-model')!;
        this.bindingMap[attrVal].directives.push(
          new Watcher('input', node, this, attrVal, 'value')
        );
        node.addEventListener('input', () => {
          this.data[attrVal] = (node as any).value;
        });
      }
      if (node.hasAttribute('v-bind')) {
        const attrVal = node.getAttribute('v-bind')!;
        this.bindingMap[attrVal!].directives.push(
          new Watcher('text', node, this, attrVal, 'innerHTML')
        );
      }
    }
  }
}

/**
 * directive
 *
 * @class Watcher
 */
class Watcher {
  constructor(
    private name: string,
    private el: Element,
    private vm: SimpleVue,
    private exp: string,
    private attr: string
  ) {
    this.update();
  }

  update() {
    (this.el as any)[this.attr] = this.vm.data[this.exp];
  }
}
