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
} from '../../shared';

class AuthService {
  static async signUp(req: Req) {
    const { email, password } = req.body;

    try {
      const user = await UserService.findUser(email);

      if (user) {
        throw new BadRequestException('account exist');
      }

      const {
        status,
        data = {},
        message,
      } = await BlackListService.verifyCustomer(email);

      if (status === 'error') {
        throw new UnauthorizedException(message);
      }

      if (status === 'success' && Object.keys(data).length) {
        throw new ForbiddenException('this account has been blacklisted');
      }

      const hashed = await SecurityUtils.hash(password);

      if (!hashed) {
        throw new BadRequestException('failed to hash password');
      }

      const createdUser = await UserService.create({
        ...req.body,
        password: hashed,
      });

      const token = this.generateToken(createdUser);

      if (!createdUser) {
        throw new UnprocessableEntityException('unable to create user');
      }

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
}
export { AuthService };
