import { Model, ResponseType, DateType } from '../../shared/database';

type WalletType = {
  id: number;
  user_id: string;
  currency?: string;
  balance: number;
} & DateType;

class WalletModel extends Model {
  static tableName = 'wallets';

  public static async create<Payload, WalletType>(
    data: Payload,
  ): ResponseType<WalletType> {
    return super.create<Payload, WalletType>(data);
  }

  public static async findByUserId(
    user_id: string,
  ): ResponseType<WalletType | null> {
    return this.findBy<
      {
        user_id: string;
      },
      WalletType
    >({ user_id });
  }

  public static async updateWallet<Payload, WalletType>(
    id: string,
    data: Payload,
  ): ResponseType<WalletType> {
    return this.update(id, data);
  }
}

export { WalletModel, WalletType };
