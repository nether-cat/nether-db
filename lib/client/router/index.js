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
      path: '/database',
      components: {
        default: () => import('../components/TheDatabase'),
      },
      children: [
        {
          path: '/',
          name: 'database',
          components: {
            default: () => import('../components/DatabaseViewIndex'),
          }
        },
        {
          path: 'details/:id',
          name: 'databaseDetails',
          components: {
            default: () => import('../components/DatabaseViewDetails'),
          }
        },
      ],
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
      path: '/contact',
      name: 'contact',
      components: {
        default: () => import('../components/TheContact'),
      },
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
