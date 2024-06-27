import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import { RequestPath } from '../../types';
import { UnprocessableEntityException } from '../exceptions';

export const requestValidatorHandler = (
  schema: any,
  input: Record<string, string | number | object>,
) => {
  const { error } = schema.validate(input);

  if (error) {
    throw new UnprocessableEntityException(error.details[0].message);
  }
};

function validateRequest(schema: ObjectSchema<any>, requestPath: RequestPath) {
  return (req: Request, _: Response, next: NextFunction) => {
    const input = req[requestPath];

    requestValidatorHandler(schema, input);

    next();
  };
}

export { validateRequest };
