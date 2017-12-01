import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App.vue'

Vue.use(BootstrapVue);

window.App = new Vue({
  el: '#app',
  render: h => h(App)
});

require('./index.html');
