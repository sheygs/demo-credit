import { Request as Req } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserType, UserService } from '../user';
import {
  BadRequestException,
  config,
  UnprocessableEntityException,
  UtilService,
} from '../../shared';

class AuthService {
  static async signUp(req: Req) {
    const { email, password } = req.body;

    // email = 'sheygs@gmail.com';

    console.log('in auth service');
    console.log({ body: req.body });

    try {
      const user = await UserService.findUser(email);

      console.log({ user });

      if (user) {
        throw new BadRequestException('account exists');
      }

      const hashed = await UtilService.hash(password);

      if (!hashed) {
        throw new BadRequestException('failed to hash');
      }

      const createdUser = await UserService.create({
        ...req.body,
        password: hashed,
      });

      const token = this.generateToken(createdUser);

      if (!createdUser) {
        throw new UnprocessableEntityException('Unable to create user');
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
