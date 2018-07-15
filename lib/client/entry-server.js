import { createApp } from './app';

export default renderContext => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp();
    // Set server-side router's location.
    router.push(renderContext.url);
    // Wait until router has resolved possible async hooks and components.
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      if (!matchedComponents.length) {
        // No matched routes; Set HTTP status to '404 Not Found'
        // and reject the render context to cancel.
        renderContext.status = 404;
        return reject(renderContext);
      } else if (router.currentRoute.name === 'missing') {
        // Matched the wildcard route that displays an error
        // message accordingly; Set HTTP status to '404 Not Found'.
        renderContext.status = 404;
      }
      // Call `prefetchData()` on all matched route components.
      Promise.all(matchedComponents.map(component => {
        if (component.prefetchData) {
          return component.prefetchData({
            store,
            route: router.currentRoute,
            renderContext,
          });
        }
      })).then((redirect) => {
        redirect = redirect.find(value => value);
        if (redirect !== undefined) {
          let { href } = router.resolve(redirect);
          if (href) {
            return reject({ needsRedirect: href });
          }
        }
        // After all preconditions are resolved, our store is
        // now filled with the state needed to render the app.
        // When we attach the state to the context, and the `template` option
        // is used for the renderer, the state will automatically be
        // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
        renderContext.state = store.state;
        // Set HTTP status to '200 OK'.
        renderContext.status = 200;
        // Resolve the app instance to render it.
        resolve(app);
      }).catch(reject);
    }, reject);
  });
}
