import { Model, DateType } from '../../shared/database';

type UserType = {
  id: number;
  user_name: string;
  email: string;
  password: string;
  phone_number: string;
};

class UserModel extends Model {
  static tableName = 'users';

  public static async create<Payload, UserType>(
    data: Payload,
  ): Promise<UserType & DateType> {
    return super.create<Payload, UserType>({
      ...data,
    });
  }

  public static findByEmail(email: string): Promise<UserType> {
    return this.findBy<
      {
        email: string;
      },
      UserType
    >({ email });
  }

  public static getUsers(): Promise<UserType[]> {
    return this.all();
  }
}

export { UserModel, UserType };

// const users = await db.select('*').from('users');
// return await db('users');
