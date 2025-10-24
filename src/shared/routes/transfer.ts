import { Router } from 'express';
import { TransferController } from '../../modules';
import { RequestPath } from '../types';
import { verifyAuthToken, verifyWalletOwnership } from '../middlewares';
import { validateRequest, transferSchema } from '../utils';
import { transferRateLimiter } from '../config/rate-limit';

const transferRouter: Router = Router();

transferRouter.post(
  '/',
  transferRateLimiter, // SECURITY: Prevent excessive transfer attempts
  validateRequest(transferSchema, RequestPath.BODY),
  verifyAuthToken,
  verifyWalletOwnership, // SECURITY: Verify user owns source_wallet_id
  TransferController.createTransfer,
);

export default transferRouter;
