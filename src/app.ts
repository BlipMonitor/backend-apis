import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';

import config from './config/config';
import morgan from './config/morgan';
import { errorConverter, errorHandler } from './middlewares/error';
import xss from './middlewares/xss';
import routes from './routes/v1';
import ApiError from './utils/ApiError';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression() as express.RequestHandler);

// enable cors
app.use(cors());
app.options('*', cors());

// Add Clerk middleware
app.use(ClerkExpressWithAuth());

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
