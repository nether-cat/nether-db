import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bRow from 'bootstrap-vue/es/components/layout/row';
import bCol from 'bootstrap-vue/es/components/layout/col';
import bButton from 'bootstrap-vue/es/components/button/button';
import bCard from 'bootstrap-vue/es/components/card/card';
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bToggle from 'bootstrap-vue/es/directives/toggle/toggle';

export function installPlugins (Vue) {
  Vue.component('FontAwesomeIcon', FontAwesomeIcon);
  Vue.component('bContainer', bContainer);
  Vue.component('bRow', bRow);
  Vue.component('bCol', bCol);
  Vue.component('bButton', bButton);
  Vue.component('bCard', bCard);
  Vue.component('bCollapse', bCollapse);
  Vue.directive('bToggle', bToggle);
}
