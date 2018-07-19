import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';

import bButton from 'bootstrap-vue/es/components/button/button';
import bCard from 'bootstrap-vue/es/components/card/card';
import bCol from 'bootstrap-vue/es/components/layout/col';
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown';
import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
import bDropdownItemButton from 'bootstrap-vue/es/components/dropdown/dropdown-item-button';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';
import bModal from 'bootstrap-vue/es/components/modal/modal';
import bNav from 'bootstrap-vue/es/components/nav/nav';
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
import bRow from 'bootstrap-vue/es/components/layout/row';
import bToggle from 'bootstrap-vue/es/directives/toggle/toggle';

import { headMixin } from './components/mixins/head-mixin';

export function installPlugins (Vue) {
  Vue.component('FontAwesomeIcon', FontAwesomeIcon);
  Vue.component('FontAwesomeLayers', FontAwesomeLayers);
  Vue.component('FontAwesomeLayersText', FontAwesomeLayersText);

  Vue.component('bButton', bButton);
  Vue.component('bCard', bCard);
  Vue.component('bCol', bCol);
  Vue.component('bCollapse', bCollapse);
  Vue.component('bContainer', bContainer);
  Vue.component('bDropdown', bDropdown);
  Vue.component('bDropdownItem', bDropdownItem);
  Vue.component('bDropdownItemButton', bDropdownItemButton);
  Vue.component('bFormGroup', bFormGroup);
  Vue.component('bFormInput', bFormInput);
  Vue.component('bFormSelect', bFormSelect);
  Vue.component('bModal', bModal);
  Vue.component('bNav', bNav);
  Vue.component('bNavItem', bNavItem);
  Vue.component('bRow', bRow);
  Vue.directive('bToggle', bToggle);

  Vue.mixin(headMixin);
}
