import { Request as Req, Response as Res, NextFunction as Next } from 'express';
import { AuthService, UserModel, UserType } from '../../modules';
import {
  BadRequestException,
  bearerTokenSchema,
  UnauthorizedException,
} from '../utils';

const verifyAuthToken = async (req: Req, _: Res, next: Next): Promise<void> => {
  const { authorization = '' } = req.headers;

  const { error } = bearerTokenSchema.validate({ authorization });

  if (error) {
    return next(new BadRequestException(error.message));
  }

  try {
    const [, token] = authorization!.split(' ');

    let decoded: any;

    try {
      decoded = AuthService.verifyToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid authorization token');
    }

    const user: UserType = await UserModel.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedException('Invalid authorization token');
    }

    req.user_id = String(user.id);
    req.user_email = user.email;

    next();
  } catch (error) {
    next(error);
  }
};

export { verifyAuthToken };
