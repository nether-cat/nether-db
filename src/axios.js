import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL + '/v1',
});

instance.interceptors.request.use(function (config) {
  // read token from SSR context and pass it to the request
  let { renderContext = { token: null, cookieName: null } } = config;
  if (renderContext.token && renderContext.cookieName) {
    config.headers = {
      ...config.headers,
      Cookie: `${renderContext.cookieName}=${renderContext.token};`,
    };
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
  // read token from the response and return it to SSR context
  let { config, headers } = response;
  if (config['renderContext'] && Array.isArray(headers['set-cookie'])) {
    let { /** @type {Object} */ renderContext } = config;
    let newToken = headers['set-cookie']
      .find(val => val.startsWith(renderContext.cookieName))
      .split(';', 1)[0].split('=', 2)[1];
    if (newToken !== undefined) {
      renderContext.setToken(newToken);
    }
  }
  return response;
}, function (error) {
  return Promise.reject(error);
});

export default instance;
