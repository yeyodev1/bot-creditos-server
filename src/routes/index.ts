import express, { Application } from 'express';

import user from './user';
import credit from './credit';

function routerApi(app: Application) {
  const router = express.Router();

  app.use('/api', router);

  router.use(user);
  router.use(credit);
};

export default routerApi