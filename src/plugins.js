import { BNavItem } from 'bootstrap-vue';
// fix `BNavItem` defaults for props specific to `RouterLink`
BNavItem.options.props.activeClass.default = 'active';
BNavItem.options.props.exactActiveClass.default = 'exact-active';

import BootstrapVue from 'bootstrap-vue';

import { library } from '@fortawesome/fontawesome-svg-core';

import {
  faAlignLeft,
  faAngleDoubleUp,
  faArchive,
  faArrowsAltV,
  faBell,
  faBolt,
  faBook,
  faBug,
  faBullhorn,
  faCaretRight,
  faChartArea,
  faCheck,
  faCheckCircle,
  faCircle,
  faCircleNotch,
  faClock,
  faCog,
  faCommentDots,
  faCommentSlash,
  faCompass,
  faDatabase,
  faDirections,
  faDownload,
  faEllipsisH,
  faEnvelope,
  faExclamationCircle,
  faExclamationTriangle,
  faExternalLinkAlt,
  faFilter,
  faGlobe,
  faGlobeAfrica,
  faGlobeAmericas,
  faGlobeAsia,
  faGlobeEurope,
  faHandsHelping,
  faHistory,
  faHome,
  faHourglass,
  faHourglassHalf,
  faInfo,
  faInfoCircle,
  faLayerGroup,
  faLevelDownAlt,
  faLink,
  faMapMarkerAlt,
  faMapPin,
  faMicroscope,
  faPhone,
  faPowerOff,
  faQuestionCircle,
  faQuoteRight,
  faRedo,
  faRulerVertical,
  faSearch,
  faShare,
  faSignInAlt,
  faSlash,
  faSnowflake,
  faSpinner,
  faTimes,
  faTimesCircle,
  faUserCircle,
  faWater,
} from '@fortawesome/free-solid-svg-icons';

import {
  faArrowAltCircleUp,
  faCircle as faCircleRegular,
  faClock as faClockRegular,
  faEye,
  faEyeSlash,
  faHandPointRight,
  faMinusSquare,
  faPlusSquare,
} from '@fortawesome/free-regular-svg-icons';

import {
  faVuejs,
} from '@fortawesome/free-brands-svg-icons';

library.add(
  faAlignLeft,
  faAngleDoubleUp,
  faArchive,
  faArrowAltCircleUp,
  faArrowsAltV,
  faBell,
  faBolt,
  faBook,
  faBug,
  faBullhorn,
  faCaretRight,
  faChartArea,
  faCheck,
  faCheckCircle,
  faCircle,
  faCircleNotch,
  faCircleRegular,
  faClock,
  faClockRegular,
  faCog,
  faCommentDots,
  faCommentSlash,
  faCompass,
  faDatabase,
  faDirections,
  faDownload,
  faEllipsisH,
  faEnvelope,
  faExclamationCircle,
  faExclamationTriangle,
  faExternalLinkAlt,
  faEye,
  faEyeSlash,
  faFilter,
  faGlobe,
  faGlobeAfrica,
  faGlobeAmericas,
  faGlobeAsia,
  faGlobeEurope,
  faHandPointRight,
  faHandsHelping,
  faHistory,
  faHome,
  faHourglass,
  faHourglassHalf,
  faInfo,
  faInfoCircle,
  faLayerGroup,
  faLevelDownAlt,
  faLink,
  faMapMarkerAlt,
  faMapPin,
  faMicroscope,
  faMinusSquare,
  faPhone,
  faPlusSquare,
  faPowerOff,
  faQuestionCircle,
  faQuoteRight,
  faRedo,
  faRulerVertical,
  faSearch,
  faShare,
  faSignInAlt,
  faSlash,
  faSnowflake,
  faSpinner,
  faTimes,
  faTimesCircle,
  faUserCircle,
  faVuejs,
  faWater,
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

import * as changeCase from 'change-case';

import { MixinHead } from './mixins/mixin-head';

export function installPlugins (Vue) {
  // add filter functions from change-case
  Object.entries(changeCase).forEach(([name, func]) => {
    Vue.filter(name, func);
  });
  Vue.filter('coordinates', ({ latitude, longitude }) => {
    latitude = Number.parseFloat(latitude);
    longitude = Number.parseFloat(longitude);
    latitude = Math.abs(latitude).toFixed(5) + (latitude < 0 ? '° S' : '° N');
    latitude = String(' ').repeat(11 - latitude.length) + latitude;
    longitude = Math.abs(longitude).toFixed(5) + (longitude < 0 ? '° W' : '° E');
    longitude = String(' ').repeat(12 - longitude.length) + longitude;
    return [latitude, longitude].join(', ');
  });
  // add components from vue-fontawesome
  Vue.component('FontAwesomeIcon', FontAwesomeIcon);
  Vue.component('FontAwesomeLayers', FontAwesomeLayers);
  Vue.component('FontAwesomeLayersText', FontAwesomeLayersText);
  // add higher order component that will be skipped during SSR
  Vue.component('SkipServerSide', SkipServerSide);
  // add mixin to modify our head
  Vue.mixin(MixinHead);
  // install plugins from bootstrap-vue
  Vue.use(BootstrapVue);
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
