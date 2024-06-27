import { DateType } from '../../shared';
import { UserModel, UserType } from '../user';
class UserService {
  static async findUser(email: string) {
    try {
      return await UserModel.findByEmail(email);
    } catch (error) {
      throw error;
    }
  }

  static async create(user: {
    email: string;
    password: string;
    user_name: string;
    phone_number: string;
  }): Promise<UserType & DateType> {
    try {
      const newUser = (await UserModel.create(user)) as UserType & DateType;
      return newUser;
    } catch (error) {
      throw error;
    }
  }
}
export { UserService };
