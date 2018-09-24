import { SimpleVue, Options } from './SimpleVue';

const vm: Options = {
  el: '#app',
  data: {
    number: 0,
    count: 1
  },
  methods: {
    increment(this: data) {
      this.number++;
      this.count++;
    }
  }
};

type data = typeof vm['data'];

window.onload = function() {
  const app = new SimpleVue(vm);
};
