import { Router } from 'express';
import { baseRoute } from './base';
import { notFoundResponse } from '../util';

const indexRouter: Router = Router();

indexRouter.get('/', baseRoute);
indexRouter.all('*', notFoundResponse);

export { indexRouter };
