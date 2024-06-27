import { Router } from 'express';
import { baseRoute } from './base';
import { notFoundResponse } from '../utils';
import authRouter from './auth';
const indexRouter: Router = Router();

indexRouter.get('/', baseRoute);
indexRouter.use('/api/v1/auth', authRouter);
indexRouter.all('*', notFoundResponse);

export { indexRouter };
