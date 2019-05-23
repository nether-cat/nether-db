import Vue from 'vue';
import VueRouter from 'vue-router';
import conformsTo from 'lodash/conformsTo';
import pick from 'lodash/pick';

Vue.use(VueRouter.install);

export function createRouter () {
  return new VueRouter({
    mode: 'history',
    fallback: false,
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
      meta: {
        beforeEachHook: ({ data, router, to, next }) => {
          if (!data || !conformsTo(data.session, { state: s => s === 'AUTHORIZED' })) {
            router.status = 403;
            next({
              name: 'login',
              query: { q: 'showInfo', redirect: to.fullPath },
            });
          } else {
            next();
          }
        },
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
      meta: {
        beforeEachHook: ({ data, router, to, next }) => {
          if (!data || !conformsTo(data.session, { state: s => s === 'AUTHORIZED' })) {
            router.status = 403;
            next({
              name: 'login',
              query: { q: 'showInfo', redirect: to.fullPath },
            });
          } else {
            next();
          }
        },
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
      path: '/login',
      components: {
        default: () => import('@/views/TheUserAuth'),
      },
      children: [
        {
          path: '',
          name: 'login',
          components: {
            default: () => import('@/components/UserLogin'),
          },
          props: {
            default: route => pick(route.query, ['q', 'redirect']),
          },
        },
        {
          path: '/signup',
          name: 'signup',
          components: {
            default: () => import('@/components/UserSignup'),
          },
        },
        {
          path: '/confirm',
          name: 'confirm',
          components: {
            default: () => import('@/components/UserConfirm'),
          },
          props: {
            default: route => pick(route.query, ['token']),
          },
        },
      ],
      meta: {
        hideTemplate: true,
        beforeEachHook: ({ data, router, next }) => {
          if (!data || !conformsTo(data.session, { state: s => s !== 'AUTHORIZED' })) {
            router.status = 403;
            next({
              name: 'dashboard',
            });
          } else {
            next();
          }
        },
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
