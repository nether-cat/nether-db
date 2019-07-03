# nether-db

## Prerequisites

* Neo4j v3.5.x or higher needs to be installed
* Neo4j plugin APOC needs to be installed
* NodeJS v8.x or higher needs to be installed
* Managing multiple NodeJS versions is easy using `nvm`
* Package manager `npm` should to be installed

## Project configuration

See the configuration values in `.env` file. It's recommended to copy this file and name it `.env.local` because that's ignored by Git. The SMTP setup is optional. By default all emails are transported to Ethereal for debugging and the URLs are being logged to the console of the Apollo GraphQL server.

## Project initialization
```
npm ci
```

### Imports database contents from lakes.json, datasets.json and the Excel workbooks
```
npm run neo4j:seed
```

### Compiles the app and hot-reloads modules for development (standalone, port 8000)
```
npm run ssr:serve
```

### Compiles and minifies the app for production
```
npm run ssr:build
```

### Starts the server-side renderer for production (standalone, port 8000)
```
npm run ssr:start
```

### Starts the Apollo GraphQL server only (standalone, port 4000)
```
npm run apollo:run
```

### Starts SSR and the Apollo GraphQL server together (combined, port 4000)
```
npm run apollo:ssr
```

### Lints and fixes files
```
npm run lint
```

### Lints files and displays results only
```
npm run lint -- --no-fix
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Run your unit tests
```
npm run test:unit
```
