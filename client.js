import Vue from 'vue';
import App from './lib/client/App';
import FontAwesome from '@fortawesome/fontawesome';
import brands from '@fortawesome/fontawesome-free-brands';
import regular from '@fortawesome/fontawesome-free-regular';
import solid from '@fortawesome/fontawesome-free-solid';

FontAwesome.library.add(brands, regular, solid);

window.PaLimClient = new Vue({
  el: '#app',
  render: h => h(App),
});

import './lib/client/index.html';
