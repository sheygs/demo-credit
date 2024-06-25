import { Response as Res, Request as Req } from 'express';
import { OK } from 'http-status';
import { config } from '../config';
import { successResponse } from '../util';
import { AppResponse } from '../types';

const baseRoute = (_: Req, res: Res): void => {
  const transform = Object.entries(config.app).slice(0, 7);

  const data = Object.fromEntries(transform) as AppResponse;

  successResponse<AppResponse>(res, OK, 'okay', data);
};

export { baseRoute };
