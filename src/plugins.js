import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import bCard from 'bootstrap-vue/es/components/card/card';
import bCol from 'bootstrap-vue/es/components/layout/col';
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown';
import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
import bDropdownItemButton from 'bootstrap-vue/es/components/dropdown/dropdown-item-button';
import bForm from 'bootstrap-vue/src/components/form/form';
import bFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox';
import bFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bFormRadio from 'bootstrap-vue/es/components/form-radio/form-radio';
import bFormRadioGroup from 'bootstrap-vue/es/components/form-radio/form-radio-group';
import bFormRow from 'bootstrap-vue/es/components/layout/form-row';
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';
import bFormInvalidFeedback from 'bootstrap-vue/es/components/form/form-invalid-feedback';
import bFormValidFeedback from 'bootstrap-vue/es/components/form/form-valid-feedback';
import bImg from 'bootstrap-vue/es/components/image/img';
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
import bInputGroupAddon from 'bootstrap-vue/es/components/input-group/input-group-addon';
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append';
import bInputGroupPrepend from 'bootstrap-vue/es/components/input-group/input-group-prepend';
import bInputGroupText from 'bootstrap-vue/es/components/input-group/input-group-text';
import bLink from 'bootstrap-vue/es/components/link/link';
import bNav from 'bootstrap-vue/es/components/nav/nav';
import bNavForm from 'bootstrap-vue/es/components/nav/nav-form';
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
import bNavItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
import bProgress from 'bootstrap-vue/es/components/progress/progress';
import bProgressBar from 'bootstrap-vue/es/components/progress/progress-bar';
import bRow from 'bootstrap-vue/es/components/layout/row';
import bTable from 'bootstrap-vue/es/components/table/table';
import bToggle from 'bootstrap-vue/es/directives/toggle/toggle';

// fix nav item's defaults for router-link specific props
bNavItem.options.props.activeClass.default = 'active';
bNavItem.options.props.exactActiveClass.default = 'exact-active';

import { library } from '@fortawesome/fontawesome-svg-core';

import {
  faAlignLeft,
  faArchive,
  faBook,
  faCog,
  faChartArea,
  faCircleNotch,
  faDatabase,
  faEllipsisH,
  faExternalLinkAlt,
  faHandsHelping,
  faHome,
  faInfoCircle,
  faSearch,
  faSignInAlt,
  faSpinner,
  faTimes,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';

import {
  faEye,
  faEyeSlash,
} from '@fortawesome/free-regular-svg-icons';

library.add(
  faAlignLeft,
  faArchive,
  faBook,
  faCog,
  faChartArea,
  faCircleNotch,
  faDatabase,
  faEllipsisH,
  faExternalLinkAlt,
  faEye,
  faEyeSlash,
  faHandsHelping,
  faHome,
  faInfoCircle,
  faSearch,
  faSignInAlt,
  faSpinner,
  faTimes,
  faUserCircle,
);

import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';

import Vuelidate from 'vuelidate';

import noSSR from 'vue-no-ssr';

import { headMixin } from './mixins/head-mixin';

export function installPlugins (Vue) {
  // add components from bootstrap-vue
  Vue.component('bAlert', bAlert);
  Vue.component('bButton', bButton);
  Vue.component('bCard', bCard);
  Vue.component('bCol', bCol);
  Vue.component('bCollapse', bCollapse);
  Vue.component('bContainer', bContainer);
  Vue.component('bDropdown', bDropdown);
  Vue.component('bDropdownItem', bDropdownItem);
  Vue.component('bDropdownItemButton', bDropdownItemButton);
  Vue.component('bForm', bForm);
  Vue.component('bFormCheckbox', bFormCheckbox);
  Vue.component('bFormCheckboxGroup', bFormCheckboxGroup);
  Vue.component('bFormGroup', bFormGroup);
  Vue.component('bFormInput', bFormInput);
  Vue.component('bFormRadio', bFormRadio);
  Vue.component('bFormRadioGroup', bFormRadioGroup);
  Vue.component('bFormRow', bFormRow);
  Vue.component('bFormSelect', bFormSelect);
  Vue.component('bFormInvalidFeedback', bFormInvalidFeedback);
  Vue.component('bFormValidFeedback', bFormValidFeedback);
  Vue.component('bImg', bImg);
  Vue.component('bInputGroup', bInputGroup);
  Vue.component('bInputGroupAddon', bInputGroupAddon);
  Vue.component('bInputGroupAppend', bInputGroupAppend);
  Vue.component('bInputGroupPrepend', bInputGroupPrepend);
  Vue.component('bInputGroupText', bInputGroupText);
  Vue.component('bLink', bLink);
  Vue.component('bNav', bNav);
  Vue.component('bNavForm', bNavForm);
  Vue.component('bNavItem', bNavItem);
  Vue.component('bNavItemDropdown', bNavItemDropdown);
  Vue.component('bProgress', bProgress);
  Vue.component('bProgressBar', bProgressBar);
  Vue.component('bRow', bRow);
  Vue.component('bTable', bTable);
  // add components from vue-fontawesome
  Vue.component('FontAwesomeIcon', FontAwesomeIcon);
  Vue.component('FontAwesomeLayers', FontAwesomeLayers);
  Vue.component('FontAwesomeLayersText', FontAwesomeLayersText);
  // add component that skips SSR for its children
  Vue.component('no-ssr', noSSR);
  // add directives from from bootstrap-vue
  Vue.directive('bToggle', bToggle);
  // add mixin to modify our head
  Vue.mixin(headMixin);
  // install vuelidate plugin
  Vue.use(Vuelidate);
}
