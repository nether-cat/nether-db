import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter.install);

function createRoutes () {
  return [
    {
      path: '/',
      name: 'dashboard',
      components: {
        default: () => import('../components/TheDashboard'),
      },
    },
    {
      path: '/app',
      redirect: {
        path: '/',
      },
    },
    {
      path: '/browser',
      name: 'browser',
      components: {
        default: () => import('../components/TheBrowser'),
      },
    },
    {
      path: '/user/:action(login|logout)',
      name: 'auth',
      components: {
        default: () => import('../components/TheUserAuth'),
      },
      meta: {
        hideTemplate: true,
      },
      props: { default: true },
    },
    {
      path: '*',
      name: 'missing',
      components: {
        default: () => import('../components/TheMissing'),
      },
    },
  ];
}

export function createRouter () {
  return new VueRouter({
    mode: 'history',
    routes: createRoutes(),
  });
}
