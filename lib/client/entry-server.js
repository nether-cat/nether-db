import createApp from './app';

export default context => {
  return new Promise((resolve, reject) => {
    const { app, router } = createApp();
    // set server-side router's location
    router.push(context.url);
    // wait until router has resolved possible async components and hooks
    router.onReady(() => {
      debugger;
      context.foo = 'bar';
      debugger;
      const matchedComponents = router.getMatchedComponents();
      debugger;
      if (!matchedComponents.length) {
        // no matched routes, reject with 404
        return reject({ status: 404 });
      } else if (router.currentRoute.name === 'error') {
        // matched error route, set context status to 404
        context.status = 404;
      }
      // resolve to the app instance so it can be rendered
      resolve(app);
    }, reject);
  });
}
