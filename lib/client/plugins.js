import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';
import bButton from 'bootstrap-vue/es/components/button/button';
import bButtonGroup from 'bootstrap-vue/es/components/button-group/button-group';
import bCard from 'bootstrap-vue/es/components/card/card';
import bCol from 'bootstrap-vue/es/components/layout/col';
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown';
import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
import bDropdownItemButton from 'bootstrap-vue/es/components/dropdown/dropdown-item-button';
import bFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append';
import bModal from 'bootstrap-vue/es/components/modal/modal';
import bRow from 'bootstrap-vue/es/components/layout/row';
import bTab from 'bootstrap-vue/es/components/tabs/tab';
import bTable from 'bootstrap-vue/es/components/table/table';
import bTabs from 'bootstrap-vue/es/components/tabs/tabs';
import bToggle from 'bootstrap-vue/es/directives/toggle/toggle';


export function installPlugins (Vue) {
  Vue.component('FontAwesomeIcon', FontAwesomeIcon);
  Vue.component('FontAwesomeLayers', FontAwesomeLayers);
  Vue.component('FontAwesomeLayersText', FontAwesomeLayersText);
  Vue.component('bButton', bButton);
  Vue.component('bButtonGroup', bButtonGroup);
  Vue.component('bCard', bCard);
  Vue.component('bCol', bCol);
  Vue.component('bCollapse', bCollapse);
  Vue.component('bContainer', bContainer);
  Vue.component('bDropdown', bDropdown);
  Vue.component('bDropdownItem', bDropdownItem);
  Vue.component('bDropdownItemButton', bDropdownItemButton);
  Vue.component('bFormCheckboxGroup', bFormCheckboxGroup);
  Vue.component('bFormGroup', bFormGroup);
  Vue.component('bFormInput', bFormInput);
  Vue.component('bFormSelect', bFormSelect);
  Vue.component('bInputGroup', bInputGroup);
  Vue.component('bInputGroupAppend', bInputGroupAppend);
  Vue.component('bModal', bModal);
  Vue.component('bRow', bRow);
  Vue.component('bTab', bTab);
  Vue.component('bTable', bTable);
  Vue.component('bTabs', bTabs);
  Vue.directive('bToggle', bToggle);
}
