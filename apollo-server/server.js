import path from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ssrMiddleware from '@akryum/vue-cli-plugin-ssr/lib/app';

export default app => {
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use('/files', express.static(path.resolve(__dirname, '../live/uploads')));
  ssrMiddleware(app, { prodOnly: true });
};
