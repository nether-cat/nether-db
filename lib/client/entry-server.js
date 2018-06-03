import { createApp } from './app';

export default renderContext => {
  return new Promise((resolve, reject) => {
    const { app, router } = createApp();
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
      // resolve the app instance to render it
      return resolve(app);
    }, reject);
  });
}
