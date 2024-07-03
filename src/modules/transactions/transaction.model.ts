import { Model, ResponseType, DateType } from '../../shared/database';

type TransactionType = {
  id: number;
  user_id: string;
  amount: string;
  transaction_type: string;
  status: string;
  source_wallet_id: string;
  destination_wallet_id: string;
} & DateType;

class TransactionModel extends Model {
  static tableName = 'transactions';

  public static async create<Payload, TransactionType>(
    data: Payload,
  ): ResponseType<TransactionType> {
    return super.create<Payload, TransactionType>(data);
  }
}

export { TransactionModel, TransactionType };
