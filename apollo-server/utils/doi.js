const axios = require('axios');
const chalk = require('chalk');

const contentTypes = {
  'csl+json': {
    header: 'application/vnd.citationstyles.csl+json',
    process: (DOI, data) => data,
  },
  'csl+harvard3': {
    header: 'text/x-bibliography; style=harvard3',
    process: (DOI, data) => {
      return {
        'DOI': DOI,
        'formatted-citation': data,
        'formatted-style': 'harvard3',
      };
    },
  },
  'csl+copernicus-publications': {
    header: 'text/x-bibliography; style=copernicus-publications',
    process: (DOI, data) => {
      return {
        'DOI': DOI,
        'formatted-citation': data,
        'formatted-style': 'copernicus-publications',
      };
    },
  },
};

const retryStatusCodes = [
  408, // Request timed out
  429, // Too Many Requests
  500, // Internal Server Error
  503, // Service Unavailable
  504, // Gateway Timeout
];

const knownStatusCodes = [
  ...retryStatusCodes,
  401, // Unauthorized
  403, // Forbidden
  404, // Not Found
  406, // Unacceptable Type
  501, // Not Implemented
];

module.exports = {
  async resolve(DOI, type = 'csl+harvard3', { resolve, reject } = {}, retry = 0, maxRetries = 5) {
    let response, result;
    try {
      response = await axios.get(`https://doi.org/${DOI}`, {
        headers: { 'Accept': contentTypes[type].header },
      });
      result = contentTypes[type].process(DOI, response.data);
      let append = retry ? ` after retry ${chalk.yellow('#' + retry)} :)` : '.';
      console.log(`Received HTTP Status ${chalk.green(response.status)} for `
        + `DOI ${chalk.blueBright(DOI)} ~ Result has been parsed` + append);
    } catch (error) {
      if (error.response && retryStatusCodes.includes(error.response.status) && retry < maxRetries) {
        let waitSeconds = (++retry * 5) + Math.floor(Math.random() * 25);
        console.log(`Received HTTP Status ${chalk.red(error.response.status)} for DOI ${chalk.blueBright(DOI)} ~ `
          + `Retry ${chalk.yellow('#' + retry)} in ${chalk.whiteBright(waitSeconds)} seconds...`);
        try {
          result = await new Promise((resolve, reject) => {
            setTimeout(() => this.resolve(DOI, type, { resolve, reject }, retry, maxRetries), waitSeconds * 1000);
          });
        } catch (innerError) {
          console.error(chalk.red(`Skipped DOI ${chalk.blueBright(DOI)} because of the exception:`), innerError);
          result = { DOI, hasError: true, error: innerError };
          if (reject) reject(result);
          return result;
        }
      } else {
        let messages;
        if (error.response && knownStatusCodes.includes(error.response.status)) {
          messages = [`Received HTTP Status ${chalk.red(error.response.status)} for `
            + `DOI ${chalk.blueBright(DOI)} ~ ${chalk.red('Skipped.')}`];
        } else {
          messages = [chalk.red(`Skipped DOI ${chalk.blueBright(DOI)} because of the exception:`), error];
        }
        console.error(...messages);
        result = { DOI, hasError: true, error };
        if (reject) reject(result);
        return result;
      }
    }
    if (resolve) resolve(result);
    return result;
  },
};
