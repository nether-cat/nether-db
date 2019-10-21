import Vue from 'vue';
import VueApollo from 'vue-apollo';
import { ucFirst } from 'change-case';
import { log } from '@/plugins';
// @ts-ignore
import { createApolloClient, restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client';
import { createHttpLink } from 'apollo-link-http';

// Install the vue plugin
Vue.use(VueApollo);

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token';

// Http endpoint
const httpEndpoint = process.env.VUE_APP_GRAPHQL_HTTP || 'http://localhost:4000/graphql';
// Files URL root
export const filesRoot = process.env.VUE_APP_FILES_ROOT || httpEndpoint.substr(0, httpEndpoint.indexOf('/graphql'));

Vue.prototype.$filesRoot = filesRoot;

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint,
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  // link: myLink

  // Override default cache
  // cache: myCache

  // Override the way the Authorization header is set
  // getAuth: (tokenName) => ...

  // Additional ApolloClient options
  // apollo: { ... }
};

// Call this in the Vue app file
export function createProvider (options: any = {}) {
  if (!options.defaultHttpLink && !options.link) {
    options.link = createHttpLink({
      uri: options.httpEndpoint || defaultOptions.httpEndpoint,
      ...(options.httpLinkOptions || {}),
    });
  }
  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient({
    ...defaultOptions,
    ...options,
  });
  apolloClient.wsClient = wsClient;

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        // TODO: Investigate current behaviour and consider changes
        // fetchPolicy: 'cache-and-network',
      },
    },
    errorHandler (err, vm?, key?: string, type?: 'query' | 'subscription', options?) {
      try {
        key = options.query.definitions[0].name.value;
      } catch {
        key = key && key != type ? key : 'NULL';
      }
      log([`${ucFirst(type || 'operation')} \`${key}\` -> ${err.message}`], 'Provider', 2);
      return true;
    },
  });

  return apolloProvider;
}

// Manually call this when user log in
export async function onLogin (apolloClient: any, token: string) {
  if (typeof localStorage !== 'undefined' && token) {
    localStorage.setItem(AUTH_TOKEN, token);
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient);
  try {
    await apolloClient.resetStore();
  } catch (err) {
    log(['Cache reset failed (login) -> ', err.message], 'Storage', 1);
  }
}

// Manually call this when user log out
export async function onLogout (apolloClient: any) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN);
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient);
  try {
    await apolloClient.resetStore();
  } catch (err) {
    log(['Cache reset failed (logout) -> ', err.message], 'Storage', 1);
  }
}
