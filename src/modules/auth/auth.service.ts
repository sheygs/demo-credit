import { Request as Req } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserType, UserService } from '../user';
import { BlackListService } from '../blacklist';
import {
  config,
  BadRequestException,
  UnprocessableEntityException,
  SecurityUtils,
  ForbiddenException,
  UnauthorizedException,
  Status,
} from '../../shared';

class AuthService {
  static async signUp(req: Req) {
    const { email, password, phone_number } = req.body;

    try {
      const user = await UserService.findUser(email);

      if (user) {
        throw new UnprocessableEntityException('account already exists');
      }

      const {
        status,
        data = {},
        message,
      } = await BlackListService.verifyCustomerBlackListStatus({
        email,
        phone_number,
      });

      if (status === Status.ERROR) {
        throw new UnauthorizedException(message);
      }

      if (status === Status.SUCCESS && Object.keys(data)?.length) {
        throw new ForbiddenException('account has been blacklisted');
      }

      const hashed = await SecurityUtils.hash(password);

      if (!hashed) {
        throw new BadRequestException('failed to hash password');
      }

      const createdUser = await UserService.create({
        ...req.body,
        password: hashed,
      });

      if (!createdUser) {
        throw new UnprocessableEntityException('unable to create user');
      }

      const token = this.generateToken(createdUser);

      Reflect.deleteProperty(createdUser, 'password');

      return { user: createdUser, token };
    } catch (error) {
      throw error;
    }
  }

  private static generateToken(user: UserType): string {
    const { jwtSecret, jwtExpiresIn } = config.app;

    return jwt.sign(
      {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
      },
      jwtSecret,
      {
        expiresIn: jwtExpiresIn,
      },
    );
  }

  public static verifyToken(token: string) {
    const { jwtSecret } = config.app;

    return jwt.verify(token, jwtSecret);
  }
}
export { AuthService };
