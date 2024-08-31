import { RequireAuthProp } from '@clerk/clerk-sdk-node';
import { RequestHandler } from 'express';
import { NextFunction, Request, Response } from 'express-serve-static-core';

export interface CustomParamsDictionary {
  [key: string]: any;
}

const catchAsync = (
  fn: (req: RequireAuthProp<Request>, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as RequireAuthProp<Request>, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;
