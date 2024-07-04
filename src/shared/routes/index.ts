import { Router } from 'express';
import { baseRoute } from './base';
import { notFoundResponse } from '../utils';

import authRouter from './auth';
import walletRouter from './wallet';
import transferRouter from './transfer';
import withdrawalRouter from './withdrawal';

const indexRouter: Router = Router();

indexRouter.get('/', baseRoute);
indexRouter.use('/api/v1/auth', authRouter);
indexRouter.use('/api/v1/wallets', walletRouter);
indexRouter.use('/api/v1/transfers', transferRouter);
indexRouter.use('/api/v1/withdrawals', withdrawalRouter);
indexRouter.all('*', notFoundResponse);

export { indexRouter };
