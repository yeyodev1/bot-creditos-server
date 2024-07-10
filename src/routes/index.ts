import express, { Application } from 'express';

import user from './user';
import credit from './credit';
import financialData from './financialData';
import upload from './upload';

function routerApi(app: Application) {
  const router = express.Router();

  app.use('/api', router);

  router.use(user);
  router.use(credit);
  router.use(upload);
  router.use(financialData);
}

export default routerApi