import { Router } from 'express';
import { baseRoute } from './base';
import { notFoundResponse } from '../utils';

const indexRouter: Router = Router();

indexRouter.get('/', baseRoute);
indexRouter.all('*', notFoundResponse);

export { indexRouter };
