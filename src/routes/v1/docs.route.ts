import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import swaggerDefinition from '../../docs/swaggerDef';

const router = express.Router();

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/routes/v1/*.ts']
});

router.use('/', swaggerUi.serve as express.RequestHandler[]);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true
  }) as express.RequestHandler
);

export default router;
