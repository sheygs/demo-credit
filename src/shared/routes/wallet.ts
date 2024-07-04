import { Router } from 'express';
import { WalletController } from '../../modules';
import { RequestPath } from '../types';
import { verifyAuthToken } from '../middlewares';
import {
  createWalletSchema,
  validateRequest,
  walletIDSchema,
  fundWalletSchema,
  initializePaymentSchema,
  creditWalletSchema,
} from '../utils';

const walletRouter: Router = Router();

walletRouter.post(
  '/',
  validateRequest(createWalletSchema, RequestPath.BODY),
  verifyAuthToken,
  WalletController.createWallet,
);

walletRouter.post(
  '/initialize-payment',
  validateRequest(initializePaymentSchema, RequestPath.BODY),
  verifyAuthToken,
  WalletController.initializePayment,
);

walletRouter.post(
  '/:wallet_id/deposit',
  validateRequest(walletIDSchema, RequestPath.PARAMS),
  validateRequest(fundWalletSchema, RequestPath.BODY),
  verifyAuthToken,
  WalletController.fundWallet,
);

walletRouter.post(
  '/deposit',
  validateRequest(creditWalletSchema, RequestPath.BODY),
  verifyAuthToken,
  WalletController.depositToWallet,
);

export default walletRouter;
