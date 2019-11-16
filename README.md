# nether-db

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Node Version](https://img.shields.io/badge/node-%3E%3D8.16.0-brightgreen.svg)](package.json)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

`nether-db` powers the Varved Sediments Database (VARDA) to provide standardized
climate proxy records from annually resolved lake sediment archives. It's being developed in cooperation
with the Helmholtz Centre Potsdam - German Research Centre for Geosciences (GFZ).

## License

[MIT](LICENSE.md)

## System prerequisites

* Neo4j v3.5.x needs to be installed, up and running [[?]][1]
* Neo4j plugin APOC needs to be installed and not restricted [[?]][2]
* Node.js v8.x should be used (greater major versions might work)
* Managing multiple Node.js versions is fairly simple with `nvm` [[?]][3]
* Using `npm` in favor of `yarn` is recommended for this project 
* Nginx and `pm2` should be used when the app runs remotely [[?]][4]

[1]: https://neo4j.com/docs/operations-manual/current/installation/
[2]: https://neo4j.com/docs/labs/apoc/current/introduction/#installation
[3]: https://github.com/nvm-sh/nvm#git-install
[4]: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04

## Environment setup

See the configuration values in `.env` file. It's recommended to copy this file and name it `.env.local`
because that's ignored by Git. The SMTP setup is optional. By default all emails are sent to Ethereal
for debugging and the respective URLs are being logged in the server console.

## Building and running the app

#### (Re-) Installs all dependencies in respect of package-lock.json
```
npm ci
```

#### Imports data from lakes.json, datasets.json, records.json and Excel workbooks
```
npm run neo4j:seed
```

#### Dumps database contents and respective type docs (writes output to ./live/export)
```
npm run neo4j:dump
```

#### Compiles the app and hot-reloads modules for development (standalone, port 8000)
```
npm run ssr:serve
```

#### Compiles and minifies the app for production (writes output to ./dist)
```
npm run ssr:build
```

#### Starts the server-side renderer for production (standalone, port 8000)
```
npm run ssr:start
```

#### Starts the Apollo GraphQL server only (standalone, port 4000)
```
npm run apollo:run
```

#### Starts SSR and the Apollo GraphQL server together (combined, port 4000)
```
npm run apollo:ssr
```

#### Lints and fixes files
```
npm run lint
```

#### Lints files and displays results only
```
npm run lint -- --no-fix
```

#### Runs the end-to-end tests
```
npm run test:e2e
```

#### Runs the unit tests
```
npm run test:unit
```
