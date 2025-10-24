import { Router } from 'express';
import { AuthController } from '../../modules';
import { signUpSchema, validateRequest } from '../utils';
import { RequestPath } from '../types';
import { authRateLimiter } from '../config/rate-limit';

const authRouter: Router = Router();

authRouter.post(
  '/signup',
  authRateLimiter, // SECURITY: Prevent brute force signup attempts
  validateRequest(signUpSchema, RequestPath.BODY),
  AuthController.signUp,
);

export default authRouter;
