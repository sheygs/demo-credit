import express from 'express';
import request from 'supertest';
import { middlewares } from '../../src/app';
import { startServer } from '../../src/server';
import { db } from '../../src/shared';
import { Server } from 'http';

/**
 * Test Helper Utilities
 * Provides common setup and teardown functions for tests
 */

export class TestHelper {
  private static app: any;
  private static server: Server;
  private static migrationsRun = false;

  /**
   * Initialize test application
   * Returns the HTTP server (not the Express app) for supertest compatibility
   */
  static async init(): Promise<any> {
    // Run migrations once for integration/security tests
    if (!this.migrationsRun) {
      try {
        await db.migrate.latest();
        console.log('✓ Database migrations completed');
        this.migrationsRun = true;
      } catch (error) {
        console.error('Failed to run migrations:', error);
        throw error;
      }
    }

    if (!this.server) {
      const expressApp = express();
      this.app = middlewares(expressApp);
      this.server = startServer(this.app);
    }
    return this.server;
  }

  /**
   * Get the HTTP server instance (for use with supertest)
   */
  static getApp(): any {
    if (!this.server) {
      throw new Error('Server not initialized. Call TestHelper.init() first');
    }
    return this.server;
  }

  /**
   * Get the HTTP server instance
   */
  static getServer(): Server {
    if (!this.server) {
      throw new Error('Server not initialized. Call TestHelper.init() first');
    }
    return this.server;
  }

  /**
   * Cleanup and close server
   */
  static async cleanup(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
    if (db) {
      await db.destroy();
    }
  }

  /**
   * Create a test user and return auth token
   */
  static async createTestUser(
    overrides: Partial<{
      user_name: string;
      email: string;
      password: string;
      phone_number: string;
    }> = {},
  ): Promise<{
    userId: string;
    token: string;
    email: string;
    user_name: string;
  }> {
    const app = this.getApp();
    const timestamp = Date.now();

    const userData = {
      user_name: overrides.user_name || `testuser_${timestamp}`,
      email: overrides.email || `test_${timestamp}@example.com`,
      password: overrides.password || 'SecurePass123!',
      phone_number:
        overrides.phone_number || `0801234${String(timestamp).slice(-4)}`,
    };

    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(userData)
      .expect(201);

    return {
      userId: response.body.data.user.id,
      token: response.body.data.token,
      email: userData.email,
      user_name: userData.user_name,
    };
  }

  /**
   * Create a test wallet
   */
  static async createTestWallet(
    token: string,
    userId: string,
    overrides: Partial<{
      currency: string;
      balance: number;
    }> = {},
  ): Promise<{
    walletId: string;
    balance: number;
    currency: string;
  }> {
    const app = this.getApp();

    const walletData = {
      user_id: userId,
      currency: overrides.currency || 'NGN',
      balance: overrides.balance !== undefined ? overrides.balance : 100000,
    };

    const response = await request(app)
      .post('/api/v1/wallets')
      .set('Authorization', `Bearer ${token}`)
      .send(walletData)
      .expect(201);

    return {
      walletId: response.body.data.id,
      balance: response.body.data.balance,
      currency: response.body.data.currency,
    };
  }

  /**
   * Clean up test user data
   */
  static async cleanupUser(userId: string): Promise<void> {
    // Delete in order to respect foreign key constraints
    await db('transactions')
      .whereIn('source_wallet_id', function () {
        this.select('id').from('wallets').where({ user_id: userId });
      })
      .del();

    await db('transactions')
      .whereIn('destination_wallet_id', function () {
        this.select('id').from('wallets').where({ user_id: userId });
      })
      .del();

    await db('wallets').where({ user_id: userId }).del();
    await db('users').where({ id: userId }).del();
  }

  /**
   * Clean up test wallet
   */
  static async cleanupWallet(walletId: string): Promise<void> {
    await db('transactions')
      .where({ source_wallet_id: walletId })
      .orWhere({ destination_wallet_id: walletId })
      .del();
    await db('wallets').where({ id: walletId }).del();
  }

  /**
   * Get wallet balance
   */
  static async getWalletBalance(walletId: string): Promise<number> {
    const wallet = await db('wallets').where({ id: walletId }).first();
    return wallet ? Number(wallet.balance) : 0;
  }

  /**
   * Wait for a specified time (for testing race conditions)
   */
  static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Common test data generators
 */
export class TestDataGenerator {
  static generateEmail(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
  }

  static generatePhoneNumber(): string {
    const timestamp = Date.now();
    return `08012${String(timestamp).slice(-6)}`;
  }

  static generateUserName(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  static generatePassword(): string {
    return `SecurePass${Math.random().toString(36).substring(2, 5)}!123`;
  }

  static generateWalletData(userId: string, balance: number = 100000) {
    return {
      user_id: userId,
      currency: 'NGN',
      balance,
    };
  }
}
