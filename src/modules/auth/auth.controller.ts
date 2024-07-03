import { Request as Req, Response as Res, NextFunction as NextFn } from 'express';
import { CREATED } from 'http-status';
import { UserType } from '../user';
import { successResponse } from '../../shared';
import { AuthService } from './auth.service';

type IUserResponse = {
  user: UserType;
  token: string;
};

class AuthController {
  static async signUp(req: Req, res: Res, next: NextFn) {
    try {
      const user = await AuthService.signUp(req);

      successResponse<IUserResponse>(res, CREATED, 'account created', user);
    } catch (error) {
      next(error);
    }
  }
}

export { AuthController };
