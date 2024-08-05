import express from 'express';

import config from '../../config/config';
import docsRoute from './docs.route';
import historyRoute from './history.route';
import metricsRoute from './metrics.route';
import savedContractRoute from './savedContract.route';
import userRoute from './user.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/metrics',
    route: metricsRoute
  },
  {
    path: '/saved-contracts',
    route: savedContractRoute
  },
  {
    path: '/history',
    route: historyRoute
  },
  {
    path: '/users',
    route: userRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
