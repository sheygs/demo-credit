/**
 * SECURITY TESTS: Race Condition Vulnerability Testing
 *
 * These tests demonstrate and verify protection against race conditions
 * in financial transactions, particularly the check-then-act vulnerability
 * that can lead to account overdrafts.
 *
 * CRITICAL: These tests require database transactions and SELECT...FOR UPDATE
 * to be properly implemented. Without pessimistic locking, concurrent transfers
 * can overdraft accounts.
 */

import request from 'supertest';
import { db } from '../../src/shared';
import { TestHelper } from '../helpers/test-helper';

// Mock external blacklist service
jest.mock('../../src/modules/blacklist/blacklist.service', () => {
  return {
    BlackListService: {
      verifyCustomerBlackListStatus: jest.fn().mockResolvedValue({
        status: 'success',
        data: {},
      }),
    },
  };
});

describe('Race Condition Security Tests', () => {
  let app: any;
  let authToken: string;
  let userId: string;
  let sourceWalletId: string;
  let destinationWalletId: string;

  beforeAll(async () => {
    app = await TestHelper.init();
  });

  beforeEach(async () => {
    // Create test user using helper
    const testUser = await TestHelper.createTestUser();
    authToken = testUser.token;
    userId = testUser.userId;

    // Create source wallet with initial balance
    const sourceWallet = await TestHelper.createTestWallet(authToken, userId, {
      balance: 100000, // NGN 100,000
    });
    sourceWalletId = sourceWallet.walletId;

    // Create destination wallet
    const destWallet = await TestHelper.createTestWallet(authToken, userId, {
      balance: 0,
    });
    destinationWalletId = destWallet.walletId;
  });

  afterEach(async () => {
    // Cleanup test data
    if (userId) {
      await TestHelper.cleanupUser(userId);
    }
  });

  afterAll(async () => {
    await TestHelper.cleanup();
  });

  /**
   * TEST 1: Race Condition - Concurrent Transfers
   *
   * This test simulates the attack where multiple concurrent transfer requests
   * are sent simultaneously to exploit the race condition window.
   *
   * EXPECTED BEHAVIOR (With Fix):
   * - Only ONE transfer should succeed
   * - Final balance should be exactly 0 (not negative)
   * - Database should maintain ACID properties
   *
   * VULNERABLE BEHAVIOR (Without Fix):
   * - Multiple transfers succeed
   * - Account goes negative (overdraft)
   * - Users can steal money they don't have
   */
  describe('Concurrent Transfer Attack', () => {
    it('should prevent overdraft when multiple concurrent transfers are attempted', async () => {
      const transferAmount = 100000; // Entire balance
      const concurrentRequests = 10;

      // Launch multiple concurrent transfer requests
      const transferPromises = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/v1/transfers')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              source_wallet_id: sourceWalletId,
              destination_wallet_id: destinationWalletId,
              amount: transferAmount,
            })
            .then((res) => ({ status: res.status, body: res.body }))
            .catch((err) => ({ status: err.status, error: err.message })),
        );

      // Execute all transfers concurrently
      const results = await Promise.all(transferPromises);

      // Count successful transfers
      const successful = results.filter((r) => r.status === 200);
      const failed = results.filter((r) => r.status !== 200);

      // SECURITY ASSERTION: Only ONE transfer should succeed
      expect(successful.length).toBe(1);
      expect(failed.length).toBe(concurrentRequests - 1);

      // Verify final balances are correct
      const sourceWallet = await db('wallets')
        .where({ id: sourceWalletId })
        .first();
      const destWallet = await db('wallets')
        .where({ id: destinationWalletId })
        .first();

      // CRITICAL: Source wallet should be exactly 0 (not negative!)
      expect(Number(sourceWallet.balance)).toBe(0);
      expect(Number(destWallet.balance)).toBe(transferAmount);

      // Verify only one transaction was recorded
      const transactions = await db('transactions').where({
        source_wallet_id: sourceWalletId,
      });
      expect(transactions.length).toBe(1);
    });

    it('should handle partial amount concurrent transfers correctly', async () => {
      const initialBalance = 100000;
      const transferAmount = 40000; // 40% of balance
      const concurrentRequests = 5;

      // Attempt 5 concurrent transfers of 40k each (200k total)
      // Only 2 should succeed (80k), then insufficient funds
      const transferPromises = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/v1/transfers')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              source_wallet_id: sourceWalletId,
              destination_wallet_id: destinationWalletId,
              amount: transferAmount,
            })
            .then((res) => ({ status: res.status }))
            .catch((err) => ({ status: err.status })),
        );

      const results = await Promise.all(transferPromises);
      const successful = results.filter((r) => r.status === 200);

      // Should allow exactly 2 successful transfers (80k total)
      expect(successful.length).toBe(2);

      // Verify balance is correct
      const sourceWallet = await db('wallets')
        .where({ id: sourceWalletId })
        .first();

      expect(Number(sourceWallet.balance)).toBe(
        initialBalance - transferAmount * 2,
      );
    });
  });

  /**
   * TEST 2: Race Condition - Concurrent Withdrawals
   *
   * Same vulnerability but for withdrawals
   */
  describe('Concurrent Withdrawal Attack', () => {
    it('should prevent overdraft when multiple concurrent withdrawals are attempted', async () => {
      const withdrawalAmount = 100000;
      const concurrentRequests = 10;

      const withdrawalPromises = Array(concurrentRequests)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/v1/withdrawals')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              wallet_id: sourceWalletId,
              amount: withdrawalAmount,
              account_number: '1234567890',
              bank_code: '058',
            })
            .then((res) => ({ status: res.status }))
            .catch((err) => ({ status: err.status })),
        );

      const results = await Promise.all(withdrawalPromises);
      const successful = results.filter((r) => r.status === 200);

      // Only ONE withdrawal should succeed
      expect(successful.length).toBe(1);

      // Verify final balance is 0 (not negative)
      const wallet = await db('wallets').where({ id: sourceWalletId }).first();
      expect(Number(wallet.balance)).toBe(0);
    });
  });

  /**
   * TEST 3: Mixed Concurrent Operations
   *
   * Mix of transfers and withdrawals happening simultaneously
   */
  describe('Mixed Concurrent Operations', () => {
    it('should handle mixed transfers and withdrawals without overdraft', async () => {
      const amount = 50000;

      const operations = [
        // 2 transfers
        request(app)
          .post('/api/v1/transfers')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            source_wallet_id: sourceWalletId,
            destination_wallet_id: destinationWalletId,
            amount,
          }),

        request(app)
          .post('/api/v1/transfers')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            source_wallet_id: sourceWalletId,
            destination_wallet_id: destinationWalletId,
            amount,
          }),

        // 2 withdrawals
        request(app)
          .post('/api/v1/withdrawals')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            wallet_id: sourceWalletId,
            amount,
            account_number: '1234567890',
            bank_code: '058',
          }),

        request(app)
          .post('/api/v1/withdrawals')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            wallet_id: sourceWalletId,
            amount,
            account_number: '1234567890',
            bank_code: '058',
          }),
      ];

      const results = await Promise.allSettled(
        operations.map((op) =>
          op
            .then((res) => ({ status: res.status }))
            .catch((err) => ({
              status: err.status,
            })),
        ),
      );

      const successful = results.filter(
        (r) => r.status === 'fulfilled' && r.value.status === 200,
      );

      // Only 2 operations should succeed (100k total)
      expect(successful.length).toBe(2);

      // Balance should be 0
      const wallet = await db('wallets').where({ id: sourceWalletId }).first();
      expect(Number(wallet.balance)).toBe(0);
    });
  });
});
