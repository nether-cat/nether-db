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

const MixinHeadServer = {
  created () {
    const title = getTitle(this);
    if (title) {
      this.$ssrContext.title = title;
    }
  },
};

const MixinHeadClient = {
  mounted () {
    const title = getTitle(this);
    if (title) {
      document.title = title;
    }
  },
};

export const MixinHead = (process.env.VUE_SSR)
  ? MixinHeadServer
  : MixinHeadClient;
