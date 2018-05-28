import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter.install);

function createRoutes () {
  return [
    { path: '/app', redirect: { path: '/' } },
    { path: '/', name: 'dashboard', component: () => import('../components/TheDashboard') },
    { path: '/browser', name: 'browser', component: () => import('../components/TheBrowser') },
    { path: '*', name: 'error', component: () => import('../components/TheError') },
  ];
}

export function createRouter () {
  return new VueRouter({
    mode: 'history',
    routes: createRoutes(),
  });
}
