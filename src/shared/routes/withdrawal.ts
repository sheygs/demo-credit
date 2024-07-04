import { Router } from 'express';
import { TransferController } from '../../modules';
import { validateRequest, withdrawalSchema } from '../utils';
import { RequestPath } from '../types';
import { verifyAuthToken } from '../middlewares';

const withdrawalRouter: Router = Router();

withdrawalRouter.post(
  '/',
  validateRequest(withdrawalSchema, RequestPath.BODY),
  verifyAuthToken,
  TransferController.createTransfer,
);

export default withdrawalRouter;
