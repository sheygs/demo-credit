/**
 * SECURITY TESTS: Authorization Vulnerability Testing
 *
 * These tests verify that wallet ownership is properly enforced.
 * Without proper authorization checks, users can perform operations
 * on wallets they don't own (IDOR vulnerability).
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

describe('Authorization Security Tests', () => {
  let app: any;
  let attackerToken: string;
  let victimToken: string;
  let attackerId: string;
  let victimId: string;
  let attackerWalletId: string;
  let victimWalletId: string;

  beforeAll(async () => {
    app = await TestHelper.init();
  });

  beforeEach(async () => {
    // Create attacker account
    const attacker = await TestHelper.createTestUser({
      user_name: 'attacker',
    });
    attackerToken = attacker.token;
    attackerId = attacker.userId;

    // Create victim account
    const victim = await TestHelper.createTestUser({
      user_name: 'victim',
    });
    victimToken = victim.token;
    victimId = victim.userId;

    // Create attacker's wallet
    const attackerWallet = await TestHelper.createTestWallet(
      attackerToken,
      attackerId,
      { balance: 10000 },
    );
    attackerWalletId = attackerWallet.walletId;

    // Create victim's wallet with money
    const victimWallet = await TestHelper.createTestWallet(
      victimToken,
      victimId,
      { balance: 1000000 }, // NGN 1,000,000
    );
    victimWalletId = victimWallet.walletId;
  });

  afterEach(async () => {
    // Cleanup
    if (attackerId) {
      await TestHelper.cleanupUser(attackerId);
    }
    if (victimId) {
      await TestHelper.cleanupUser(victimId);
    }
  });

  afterAll(async () => {
    await TestHelper.cleanup();
  });

  /**
   * TEST 1: IDOR - Transfer from Another User's Wallet
   *
   * ATTACK: Attacker tries to transfer money from victim's wallet
   * using victim's wallet ID in the request.
   *
   * EXPECTED: Request should be rejected (401/403)
   * VULNERABLE: Transfer succeeds, attacker steals money
   */
  describe('Insecure Direct Object Reference (IDOR) Attack', () => {
    it('should reject transfer from wallet not owned by authenticated user', async () => {
      const initialVictimBalance = 1000000;
      const stolenAmount = 500000;

      // ATTACK: Attacker tries to transfer from victim's wallet to their own
      const response = await request(app)
        .post('/api/v1/transfers')
        .set('Authorization', `Bearer ${attackerToken}`) // Attacker's token
        .send({
          source_wallet_id: victimWalletId, // Victim's wallet!
          destination_wallet_id: attackerWalletId, // Attacker's wallet
          amount: stolenAmount,
        });

      // SECURITY ASSERTION: Request should be rejected
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      expect([401, 403]).toContain(response.status);

      // Verify victim's money was NOT stolen
      const victimWallet = await db('wallets')
        .where({ id: victimWalletId })
        .first();
      expect(Number(victimWallet.balance)).toBe(initialVictimBalance);

      // Verify attacker did NOT receive money
      const attackerWallet = await db('wallets')
        .where({ id: attackerWalletId })
        .first();
      expect(Number(attackerWallet.balance)).toBe(10000); // Original balance
    });

    it('should reject withdrawal from wallet not owned by authenticated user', async () => {
      const initialBalance = 1000000;

      // ATTACK: Attacker tries to withdraw from victim's wallet
      const response = await request(app)
        .post('/api/v1/withdrawals')
        .set('Authorization', `Bearer ${attackerToken}`) // Attacker's token
        .send({
          wallet_id: victimWalletId, // Victim's wallet!
          amount: 500000,
          account_number: '1234567890',
          bank_code: '058',
        });

      // Should be rejected
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect([401, 403]).toContain(response.status);

      // Verify balance unchanged
      const victimWallet = await db('wallets')
        .where({ id: victimWalletId })
        .first();
      expect(Number(victimWallet.balance)).toBe(initialBalance);
    });

    it('should reject payment initialization for wallet not owned by user', async () => {
      // ATTACK: Attacker tries to initialize payment for victim's wallet
      const response = await request(app)
        .post('/api/v1/wallets/initialize-payment')
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({
          wallet_id: victimWalletId, // Victim's wallet!
          amount: 50000,
        });

      // Should be rejected
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect([401, 403]).toContain(response.status);
    });
  });

  /**
   * TEST 2: Wallet Enumeration Attack
   *
   * Attacker tries to discover and access wallets by guessing IDs
   */
  describe('Wallet Enumeration Attack', () => {
    it('should not reveal wallet existence for unauthorized users', async () => {
      // Try to transfer from non-existent or unauthorized wallet
      const response = await request(app)
        .post('/api/v1/transfers')
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({
          source_wallet_id: '999999', // Non-existent or unauthorized
          destination_wallet_id: attackerWalletId,
          amount: 10000,
        });

      // Should fail without revealing if wallet exists
      expect(response.status).toBeGreaterThanOrEqual(400);

      // Error message should not reveal wallet existence
      // Good: "Access denied" or "Wallet not found"
      // Bad: "Wallet 999999 belongs to another user"
      if (response.body.message) {
        expect(response.body.message).not.toContain('belongs to');
      }
      if (response.body.error?.message) {
        expect(response.body.error.message).not.toContain('belongs to');
      }
    });
  });

  /**
   * TEST 3: Token Tampering
   *
   * Verify that modifying JWT claims doesn't bypass authorization
   */
  describe('Token Tampering Prevention', () => {
    it('should reject requests with invalid or tampered tokens', async () => {
      // Attempt transfer with tampered token
      const response = await request(app)
        .post('/api/v1/transfers')
        .set('Authorization', 'Bearer invalid.tampered.token')
        .send({
          source_wallet_id: victimWalletId,
          destination_wallet_id: attackerWalletId,
          amount: 50000,
        });

      expect(response.status).toBe(401);
    });

    it('should reject requests with no authorization header', async () => {
      const response = await request(app).post('/api/v1/transfers').send({
        source_wallet_id: victimWalletId,
        destination_wallet_id: attackerWalletId,
        amount: 50000,
      });

      expect(response.status).toBe(400); // or 401
    });
  });

  /**
   * TEST 4: Cross-User Transfer Authorization
   *
   * Verify that only source wallet ownership is checked
   * (destination can be any wallet)
   */
  describe('Cross-User Transfer Authorization', () => {
    it('should allow transfer TO another user wallet (legitimate use case)', async () => {
      // Attacker can send money to victim (this is OK)
      const response = await request(app)
        .post('/api/v1/transfers')
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({
          source_wallet_id: attackerWalletId, // Attacker's wallet (OK)
          destination_wallet_id: victimWalletId, // Victim's wallet (OK to send here)
          amount: 5000,
        });

      expect(response.status).toBe(200);

      // Verify transfer succeeded
      const attackerWallet = await db('wallets')
        .where({ id: attackerWalletId })
        .first();
      expect(Number(attackerWallet.balance)).toBe(5000); // 10000 - 5000

      const victimWallet = await db('wallets')
        .where({ id: victimWalletId })
        .first();
      expect(Number(victimWallet.balance)).toBe(1005000); // 1000000 + 5000
    });

    it('should reject transfer FROM another user wallet (attack)', async () => {
      // Attacker CANNOT send from victim's wallet
      const response = await request(app)
        .post('/api/v1/transfers')
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({
          source_wallet_id: victimWalletId, // Victim's wallet (NOT OK)
          destination_wallet_id: attackerWalletId,
          amount: 5000,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect([401, 403]).toContain(response.status);
    });
  });
});
