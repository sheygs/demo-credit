import { Router } from 'express';
import { TransferController } from '../../modules';
import { RequestPath } from '../types';
import { verifyAuthToken, verifyWalletOwnership } from '../middlewares';
import { validateRequest, withdrawalSchema } from '../utils';
import { transferRateLimiter } from '../config/rate-limit';

const withdrawalRouter: Router = Router();

withdrawalRouter.post(
  '/',
  transferRateLimiter, // SECURITY: Prevent excessive withdrawal attempts
  validateRequest(withdrawalSchema, RequestPath.BODY),
  verifyAuthToken,
  verifyWalletOwnership, // SECURITY: Verify user owns wallet_id
  TransferController.createWithdrawal,
);

export default withdrawalRouter;
