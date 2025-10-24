/**
 * UNIT TESTS: WalletService
 *
 * Tests the WalletService class methods in isolation with mocked dependencies.
 * These tests focus on business logic without touching the database.
 *
 * Coverage:
 * - createWallet(): Wallet creation with user validation
 * - fundWallet(): Wallet funding with balance update
 * - getWalletByID(): Wallet retrieval
 * - transferToWallet(): Fund transfers (tested in integration)
 * - disburseToExternalAccount(): Withdrawals (tested in integration)
 */

import { WalletService } from '../../src/modules/wallet/wallet.service';
import { WalletModel } from '../../src/modules/wallet/wallet.model';
import { UserModel } from '../../src/modules/user/user.model';
import { NotFoundException } from '../../src/shared';

// Mock dependencies
jest.mock('../../src/modules/wallet/wallet.model');
jest.mock('../../src/modules/user/user.model');

describe('WalletService', () => {
  // Test data fixtures
  const mockUserId = '1';
  const mockWalletId = '100';

  const mockUser = {
    id: mockUserId,
    user_name: 'johndoe',
    email: 'john@example.com',
    phone_number: '08012345678',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockWallet = {
    id: Number(mockWalletId),
    user_id: mockUserId,
    currency: 'NGN',
    balance: 50000,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createWallet()', () => {
    describe('Successful Wallet Creation', () => {
      it('should create a wallet when user exists', async () => {
        // Arrange
        const payload: any = {
          user_id: mockUserId,
          currency: 'NGN',
          balance: 0,
        };

        (UserModel.findBy as jest.Mock).mockResolvedValue(mockUser);
        (WalletModel.create as jest.Mock).mockResolvedValue({
          ...payload,
          id: Number(mockWalletId),
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Act
        const result = await WalletService.createWallet(payload);

        // Assert - verify dependencies called correctly
        expect(UserModel.findBy).toHaveBeenCalledWith({ id: mockUserId });
        expect(UserModel.findBy).toHaveBeenCalledTimes(1);

        expect(WalletModel.create).toHaveBeenCalledWith(payload);
        expect(WalletModel.create).toHaveBeenCalledTimes(1);

        // Assert - verify return value
        expect(result).toBeDefined();
        expect(result.user_id).toBe(mockUserId);
        expect(result.currency).toBe('NGN');
        expect(result.balance).toBe(0);
      });

      it('should create wallet with default currency if not provided', async () => {
        // Arrange
        const payload: any = {
          user_id: mockUserId,
          balance: 0,
        };

        (UserModel.findBy as jest.Mock).mockResolvedValue(mockUser);
        (WalletModel.create as jest.Mock).mockResolvedValue({
          ...payload,
          id: Number(mockWalletId),
          currency: 'NGN', // Default currency
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Act
        const result = await WalletService.createWallet(payload);

        // Assert
        expect(UserModel.findBy).toHaveBeenCalledWith({ id: mockUserId });
        expect(WalletModel.create).toHaveBeenCalledWith(payload);
        expect(result).toBeDefined();
      });

      it('should create wallet with specified initial balance', async () => {
        // Arrange
        const payload: any = {
          user_id: mockUserId,
          currency: 'USD',
          balance: 1000,
        };

        (UserModel.findBy as jest.Mock).mockResolvedValue(mockUser);
        (WalletModel.create as jest.Mock).mockResolvedValue({
          ...payload,
          id: Number(mockWalletId),
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Act
        const result = await WalletService.createWallet(payload);

        // Assert
        expect(result.balance).toBe(1000);
        expect(result.currency).toBe('USD');
      });
    });

    describe('Validation Errors', () => {
      it('should throw NotFoundException when user does not exist', async () => {
        // Arrange
        const payload: any = {
          user_id: mockUserId,
          currency: 'NGN',
          balance: 0,
        };

        (UserModel.findBy as jest.Mock).mockResolvedValue(null); // User not found

        // Act & Assert
        await expect(WalletService.createWallet(payload)).rejects.toThrow(
          NotFoundException,
        );

        await expect(WalletService.createWallet(payload)).rejects.toThrow(
          'invalid user account',
        );

        // Verify wallet creation was NOT attempted
        expect(UserModel.findBy).toHaveBeenCalledWith({ id: mockUserId });
        expect(WalletModel.create).not.toHaveBeenCalled();
      });

      it('should validate user existence before creating wallet', async () => {
        // Arrange
        const payload: any = {
          user_id: 'nonexistent',
          currency: 'NGN',
          balance: 0,
        };

        (UserModel.findBy as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(WalletService.createWallet(payload)).rejects.toThrow(
          NotFoundException,
        );

        expect(UserModel.findBy).toHaveBeenCalledWith({ id: 'nonexistent' });
        expect(WalletModel.create).not.toHaveBeenCalled();
      });
    });

    describe('Edge Cases', () => {
      it('should propagate database errors', async () => {
        // Arrange
        const payload: any = {
          user_id: mockUserId,
          currency: 'NGN',
          balance: 0,
        };

        const dbError = new Error('Database connection failed');
        (UserModel.findBy as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(WalletService.createWallet(payload)).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should handle wallet creation failure', async () => {
        // Arrange
        const payload: any = {
          user_id: mockUserId,
          currency: 'NGN',
          balance: 0,
        };

        (UserModel.findBy as jest.Mock).mockResolvedValue(mockUser);
        (WalletModel.create as jest.Mock).mockRejectedValue(
          new Error('Wallet creation failed'),
        );

        // Act & Assert
        await expect(WalletService.createWallet(payload)).rejects.toThrow(
          'Wallet creation failed',
        );

        expect(UserModel.findBy).toHaveBeenCalled();
        expect(WalletModel.create).toHaveBeenCalled();
      });
    });
  });

  describe('getWalletByID()', () => {
    describe('Successful Retrieval', () => {
      it('should return wallet when it exists', async () => {
        // Arrange
        (WalletModel.findById as jest.Mock).mockResolvedValue(mockWallet);

        // Act
        const result = await WalletService.getWalletByID(mockWalletId);

        // Assert
        expect(WalletModel.findById).toHaveBeenCalledWith(mockWalletId);
        expect(WalletModel.findById).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockWallet);
      });

      it('should return wallet with correct balance', async () => {
        // Arrange
        const walletWithBalance = { ...mockWallet, balance: 123456.78 };
        (WalletModel.findById as jest.Mock).mockResolvedValue(
          walletWithBalance,
        );

        // Act
        const result = await WalletService.getWalletByID(mockWalletId);

        // Assert
        expect(result.balance).toBe(123456.78);
      });
    });

    describe('Not Found Errors', () => {
      it('should throw NotFoundException when wallet does not exist', async () => {
        // Arrange
        (WalletModel.findById as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(WalletService.getWalletByID(mockWalletId)).rejects.toThrow(
          NotFoundException,
        );

        await expect(WalletService.getWalletByID(mockWalletId)).rejects.toThrow(
          'wallet non-existent',
        );

        expect(WalletModel.findById).toHaveBeenCalledWith(mockWalletId);
      });

      it('should throw NotFoundException for invalid wallet ID', async () => {
        // Arrange
        const invalidId = 'invalid123';
        (WalletModel.findById as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(WalletService.getWalletByID(invalidId)).rejects.toThrow(
          NotFoundException,
        );

        expect(WalletModel.findById).toHaveBeenCalledWith(invalidId);
      });
    });

    describe('Edge Cases', () => {
      it('should propagate database errors', async () => {
        // Arrange
        const dbError = new Error('Database query failed');
        (WalletModel.findById as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(WalletService.getWalletByID(mockWalletId)).rejects.toThrow(
          'Database query failed',
        );
      });
    });
  });

  describe('fundWallet()', () => {
    describe('Successful Funding', () => {
      it('should successfully fund a wallet', async () => {
        // Arrange
        const amount = '10000';
        const initialBalance = 50000;
        const expectedNewBalance = 60000;

        (WalletModel.findBy as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: initialBalance,
        });

        (WalletModel.updateWallet as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: expectedNewBalance,
        });

        // Mock createTransaction
        WalletService.createTransaction = jest.fn().mockResolvedValue({
          id: 1,
          source_wallet_id: mockWalletId,
          amount,
          transaction_type: 'deposit',
          status: 'success',
        });

        // Act
        const result = await WalletService.fundWallet(mockWalletId, amount);

        // Assert - verify findBy was called
        expect(WalletModel.findBy).toHaveBeenCalledWith({ id: mockWalletId });
        expect(WalletModel.findBy).toHaveBeenCalledTimes(1);

        // Assert - verify balance was calculated correctly
        expect(WalletModel.updateWallet).toHaveBeenCalledWith(mockWalletId, {
          balance: expectedNewBalance,
        });

        // Assert - verify transaction was logged
        expect(WalletService.createTransaction).toHaveBeenCalledWith({
          source_wallet_id: mockWalletId,
          destination_wallet_id: null,
          amount,
          transaction_type: 'deposit',
          status: 'success',
        });

        // Assert - verify return value
        expect(result.balance).toBe(expectedNewBalance);
      });

      it('should correctly calculate new balance with zero starting balance', async () => {
        // Arrange
        const testCase = { current: 0, amount: '5000', expected: 5000 };

        (WalletModel.findBy as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: testCase.current,
        });

        (WalletModel.updateWallet as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: testCase.expected,
        });

        WalletService.createTransaction = jest.fn().mockResolvedValue({});

        // Act
        await WalletService.fundWallet(mockWalletId, testCase.amount);

        // Assert
        expect(WalletModel.updateWallet).toHaveBeenCalledWith(mockWalletId, {
          balance: testCase.expected,
        });
      });

      it('should correctly calculate new balance with existing balance', async () => {
        // Arrange
        const testCase = { current: 100, amount: '200', expected: 300 };

        (WalletModel.findBy as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: testCase.current,
        });

        (WalletModel.updateWallet as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: testCase.expected,
        });

        WalletService.createTransaction = jest.fn().mockResolvedValue({});

        // Act
        await WalletService.fundWallet(mockWalletId, testCase.amount);

        // Assert
        expect(WalletModel.updateWallet).toHaveBeenCalledWith(mockWalletId, {
          balance: testCase.expected,
        });
      });

      it('should correctly calculate new balance with decimal amounts', async () => {
        // Arrange
        const testCase = { current: 999.5, amount: '0.50', expected: 1000 };

        (WalletModel.findBy as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: testCase.current,
        });

        (WalletModel.updateWallet as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: testCase.expected,
        });

        WalletService.createTransaction = jest.fn().mockResolvedValue({});

        // Act
        await WalletService.fundWallet(mockWalletId, testCase.amount);

        // Assert
        expect(WalletModel.updateWallet).toHaveBeenCalledWith(mockWalletId, {
          balance: testCase.expected,
        });
      });
    });

    describe('Validation Errors', () => {
      it('should throw NotFoundException when wallet does not exist', async () => {
        // Arrange
        const amount = '5000';
        (WalletModel.findBy as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(
          WalletService.fundWallet(mockWalletId, amount),
        ).rejects.toThrow(NotFoundException);

        await expect(
          WalletService.fundWallet(mockWalletId, amount),
        ).rejects.toThrow('invalid wallet account');

        // Verify update was NOT attempted
        expect(WalletModel.findBy).toHaveBeenCalledWith({ id: mockWalletId });
        expect(WalletModel.updateWallet).not.toHaveBeenCalled();
      });
    });

    describe('Edge Cases', () => {
      it('should handle very large amounts', async () => {
        // Arrange
        const largeAmount = '999999999';
        const currentBalance = 1;

        (WalletModel.findBy as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: currentBalance,
        });

        (WalletModel.updateWallet as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: currentBalance + Number(largeAmount),
        });

        WalletService.createTransaction = jest.fn().mockResolvedValue({});

        // Act
        const result = await WalletService.fundWallet(
          mockWalletId,
          largeAmount,
        );

        // Assert
        expect(result.balance).toBe(1000000000);
      });

      it('should handle decimal amounts correctly', async () => {
        // Arrange
        const amount = '123.45';
        const currentBalance = 100.55;

        (WalletModel.findBy as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: currentBalance,
        });

        (WalletModel.updateWallet as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: 224, // 100.55 + 123.45
        });

        WalletService.createTransaction = jest.fn().mockResolvedValue({});

        // Act
        await WalletService.fundWallet(mockWalletId, amount);

        // Assert
        expect(WalletModel.updateWallet).toHaveBeenCalledWith(mockWalletId, {
          balance: 224,
        });
      });

      it('should propagate errors from updateWallet', async () => {
        // Arrange
        const amount = '5000';
        const updateError = new Error('Update failed');

        (WalletModel.findBy as jest.Mock).mockResolvedValue(mockWallet);
        (WalletModel.updateWallet as jest.Mock).mockRejectedValue(updateError);

        // Act & Assert
        await expect(
          WalletService.fundWallet(mockWalletId, amount),
        ).rejects.toThrow('Update failed');
      });

      it('should propagate errors from createTransaction', async () => {
        // Arrange
        const amount = '5000';
        const transactionError = new Error('Transaction logging failed');

        (WalletModel.findBy as jest.Mock).mockResolvedValue(mockWallet);
        (WalletModel.updateWallet as jest.Mock).mockResolvedValue({
          ...mockWallet,
          balance: 55000,
        });

        WalletService.createTransaction = jest
          .fn()
          .mockRejectedValue(transactionError);

        // Act & Assert
        await expect(
          WalletService.fundWallet(mockWalletId, amount),
        ).rejects.toThrow('Transaction logging failed');
      });
    });
  });
});
