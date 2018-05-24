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
        // no matched routes, reject with 501
        // and set context status accordingly
        renderContext.status = 501;
        return reject({ status: 501 });
      } else if (router.currentRoute.name === 'error') {
        // matched wildcard route that
        // displays an error message,
        // set context status to 404
        renderContext.status = 404;
      } else {
        renderContext.status = 200;
      }
      // resolve to the app instance so it can be rendered
      return resolve(app);
    }, reject);
  });
}
