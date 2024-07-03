import { Router } from 'express';
import { TransferController } from '../../modules';

import { validateRequest, transferSchema } from '../utils';
import { RequestPath } from '../types';
import { verifyAuthToken } from '../middlewares';

const transferRouter: Router = Router();

transferRouter.post(
  '/',
  validateRequest(transferSchema, RequestPath.BODY),
  verifyAuthToken,
  TransferController.createTransfer,
);

export default transferRouter;
