import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter.install);

function createRoutes () {
  return [
    { path: '/', name: 'dashboard', component: () => import('../components/TheDashBoard') },
    { path: '/browser', name: 'browser', component: () => import('../components/TheBrowser') },
    { path: '*', name: 'error', component: () => import('../components/TheError') },
  ];
}

export default function () {
  return new VueRouter({
    mode: 'history',
    routes: createRoutes(),
  });
}
