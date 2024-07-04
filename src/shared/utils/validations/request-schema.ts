import Joi from 'joi';
import { BadRequestException } from '../exceptions';

const PASSWORD_REGEX = /^[a-zA-Z0-9]{3,30}$/;

const signUpSchema = Joi.object({
  user_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).regex(PASSWORD_REGEX).required(),
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

const createWalletSchema = Joi.object({
  user_id: Joi.string().required(),
  currency: Joi.string().valid('NGN', 'USD', 'EUR').optional(),
  balance: Joi.number().default(0).optional(),
});

const walletIDSchema = Joi.object({
  wallet_id: Joi.string().required(),
});

const fundWalletSchema = Joi.object({
  amount: Joi.number().min(1000).required(),
});

const creditWalletSchema = Joi.object({
  reference: Joi.string().required(),
});

const initializePaymentSchema = Joi.object({
  wallet_id: Joi.string().required(),
  amount: Joi.number().min(1000).required(),
});

const transferSchema = Joi.object({
  source_wallet_id: Joi.string().required(),
  destination_wallet_id: Joi.string().required(),
  amount: Joi.number().min(1000).required(),
});

const withdrawalSchema = Joi.object({
  wallet_id: Joi.string().required(),
  amount: Joi.number().min(1000).required(),
  account_number: Joi.string().optional(),
  // bank_code: Joi.string().default('058').optional(),
  bank_code: Joi.string().optional(),
});

export {
  signUpSchema,
  createWalletSchema,
  walletIDSchema,
  fundWalletSchema,
  initializePaymentSchema,
  creditWalletSchema,
  transferSchema,
  withdrawalSchema,
};
