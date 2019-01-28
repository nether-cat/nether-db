import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter.install);

export function createRouter () {
  return new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: createRoutes(),
  });
}

function createRoutes () {
  return [
    {
      path: '/',
      name: 'dashboard',
      components: {
        default: () => import('@/views/TheDashboard'),
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
        default: () => import('@/views/TheDatabase'),
      },
      children: [
        {
          path: '/',
          name: 'database',
          components: {
            default: () => import('@/components/DatabaseViewIndex'),
          },
        },
        {
          path: 'details/:id',
          name: 'databaseDetails',
          components: {
            default: () => import('@/components/DatabaseViewDetails'),
          },
        },
      ],
    },
    {
      path: '/user/login',
      name: 'auth',
      components: {
        default: () => import('@/views/TheUserAuth'),
      },
      meta: {
        hideTemplate: true,
      },
    },
    {
      path: '/contact',
      name: 'contact',
      components: {
        default: () => import('@/views/TheContact'),
      },
    },
    {
      path: '*',
      name: 'missing',
      components: {
        default: () => import('@/views/TheMissing'),
      },
    },
  ];
}
