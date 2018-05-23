import createApp from './app'

const { app, router } = createApp();

router.onReady(function() {
  app.$mount('#app');
});

window.PalimApp = app;
