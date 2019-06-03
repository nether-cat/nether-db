import BAlert from 'bootstrap-vue/es/components/alert/alert';
import BButton from 'bootstrap-vue/es/components/button/button';
import BCard from 'bootstrap-vue/es/components/card/card';
import BCol from 'bootstrap-vue/es/components/layout/col';
import BCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import BContainer from 'bootstrap-vue/es/components/layout/container';
import BDropdown from 'bootstrap-vue/es/components/dropdown/dropdown';
import BDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
import BDropdownItemButton from 'bootstrap-vue/es/components/dropdown/dropdown-item-button';
import BForm from 'bootstrap-vue/src/components/form/form';
import BFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox';
import BFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group';
import BFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import BFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import BFormRadio from 'bootstrap-vue/es/components/form-radio/form-radio';
import BFormRadioGroup from 'bootstrap-vue/es/components/form-radio/form-radio-group';
import BFormRow from 'bootstrap-vue/es/components/layout/form-row';
import BFormSelect from 'bootstrap-vue/es/components/form-select/form-select';
import BFormInvalidFeedback from 'bootstrap-vue/es/components/form/form-invalid-feedback';
import BFormValidFeedback from 'bootstrap-vue/es/components/form/form-valid-feedback';
import BImg from 'bootstrap-vue/es/components/image/img';
import BInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
import BInputGroupAddon from 'bootstrap-vue/es/components/input-group/input-group-addon';
import BInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append';
import BInputGroupPrepend from 'bootstrap-vue/es/components/input-group/input-group-prepend';
import BInputGroupText from 'bootstrap-vue/es/components/input-group/input-group-text';
import BLink from 'bootstrap-vue/es/components/link/link';
import BNav from 'bootstrap-vue/es/components/nav/nav';
import BNavForm from 'bootstrap-vue/es/components/nav/nav-form';
import BNavItem from 'bootstrap-vue/es/components/nav/nav-item';
import BNavItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
import BProgress from 'bootstrap-vue/es/components/progress/progress';
import BProgressBar from 'bootstrap-vue/es/components/progress/progress-bar';
import BRow from 'bootstrap-vue/es/components/layout/row';
import BTable from 'bootstrap-vue/es/components/table/table';
import BToggle from 'bootstrap-vue/es/directives/toggle/toggle';

// fix nav item's defaults for router-link specific props
BNavItem.options.props.activeClass.default = 'active';
BNavItem.options.props.exactActiveClass.default = 'exact-active';

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
  faArrowAltCircleUp,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-regular-svg-icons';

import {
  faVuejs,
} from '@fortawesome/free-brands-svg-icons';

library.add(
  faAlignLeft,
  faArchive,
  faArrowAltCircleUp,
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
  faVuejs,
);

import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome/index.es';

import Vuelidate from 'vuelidate';

import VueObserveVisibility from 'vue-observe-visibility';

import VueScrollTo from 'vue-scrollto';

import SkipServerSide from 'vue-no-ssr';

import { MixinHead } from './mixins/mixin-head';

export function installPlugins (Vue) {
  // add components from bootstrap-vue
  Vue.component('BAlert', BAlert);
  Vue.component('BButton', BButton);
  Vue.component('BCard', BCard);
  Vue.component('BCol', BCol);
  Vue.component('BCollapse', BCollapse);
  Vue.component('BContainer', BContainer);
  Vue.component('BDropdown', BDropdown);
  Vue.component('BDropdownItem', BDropdownItem);
  Vue.component('BDropdownItemButton', BDropdownItemButton);
  Vue.component('BForm', BForm);
  Vue.component('BFormCheckbox', BFormCheckbox);
  Vue.component('BFormCheckboxGroup', BFormCheckboxGroup);
  Vue.component('BFormGroup', BFormGroup);
  Vue.component('BFormInput', BFormInput);
  Vue.component('BFormRadio', BFormRadio);
  Vue.component('BFormRadioGroup', BFormRadioGroup);
  Vue.component('BFormRow', BFormRow);
  Vue.component('BFormSelect', BFormSelect);
  Vue.component('BFormInvalidFeedback', BFormInvalidFeedback);
  Vue.component('BFormValidFeedback', BFormValidFeedback);
  Vue.component('BImg', BImg);
  Vue.component('BInputGroup', BInputGroup);
  Vue.component('BInputGroupAddon', BInputGroupAddon);
  Vue.component('BInputGroupAppend', BInputGroupAppend);
  Vue.component('BInputGroupPrepend', BInputGroupPrepend);
  Vue.component('BInputGroupText', BInputGroupText);
  Vue.component('BLink', BLink);
  Vue.component('BNav', BNav);
  Vue.component('BNavForm', BNavForm);
  Vue.component('BNavItem', BNavItem);
  Vue.component('BNavItemDropdown', BNavItemDropdown);
  Vue.component('BProgress', BProgress);
  Vue.component('BProgressBar', BProgressBar);
  Vue.component('BRow', BRow);
  Vue.component('BTable', BTable);
  // add components from vue-fontawesome
  Vue.component('FontAwesomeIcon', FontAwesomeIcon);
  Vue.component('FontAwesomeLayers', FontAwesomeLayers);
  Vue.component('FontAwesomeLayersText', FontAwesomeLayersText);
  // add higher order component that will be skipped during SSR
  Vue.component('SkipServerSide', SkipServerSide);
  // add directives from from bootstrap-vue
  Vue.directive('BToggle', BToggle);
  // add mixin to modify our head
  Vue.mixin(MixinHead);
  // install vuelidate plugin
  Vue.use(Vuelidate);
  // install vue-observe-visibility plugin
  Vue.use(VueObserveVisibility);
  // install vue-scrollto plugin
  Vue.use(VueScrollTo);
}

/**
 * Print a colored log message
 *
 * @param items
 * @param scope
 * @param severity
 */
export function log (items = [], scope = 'App', severity = 0) {
  if (false === [0, 1, 2].includes(severity)) {
    severity = 2;
  }
  const options = [
    { color: 'royalblue', type: 'Message' },
    { color: 'coral', type: 'Warning' },
    { color: 'red', type: 'Failure' },
  ];
  let { color, type } = options[severity];
  // eslint-disable-next-line no-console
  console.log(
    `%c${(Date.now() / 1000).toFixed(3)}%c|%c${type}%c|%c${scope}`,
    `
    background: dimgray;
    color: white;
    padding: 1px 1px 1px 4px;
    border-radius: 3px 0px 0px 3px;
    `,
    `
    background-image: linear-gradient(to right, dimgray, ${color});
    color: transparent;
    padding: 1px 0;
    border-radius: 0;
    `,
    `
    background: ${color};
    color: white;
    padding: 1px 1px;
    border-radius: 0;
    `,
    `
    background-image: linear-gradient(to right, ${color}, mediumpurple);
    color: transparent;
    padding: 1px 0;
    border-radius: 0;
    `,
    `
    background: mediumpurple;
    color: white;
    padding: 1px 4px 1px 1px;
    border-radius: 0px 3px 3px 0px;
    `,
    ...items,
  );
}

/**
 * ProvidePlugin will implicitly import `graphql-tag` for the tagged template, **disable** linting with `eslint-plugin-graphql` but still allow for injected syntax highlighting.
 *
 * @name ESLint$0.gql
 * @type function
 */
/**
 * ProvidePlugin will implicitly import `graphql-tag` for the tagged template, **enable** linting with `eslint-plugin-graphql` and still allow for injected syntax highlighting.
 *
 * @name ESLint$1.gql
 * @type function
 */
/**
 * DefinePlugin will replace this expression during build time to inject appropriate constants.
 *
 * @name process
 * @type object
 */
/**
 * DefinePlugin will replace this expression during build time to inject appropriate constants.
 *
 * @name process.env
 * @type object
 */
/**
 * DefinePlugin will replace this expression with `true` or `false` according to the build target.
 *
 * @name process.env.VUE_SSR
 * @type boolean
 */
