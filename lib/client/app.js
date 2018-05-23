import Vue from 'vue';
import FontAwesome from '@fortawesome/fontawesome';
import Brands from '@fortawesome/fontawesome-free-brands';
import Regular from '@fortawesome/fontawesome-free-regular';
import Solid from '@fortawesome/fontawesome-free-solid';
import App from './components/App';
import createRouter from './router';

FontAwesome.library.add(Brands, Regular, Solid);

export default function () {
  const router = createRouter();
  const app = new Vue({
    router: router,
    render: h => h(App)
  });
  return { app, router };
}
