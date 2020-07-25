let timeout = false, done = true, status = 0x0, data = {}, $$ = {
  fs: require('fs'),
  path: require('path'),
  util: require('util'),
  ms: require('ms'),
  unorm: require('unorm'),
  inspector: require('inspector'),
  chalk: require('chalk').default,
};

module.exports = async function taskInspect ({ host, user, password }) {
  $$.inspector.open();
  setTimeout(() => {
    timeout = true;
  }, 10000);
  console.log("Closing when there's no connection after 10 seconds\n");
  while (!timeout || !done) {
    if ($$ && data) {
      debugger; // Execute code for inspection here
    } else {
      timeout = true;
      done = true;
    }
    await new Promise(resolve => setImmediate(() => {
      resolve();
    }));
  }
  return status;
};
