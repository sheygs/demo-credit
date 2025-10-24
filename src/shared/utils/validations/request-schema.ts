import Joi from 'joi';
import { BadRequestException } from '../exceptions';

// SECURITY FIX: Stronger password requirements
// Must contain: lowercase, uppercase, number, special character
// Min 8 characters, max 128 characters
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,128}$/;

const signUpSchema = Joi.object({
  user_name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .regex(PASSWORD_REGEX)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&#)',
    }),
  phone_number: Joi.string().trim().min(11).max(15).optional(),
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
  user_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  currency: Joi.string().valid('NGN', 'USD', 'EUR').optional(),
  balance: Joi.number().default(0).optional(),
});

const walletIDSchema = Joi.object({
  wallet_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
});

// SECURITY: Define transaction limits to prevent excessive exposure
const MIN_TRANSACTION_AMOUNT = 1000; // NGN 1,000 (minimum)
const MAX_TRANSACTION_AMOUNT = 10000000; // NGN 10,000,000 (maximum per transaction)

const fundWalletSchema = Joi.object({
  amount: Joi.number()
    .min(MIN_TRANSACTION_AMOUNT)
    .max(MAX_TRANSACTION_AMOUNT)
    .required()
    .messages({
      'number.min': `Amount must be at least NGN ${MIN_TRANSACTION_AMOUNT.toLocaleString()}`,
      'number.max': `Amount cannot exceed NGN ${MAX_TRANSACTION_AMOUNT.toLocaleString()} per transaction`,
    }),
});

const creditWalletSchema = Joi.object({
  reference: Joi.string().required(),
});

const initializePaymentSchema = Joi.object({
  wallet_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  amount: Joi.number()
    .min(MIN_TRANSACTION_AMOUNT)
    .max(MAX_TRANSACTION_AMOUNT)
    .required()
    .messages({
      'number.min': `Amount must be at least NGN ${MIN_TRANSACTION_AMOUNT.toLocaleString()}`,
      'number.max': `Amount cannot exceed NGN ${MAX_TRANSACTION_AMOUNT.toLocaleString()} per transaction`,
    }),
});

const transferSchema = Joi.object({
  source_wallet_id: Joi.alternatives()
    .try(Joi.string(), Joi.number())
    .required(),
  destination_wallet_id: Joi.alternatives()
    .try(Joi.string(), Joi.number())
    .required(),
  amount: Joi.number()
    .min(MIN_TRANSACTION_AMOUNT)
    .max(MAX_TRANSACTION_AMOUNT)
    .required()
    .messages({
      'number.min': `Amount must be at least NGN ${MIN_TRANSACTION_AMOUNT.toLocaleString()}`,
      'number.max': `Amount cannot exceed NGN ${MAX_TRANSACTION_AMOUNT.toLocaleString()} per transaction`,
    }),
});

const withdrawalSchema = Joi.object({
  wallet_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  amount: Joi.number()
    .min(MIN_TRANSACTION_AMOUNT)
    .max(MAX_TRANSACTION_AMOUNT)
    .required()
    .messages({
      'number.min': `Amount must be at least NGN ${MIN_TRANSACTION_AMOUNT.toLocaleString()}`,
      'number.max': `Amount cannot exceed NGN ${MAX_TRANSACTION_AMOUNT.toLocaleString()} per transaction`,
    }),
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
