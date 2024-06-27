import { Request as Req, Response as Res, NextFunction as NextFn } from 'express';
import { CREATED } from 'http-status';
import { UserType } from '../user';
import { successResponse, DateType } from '../../shared';
import { AuthService } from './auth.service';

class AuthController {
  static async signUp(req: Req, res: Res, next: NextFn) {
    console.log({ body: req.body });

    try {
      const user = await AuthService.signUp(req);

      successResponse<{
        user: UserType & DateType;
        token: string;
      }>(res, CREATED, 'account created', user);
    } catch (error) {
      next(error);
    }
  }
}

export { AuthController };
