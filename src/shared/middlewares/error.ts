import {
  Application,
  Request as Req,
  Response as Res,
  NextFunction as NextFunc,
} from 'express';
import { INTERNAL_SERVER_ERROR } from 'http-status';

import { BaseException, failureResponse } from '../utils';

const handleGlobalError = (
  error: unknown,
  _: Req,
  res: Res,
  _next: NextFunc,
): void => {
  // custom exceptions
  if (error instanceof BaseException) {
    failureResponse(error, res, error.code);
    return;
  }

  // Handle all other errors (database errors, unexpected errors, etc.)
  if (error instanceof Error) {
    failureResponse(
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      res,
      INTERNAL_SERVER_ERROR,
    );
    return;
  }

  // Handle unknown error types
  failureResponse(
    {
      name: 'UnknownError',
      message: 'An unexpected error occurred',
      stack: String(error),
    },
    res,
    INTERNAL_SERVER_ERROR,
  );
};

export const defaultErrorHandler = (app: Application): Application =>
  app.use(handleGlobalError);
