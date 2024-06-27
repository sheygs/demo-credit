import Joi from 'joi';
import { BadRequestException } from '../exceptions';

const passwordRegex = /^[a-zA-Z0-9]{3,30}$/;

const signUpSchema = Joi.object({
  user_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).regex(passwordRegex).required(),
  phone_number: Joi.string().min(11).optional(),
});

export const bearerTokenSchema: Joi.ObjectSchema<any> = Joi.object()
  .keys({
    authorization: Joi.string()
      .regex(/^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
      .required()
      .error(new BadRequestException('Invalid bearer token.')),
  })
  .unknown(true);

export { signUpSchema };
