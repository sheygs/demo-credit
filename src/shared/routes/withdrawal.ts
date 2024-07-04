import { Router } from 'express';
import { TransferController } from '../../modules';
import { RequestPath } from '../types';
import { verifyAuthToken } from '../middlewares';
import { validateRequest, withdrawalSchema } from '../utils';

const withdrawalRouter: Router = Router();

withdrawalRouter.post(
  '/',
  validateRequest(withdrawalSchema, RequestPath.BODY),
  verifyAuthToken,
  TransferController.createWithdrawal,
);

export default withdrawalRouter;
