import { NotFoundException, UnprocessableEntityException } from '../../shared';
import { UserModel } from '../user';
import { WalletType, WalletModel } from './index';

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

  static async fundWallet(wallet_id: string, amount: string): Promise<WalletType> {
    const MINIMUM_AMOUNT = 1000;

    try {
      const wallet = await WalletModel.findBy<{ id: string }, WalletType>({
        id: wallet_id,
      });

      if (!wallet) {
        throw new NotFoundException('invalid wallet account');
      }

      const newBalance = Number(amount) + Number(wallet.balance);

      if (Number(amount) < MINIMUM_AMOUNT) {
        throw new UnprocessableEntityException(
          'mimimum amount of 1000 to be deposited',
        );
      }

      const result: WalletType = await WalletModel.updateWallet(wallet_id, {
        balance: newBalance,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}

export { WalletService };
