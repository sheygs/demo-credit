import { Request as Req, Response as Res, NextFunction as Next } from 'express';
// import { authService } from '../services';
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
    // const [, token] = authorization!.split(' ');

    // let decoded: any;

    try {
      // decoded = authService.verifyToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid authorization token');
    }

    // const userRepo: Repository<User> = dataSource.getRepository(User);

    //  const user = await new UniversalRepository<User>(userRepo).findOne({
    //    where: { id: decoded.id },
    //  });

    //  if (!user) {
    //    throw new UnauthorizedException('Invalid authorization token');
    //  }

    // req.user_id = user.id;
    // req.user_email = user.email;

    next();
  } catch (error) {
    next(error);
  }
};

export { verifyAuthToken };
