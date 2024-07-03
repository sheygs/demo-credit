import { Router } from 'express';
import { WalletController } from '../../modules';
import {
  createWalletSchema,
  validateRequest,
  walletIDSchema,
  fundWalletSchema,
} from '../utils';
import { RequestPath } from '../types';

const walletRouter: Router = Router();

walletRouter.post(
  '/',
  validateRequest(createWalletSchema, RequestPath.BODY),
  WalletController.createWallet,
);

walletRouter.post(
  '/:wallet_id/deposit',
  validateRequest(walletIDSchema, RequestPath.PARAMS),
  validateRequest(fundWalletSchema, RequestPath.BODY),
  WalletController.fundWallet,
);

export default walletRouter;
