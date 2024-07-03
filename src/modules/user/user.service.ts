import { UserModel, UserType } from '../user';
class UserService {
  static async findUser(email: string) {
    try {
      const user = await UserModel.findByEmail(email);
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async create(user: Omit<UserType, 'id'>): Promise<UserType> {
    try {
      const newUser: UserType = await UserModel.create(user);
      return newUser;
    } catch (error) {
      throw error;
    }
  }
}
export { UserService };
