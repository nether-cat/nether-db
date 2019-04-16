import 'isomorphic-fetch';
import Vue from 'vue';
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
    } = await createApp({
      beforeProvider(options) {
        options.ssr = true;
        let cookieHeader = context.req.header('Cookie');
        if (cookieHeader) {
          options.httpLinkOptions.headers = {
            cookie: context.req.header('Cookie'),
          };
        }
      },
    });
    router.push(context.url);
    router.onReady(() => {
      // This `rendered` hook is called when the app has finished rendering
      context.rendered = () => {
        // After the app is rendered, our store is filled with the
        // Vuex state from our components. When we attach the state to
        // the context, and the `template` option is used for the renderer,
        // the state will automatically be serialized and injected into
        // our DOM as `window.__INITIAL_STATE__`.
        context.state = store.state;
        // Also inject the Apollo cache state as `window.__APOLLO_STATE__`
        context.apolloState = ApolloSSR.getStates(apolloProvider);
        // Additionally we eventually add the router's status code
        if (router.status && router.status !== 200) {
          // TODO: Figure out if one could also trigger HTTP redirects here.
          context.httpCode = router.status;
        }
      };
      resolve(app);
    }, reject);
  });
};
