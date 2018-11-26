import 'isomorphic-fetch';
import Vue from 'vue';
import App from './App.vue';
import ApolloSSR from 'vue-apollo/ssr';
import { createApp } from './main';

Vue.use(ApolloSSR);

export default context => {
  return new Promise(async (resolve, reject) => {
    const {
      app,
      router,
      store,
      apolloProvider,
    } = await createApp();

    router.push(context.url);

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();

      Promise.all([
        // Async data
        ...matchedComponents.map(component => {
          // noinspection JSUnresolvedVariable
          if (component.asyncData) {
            return component.asyncData({
              store,
              route: router.currentRoute,
            });
          }
        }),
        // Apollo prefetch
        ApolloSSR.prefetchAll(apolloProvider, [App, ...matchedComponents], {
          store,
          route: router.currentRoute,
        }),
      ]).then(() => {
        // After all preFetch hooks are resolved, our store is now
        // filled with the state needed to render the app.
        // When we attach the state to the context, and the `template` option
        // is used for the renderer, the state will automatically be
        // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
        context.state = store.state;

        // Same for Apollo client cache
        context.apolloState = ApolloSSR.getStates(apolloProvider);
        resolve(app);
      });
    }, reject);
  });
};
