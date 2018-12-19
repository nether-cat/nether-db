import { createApp } from './app';

const { app, router, store } = createApp();

if (window['__INITIAL_STATE__']) {
  store.replaceState(window['__INITIAL_STATE__'])
}

router.onReady(() => {
  // Add router hook for handling `prefetchData()`.
  // Doing it after the initial route is resolved so that we don't double-fetch
  // the data that we already have. Using `router.beforeResolve()` so that all
  // async components are resolved.
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to);
    const prevMatched = router.getMatchedComponents(from);
    // We only care about non-previously-rendered components,
    // so we compare them until the two matched lists differ.
    let diffed = false;
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c));
    });
    if (!activated.length) {
      return next();
    }

    // TODO: Trigger a loading indicator here

    Promise.all(activated.map(component => {
      if (component.prefetchData) {
        return component.prefetchData({ store, route: to });
      }
    })).then((redirect) => {
      redirect = redirect.find(value => value);
      if (redirect !== undefined) {
        console.log({ redirect });
        next(redirect);
      } else {
        next();
      }
    }).catch(next);
  });

  app.$mount('#app');
});

window.PaLimApp = app;
