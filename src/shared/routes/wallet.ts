import { Router } from 'express';
import { WalletController } from '../../modules';
import { RequestPath } from '../types';
import { verifyAuthToken, verifyWalletOwnership } from '../middlewares';
import {
  createWalletSchema,
  validateRequest,
  walletIDSchema,
  fundWalletSchema,
  initializePaymentSchema,
  creditWalletSchema,
} from '../utils';
import {
  walletCreationRateLimiter,
  transferRateLimiter,
} from '../config/rate-limit';

const walletRouter: Router = Router();

walletRouter.post(
  '/',
  walletCreationRateLimiter, // SECURITY: Prevent excessive wallet creation
  validateRequest(createWalletSchema, RequestPath.BODY),
  verifyAuthToken,
  WalletController.createWallet,
);

walletRouter.post(
  '/initialize-payment',
  transferRateLimiter, // SECURITY: Rate limit payment initialization
  validateRequest(initializePaymentSchema, RequestPath.BODY),
  verifyAuthToken,
  verifyWalletOwnership, // SECURITY: Verify user owns wallet_id
  WalletController.initializePayment,
);

walletRouter.post(
  '/:wallet_id/deposit',
  transferRateLimiter, // SECURITY: Rate limit deposits
  validateRequest(walletIDSchema, RequestPath.PARAMS),
  validateRequest(fundWalletSchema, RequestPath.BODY),
  verifyAuthToken,
  verifyWalletOwnership, // SECURITY: Verify user owns wallet_id in params
  WalletController.fundWallet,
);

walletRouter.post(
  '/deposit',
  transferRateLimiter, // SECURITY: Rate limit deposits
  validateRequest(creditWalletSchema, RequestPath.BODY),
  verifyAuthToken,
  WalletController.depositToWallet,
);

export default walletRouter;
