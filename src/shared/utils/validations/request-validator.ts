import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import { RequestPath } from '../../types';
import { UnprocessableEntityException } from '../exceptions';

export const requestValidatorHandler = (
  schema: any,
  input: Record<string, string | number | object>,
) => {
  const { error, value } = schema.validate(input);

  if (error) {
    throw new UnprocessableEntityException(error.details[0].message);
  }

  return value;
};

function validateRequest(schema: ObjectSchema<any>, requestPath: RequestPath) {
  return (req: Request, _: Response, next: NextFunction) => {
    const input = req[requestPath];

    const validatedValue = requestValidatorHandler(schema, input);

    // Apply validated (sanitized/trimmed) values back to request
    req[requestPath] = validatedValue;

    next();
  };
}

export { validateRequest };
