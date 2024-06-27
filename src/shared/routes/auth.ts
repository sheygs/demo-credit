import { Router } from 'express';
import { AuthController } from '../../modules';
import { signUpSchema, validateRequest } from '../utils';
import { RequestPath } from '../types';

const authRouter: Router = Router();

authRouter.post(
  '/signup',
  validateRequest(signUpSchema, RequestPath.BODY),
  AuthController.signUp,
);

export default authRouter;
