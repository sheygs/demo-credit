import { Knex } from 'knex';
import { PaystackService } from '../paystack';
import { TransactionModel, TransactionType as Transaction } from '../transactions';
import { UserModel, UserType } from '../user';
import { WalletType, WalletModel } from './index';
import {
  db,
  FundWalletRequest,
  NotFoundException,
  Status,
  TransactionRequest,
  TransactionType,
  TransferRequest,
  UnprocessableEntityException,
} from '../../shared';

class WalletService {
  static async createWallet(payload: Omit<WalletType, 'id'>): Promise<WalletType> {
    const { user_id } = payload;

    try {
      const user = await UserModel.findBy<{ id: string }, WalletType>({
        id: user_id,
      });

      if (!user) {
        throw new NotFoundException('invalid user account');
      }

      const wallet: WalletType = await WalletModel.create(payload);

      return wallet;
    } catch (error) {
      throw error;
    }
  }

  static async initializePayment(
    wallet_id: string,
    amount: string,
  ): Promise<{
    authorization_url: string | undefined;
  }> {
    try {
      const existingWallet = await WalletService.getWalletByID(wallet_id);

      const user = await UserModel.findById<UserType>(existingWallet.user_id);

      const response = await PaystackService.initializePayment({
        amount,
        email: user.email,
        currency: existingWallet.currency,
        wallet_id: String(existingWallet.id),
        user_id: existingWallet.user_id,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  static async verifyTransactionPayment(reference: string) {
    try {
      const response = await PaystackService.verifyPaymentTransaction(reference);

      return response;
    } catch (error) {
      throw error;
    }
  }

  static async fundWallet(wallet_id: string, amount: string): Promise<WalletType> {
    try {
      const wallet = await WalletModel.findBy<{ id: string }, WalletType>({
        id: wallet_id,
      });

      if (!wallet) {
        throw new NotFoundException('invalid wallet account');
      }

      const newBalance = Number(amount) + Number(wallet.balance);

      const result: WalletType = await WalletModel.updateWallet(wallet_id, {
        balance: newBalance,
      });

      await this.createTransaction({
        source_wallet_id: wallet_id,
        destination_wallet_id: undefined,
        amount,
        transaction_type: TransactionType.DEPOSIT,
        status: Status.SUCCESS,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getWalletByID(id: string): Promise<WalletType> {
    try {
      const wallet: WalletType = await WalletModel.findById(id);

      if (!wallet) {
        throw new NotFoundException('wallet non-existent');
      }

      return wallet;
    } catch (error) {
      throw error;
    }
  }

  static async creditWallet(payload: FundWalletRequest) {
    try {
      const response = await PaystackService.verifyPaymentTransaction(
        payload.reference,
      );

      if (response.data?.status !== 'success') {
        // log error transaction

        throw new UnprocessableEntityException(
          response.data?.gateway_response || 'payment verification failed',
        );
      }

      console.log({
        //   message: response.message,
        //   status: response.status,
        //   reference: response.data.reference,
        //   amount: response.data.amount,
        //   metadata: response.data.metadata,
        //   typeof: typeof response.data.metadata,
        //   amount: response.data.metadata.amount,
        //   user_id,
        //   currency,
        //   transactionStatus: response.data.status,
        //   gateway_response: response.data.gateway_response,
      });

      await WalletModel.updateWallet('id', {});

      return response;
    } catch (error) {
      throw error;
    }
  }

  static async transferToWallet(transferReq: TransferRequest): Promise<Transaction> {
    const { source_wallet_id, destination_wallet_id, amount } = transferReq;

    const trx: Knex.Transaction<any, any[]> = await db.transaction();

    try {
      const [sourceWallet, destinationWallet] = await Promise.all([
        WalletService.getWalletByID(source_wallet_id),
        WalletService.getWalletByID(destination_wallet_id),
      ]);

      const sourceBalance = Number(sourceWallet.balance);

      const destinationBalance = Number(destinationWallet.balance);

      if (sourceBalance < Number(amount)) {
        throw new UnprocessableEntityException('Insufficient funds');
      }

      await Promise.all([
        trx('wallets')
          .where({ id: source_wallet_id })
          .update({ balance: sourceBalance - Number(amount) }),

        trx('wallets')
          .where({ id: destination_wallet_id })
          .update({ balance: destinationBalance + Number(amount) }),
      ]);

      // create transaction log
      const [transaction_id] = await trx('transactions').insert({
        source_wallet_id: sourceWallet.id.toString(),
        destination_wallet_id: destinationWallet.id.toString(),
        amount,
        transaction_type: TransactionType.TRANSFER,
        status: Status.SUCCESS,
      });

      const transaction: Transaction = await trx('transactions')
        .where({
          id: transaction_id,
        })
        .first();

      await trx.commit();

      return transaction;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  static async createTransaction(transactionReq: TransactionRequest) {
    try {
      const transaction = await TransactionModel.create(transactionReq);

      return transaction;
    } catch (error) {
      throw error;
    }
  }
}

export { WalletService };
