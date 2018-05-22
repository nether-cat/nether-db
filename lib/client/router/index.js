import Vue from 'vue';
import VueRouter from 'vue-router';
import TheDashboard from '../components/TheDashboard';
import TheBrowser from '../components/TheBrowser';

Vue.use(VueRouter);

const routes = [
  { path: '/', name: 'dashboard', components: { content: TheDashboard } },
  { path: '/browser', name: 'browser', components: { content: TheBrowser } },
];

export default new VueRouter({
  routes,
  mode: 'history',
});
