function getTitle (vm) {
  // components can simply provide a `title` option
  // which can be either a string or a function
  const { title } = vm.$options;
  if (title) {
    return typeof title === 'function'
      ? title.call(vm)
      : title;
  }
}

const headMixinServer = {
  created () {
    const title = getTitle(this);
    if (title) {
      this.$ssrContext.title = title;
    }
  },
};

const headMixinClient = {
  mounted () {
    const title = getTitle(this);
    if (title) {
      document.title = title;
    }
  },
};

export const headMixin = (process.env.VUE_SSR)
  ? headMixinServer
  : headMixinClient;
