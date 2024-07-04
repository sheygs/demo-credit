import { Router } from 'express';
import { TransferController } from '../../modules';
import { RequestPath } from '../types';
import { verifyAuthToken } from '../middlewares';
import { validateRequest, transferSchema } from '../utils';

const transferRouter: Router = Router();

transferRouter.post(
  '/',
  validateRequest(transferSchema, RequestPath.BODY),
  verifyAuthToken,
  TransferController.createTransfer,
);

export default transferRouter;
