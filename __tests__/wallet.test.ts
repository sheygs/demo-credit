import { WalletService, WalletModel, UserModel } from '../src/modules';

import { NotFoundException } from '../src/shared';

jest.mock('../src/modules/wallet/wallet.model');
jest.mock('../src/modules/user/user.model.ts');

describe('WalletService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWallet', () => {
    it('should create a wallet for a valid user', async () => {
      const user_id = '1';
      const payload = {
        user_id,
        currency: 'USD',
        balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (UserModel.findBy as jest.Mock).mockResolvedValueOnce({ id: user_id });
      (WalletModel.create as jest.Mock).mockResolvedValueOnce(payload);

      const wallet = await WalletService.createWallet(payload);

      expect(wallet).toEqual(payload);
      expect(UserModel.findBy).toHaveBeenCalledWith({ id: user_id });
      expect(WalletModel.create).toHaveBeenCalledWith(payload);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const user_id = '1';
      const payload = {
        user_id,
        currency: 'USD',
        balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (UserModel.findBy as jest.Mock).mockResolvedValueOnce(null);

      await expect(WalletService.createWallet(payload)).rejects.toThrow(
        NotFoundException,
      );
      expect(UserModel.findBy).toHaveBeenCalledWith({ id: user_id });
      expect(WalletModel.create).not.toHaveBeenCalled();
    });
  });

  describe('fundWallet', () => {
    it('should fund a wallet with a valid ID', async () => {
      const wallet_id = '1';
      const amount = '100';
      const wallet = {
        id: wallet_id,
        user_id: '1',
        currency: 'USD',
        balance: 50,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updatedWallet = { ...wallet, balance: 150 };

      (WalletModel.findBy as jest.Mock).mockResolvedValueOnce(wallet);
      (WalletModel.updateWallet as jest.Mock).mockResolvedValueOnce(
        updatedWallet,
      );
      WalletService.createTransaction = jest.fn().mockResolvedValueOnce({});

      const result = await WalletService.fundWallet(wallet_id, amount);

      expect(result).toEqual(updatedWallet);
      expect(WalletModel.findBy).toHaveBeenCalledWith({ id: wallet_id });
      expect(WalletModel.updateWallet).toHaveBeenCalledWith(wallet_id, {
        balance: 150,
      });
      expect(WalletService.createTransaction).toHaveBeenCalledWith({
        source_wallet_id: wallet_id,
        destination_wallet_id: null,
        amount,
        transaction_type: 'DEPOSIT',
        status: 'SUCCESS',
      });
    });

    it('should throw NotFoundException if wallet does not exist', async () => {
      const wallet_id = '1';
      const amount = '100';

      (WalletModel.findBy as jest.Mock).mockResolvedValueOnce(null);

      await expect(WalletService.fundWallet(wallet_id, amount)).rejects.toThrow(
        NotFoundException,
      );
      expect(WalletModel.findBy).toHaveBeenCalledWith({ id: wallet_id });
      expect(WalletModel.updateWallet).not.toHaveBeenCalled();
    });
  });
});
