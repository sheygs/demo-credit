import { Router } from 'express';
import { baseRoute } from './base';
import { notFoundResponse } from '../utils';
import authRouter from './auth';
import walletRouter from './wallet';
const indexRouter: Router = Router();

indexRouter.get('/', baseRoute);
indexRouter.use('/api/v1/auth', authRouter);
indexRouter.use('/api/v1/wallets', walletRouter);
indexRouter.all('*', notFoundResponse);

export { indexRouter };
