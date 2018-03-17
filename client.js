import Vue from 'vue';
import App from './lib/frontend/App.vue';
import FontAwesome from '@fortawesome/fontawesome';
import brands from '@fortawesome/fontawesome-free-brands';
import regular from '@fortawesome/fontawesome-free-regular';
import solid from '@fortawesome/fontawesome-free-solid';

FontAwesome.library.add(brands, regular, solid);

window.App = new Vue({
  el: '#app',
  render: h => h(App),
});

import './lib/frontend/index.html';
