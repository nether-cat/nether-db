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
  const layout = {
    header: () => import('@/views/ViewHeader'),
    navigation: () => import('@/views/ViewNavigation'),
    footer: () => import('@/views/ViewFooter'),
  };
  const isStrict = session => !(session && session.strictEnv === false);
  return [
    {
      path: '/',
      name: 'dashboard',
      components: {
        ...layout,
        default: () => import('@/views/ViewDashboard'),
      },
      meta: {
        beforeEachHook: ({ data, router, to, next }) => {
          if (!data || isStrict(data.session) && !conformsTo(data.session, {
            state: value => value === 'AUTHORIZED',
          })) {
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
        ...layout,
        default: () => import('@/views/ViewDatabase'),
      },
      meta: {
        beforeEachHook: ({ data, router, to, next }) => {
          if (!data || isStrict(data.session) && !conformsTo(data.session, {
            state: value => value === 'AUTHORIZED',
          })) {
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
            default: () => import('@/views/ViewDatabaseIndex'),
          },
        },
        {
          path: 'details/:lakeId',
          name: 'databaseDetails',
          components: {
            default: () => import('@/views/ViewDatabaseDetails'),
          },
          props: {
            default: route => pick({ ...route.query, ...route.params }, ['lakeId', 'datasetId']),
          },
        },
      ],
    },
    {
      path: '/login',
      components: {
        default: () => import('@/views/ViewAuth'),
      },
      children: [
        {
          path: '',
          name: 'login',
          components: {
            default: () => import('@/views/ViewAuthLogin'),
          },
          props: {
            default: route => pick(route.query, ['q', 'redirect']),
          },
        },
        {
          path: '/forgot',
          name: 'forgot',
          components: {
            default: () => import('@/views/ViewAuthForgot'),
          },
          props: {
            default: route => pick(route.query, ['redirect']),
          },
        },
        {
          path: '/signup',
          name: 'signup',
          components: {
            default: () => import('@/views/ViewAuthSignup'),
          },
        },
        {
          path: '/confirm',
          name: 'confirm',
          components: {
            default: () => import('@/views/ViewAuthConfirm'),
          },
          props: {
            default: route => pick(route.query, ['token']),
          },
        },
      ],
      meta: {
        beforeEachHook: ({ data, router, to, next }) => {
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
      path: '/credentials',
      components: {
        default: () => import('@/views/ViewAuth'),
      },
      children: [
        {
          path: '',
          name: 'credentials',
          components: {
            default: () => import('@/views/ViewAuthCredentials'),
          },
          props: {
            default: route => pick(route.query, ['token']),
          },
        },
      ],
    },
    {
      path: '/contact',
      name: 'contact',
      components: {
        ...layout,
        default: () => import('@/views/ViewContact'),
      },
    },
    {
      path: '/imprint',
      name: 'imprint',
      components: {
        ...layout,
        default: () => import('@/views/ViewImprint'),
      },
    },
    {
      path: '*',
      name: 'missing',
      components: {
        ...layout,
        default: () => import('@/views/ViewMissing'),
      },
    },
  ];
}
