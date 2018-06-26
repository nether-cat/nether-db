import { createApp } from './app';

export default renderContext => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp();
    // set server-side router's location
    router.push(renderContext.url);
    // wait until router has resolved possible async components and hooks
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      if (!matchedComponents.length) {
        // no matched routes, set the status to 404
        // and reject the render context to cancel
        renderContext.status = 404;
        return reject(renderContext);
      } else if (router.currentRoute.name === 'missing') {
        // matched wildcard route that
        // displays an error message,
        // set context status to 404
        renderContext.status = 404;
      } else {
        renderContext.status = 200;
      }

      // call `asyncData()` on all matched route components
      Promise.all(matchedComponents.map(component => {
        if (component.asyncData) {
          return component.asyncData({
            renderContext,
            route: router.currentRoute,
            store,
          });
        }
      })).then(() => {
        // After all preFetch hooks are resolved, our store is
        // now filled with the state needed to render the app.
        // When we attach the state to the context, and the `template` option
        // is used for the renderer, the state will automatically be
        // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
        renderContext.state = store.state;
        // resolve the app instance to render it
        resolve(app);
      }).catch(reject);
    }, reject);
  });
}
