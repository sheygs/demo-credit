import { Model, DateType, ResponseType } from '../../shared/database';

type UserType = {
  id: number;
  user_name: string;
  email: string;
  password: string;
  phone_number: string;
} & DateType;

class UserModel extends Model {
  static tableName = 'users';

  public static async create<Payload, UserType>(
    data: Payload,
  ): ResponseType<UserType> {
    return super.create<Payload, UserType>({
      ...data,
    });
  }

  public static findByEmail(email: string): ResponseType<UserType | null> {
    return this.findBy<
      {
        email: string;
      },
      UserType
    >({ email });
  }

  public static getUsers(): Promise<UserType[]> {
    return this.all<UserType>();
  }
}

export { UserModel, UserType };
