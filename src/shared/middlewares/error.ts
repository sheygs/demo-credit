import {
  Application,
  Request as Req,
  Response as Res,
  NextFunction as NextFunc,
} from 'express';

import { BaseException, failureResponse } from '../utils';

const handleGlobalError = (
  error: unknown,
  _: Req,
  res: Res,
  _next: NextFunc,
): void => {
  if (error instanceof BaseException) {
    failureResponse(error, res, error.code);
  }
  _next();
};

export const defaultErrorHandler = (app: Application): Application =>
  app.use(handleGlobalError);
