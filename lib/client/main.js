import Vue from 'vue';
import FontAwesome from '@fortawesome/fontawesome';
import Brands from '@fortawesome/fontawesome-free-brands';
import Regular from '@fortawesome/fontawesome-free-regular';
import Solid from '@fortawesome/fontawesome-free-solid';
import App from './components/App';
import Router from './router';

FontAwesome.library.add(Brands, Regular, Solid);

window.PaLimClient = new Vue({
  el: '#app',
  router: Router,
  render: h => h(App),
});

import './index.html';
