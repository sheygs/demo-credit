/**
 * INTEGRATION TESTS: Authentication Endpoints
 *
 * Tests all authentication-related endpoints including:
 * - POST /auth/signup - User registration
 *
 * Tests cover:
 * - Successful operations
 * - Validation errors
 * - Business logic errors
 * - Edge cases
 * - Security requirements
 */

import request from 'supertest';
import { TestHelper, TestDataGenerator } from '../helpers/test-helper';
import { db } from '../../src/shared';

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

describe('Auth Endpoints - Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = await TestHelper.init();
  });

  afterAll(async () => {
    await TestHelper.cleanup();
  });

  describe('POST /auth/signup', () => {
    describe('Successful Signup', () => {
      it('should create a new user with valid data', async () => {
        const userData = {
          user_name: TestDataGenerator.generateUserName(),
          email: TestDataGenerator.generateEmail(),
          password: 'SecurePass123!',
          phone_number: TestDataGenerator.generatePhoneNumber(),
        };

        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send(userData)
          .expect(201);

        // Verify response structure
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data).toHaveProperty('token');

        // Verify user data
        expect(response.body.data.user.user_name).toBe(userData.user_name);
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.user).not.toHaveProperty('password'); // Password should not be returned

        // Verify token is a JWT
        expect(response.body.data.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);

        // Cleanup
        await TestHelper.cleanupUser(response.body.data.user.id);
      });

      it('should hash the password before storing', async () => {
        const userData = {
          user_name: TestDataGenerator.generateUserName(),
          email: TestDataGenerator.generateEmail(),
          password: 'SecurePass123!',
          phone_number: TestDataGenerator.generatePhoneNumber(),
        };

        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send(userData)
          .expect(201);

        // Fetch user from database
        const user = await db('users')
          .where({ id: response.body.data.user.id })
          .first();

        // Password in database should be hashed (different from plain text)
        expect(user.password).not.toBe(userData.password);
        expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash format

        // Cleanup
        await TestHelper.cleanupUser(response.body.data.user.id);
      });

      it('should accept minimum valid password (8 chars with complexity)', async () => {
        const userData = {
          user_name: TestDataGenerator.generateUserName(),
          email: TestDataGenerator.generateEmail(),
          password: 'Pass123!', // Exactly 8 characters
          phone_number: TestDataGenerator.generatePhoneNumber(),
        };

        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send(userData)
          .expect(201);

        expect(response.body.data.user).toBeDefined();

        // Cleanup
        await TestHelper.cleanupUser(response.body.data.user.id);
      });
    });

    describe('Validation Errors', () => {
      it('should reject signup with missing user_name', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            email: TestDataGenerator.generateEmail(),
            password: 'SecurePass123!',
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toContain('user_name');
      });

      it('should reject signup with missing email', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            password: 'SecurePass123!',
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toContain('email');
      });

      it('should reject signup with missing password', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            email: TestDataGenerator.generateEmail(),
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toContain('password');
      });

      it('should reject signup with invalid email format', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            email: 'invalid-email',
            password: 'SecurePass123!',
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toContain('email');
      });

      it('should reject weak password (less than 8 characters)', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            email: TestDataGenerator.generateEmail(),
            password: 'Pass1!', // 6 characters
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toContain('password');
      });

      it('should reject password without uppercase letter', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            email: TestDataGenerator.generateEmail(),
            password: 'password123!', // No uppercase
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toMatch(/uppercase/i);
      });

      it('should reject password without lowercase letter', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            email: TestDataGenerator.generateEmail(),
            password: 'PASSWORD123!', // No lowercase
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toMatch(/lowercase/i);
      });

      it('should reject password without number', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            email: TestDataGenerator.generateEmail(),
            password: 'Password!!!', // No number
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toMatch(/number/i);
      });

      it('should reject password without special character', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            email: TestDataGenerator.generateEmail(),
            password: 'Password123', // No special char
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toMatch(/special character/i);
      });

      it('should reject phone number that is too short', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            email: TestDataGenerator.generateEmail(),
            password: 'SecurePass123!',
            phone_number: '12345', // Less than 11 characters
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toContain('phone_number');
      });
    });

    describe('Business Logic Errors', () => {
      it('should reject signup with duplicate email', async () => {
        // Create first user
        const email = TestDataGenerator.generateEmail();
        const firstUser = await TestHelper.createTestUser({ email });

        // Try to create second user with same email
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: TestDataGenerator.generateUserName(),
            email, // Same email
            password: 'SecurePass123!',
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
        expect(response.body.error.message).toMatch(/already exists|email/i);

        // Cleanup
        await TestHelper.cleanupUser(firstUser.userId);
      });
    });

    describe('Rate Limiting', () => {
      // NOTE: Rate limiting is disabled in test environment for performance
      // This test is skipped but kept for documentation purposes
      it.skip('should enforce rate limiting after 5 signup attempts', async () => {
        const requests = [];

        // Make 6 signup requests
        for (let i = 0; i < 6; i++) {
          const promise = request(app).post('/api/v1/auth/signup').send({
            user_name: TestDataGenerator.generateUserName(),
            email: TestDataGenerator.generateEmail(),
            password: 'SecurePass123!',
            phone_number: TestDataGenerator.generatePhoneNumber(),
          });

          requests.push(promise);
        }

        const responses = await Promise.all(requests);

        // First 5 should succeed or fail for business reasons (not rate limit)
        const firstFive = responses.slice(0, 5);
        firstFive.forEach((response) => {
          expect([201, 400, 403]).toContain(response.status);
        });

        // 6th should be rate limited
        const sixth = responses[5];
        expect(sixth.status).toBe(429);
        expect(sixth.body.message).toMatch(/too many|rate limit/i);

        // Cleanup successful signups
        const cleanupPromises = responses
          .filter(
            (response) =>
              response.status === 201 && response.body.data?.user?.id,
          )
          .map((response) =>
            TestHelper.cleanupUser(response.body.data.user.id),
          );

        await Promise.all(cleanupPromises);
      }, 30000); // Longer timeout for rate limiting test
    });

    describe('Edge Cases', () => {
      it('should handle very long user names', async () => {
        const userData = {
          user_name: 'a'.repeat(50), // Max length
          email: TestDataGenerator.generateEmail(),
          password: 'SecurePass123!',
          phone_number: TestDataGenerator.generatePhoneNumber(),
        };

        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send(userData)
          .expect(201);

        expect(response.body.data.user.user_name).toBe(userData.user_name);

        // Cleanup
        await TestHelper.cleanupUser(response.body.data.user.id);
      });

      it('should reject user names that are too long', async () => {
        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send({
            user_name: 'a'.repeat(51), // Too long
            email: TestDataGenerator.generateEmail(),
            password: 'SecurePass123!',
            phone_number: TestDataGenerator.generatePhoneNumber(),
          })
          .expect(422);

        expect(response.body.status).toBe('failure');
      });

      it('should trim and accept emails with whitespace', async () => {
        const email = TestDataGenerator.generateEmail();
        const userData = {
          user_name: TestDataGenerator.generateUserName(),
          email: `  ${email}  `, // Whitespace around email
          password: 'SecurePass123!',
          phone_number: TestDataGenerator.generatePhoneNumber(),
        };

        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send(userData)
          .expect(201);

        expect(response.body.data.user.email).toBe(email.trim());

        // Cleanup
        await TestHelper.cleanupUser(response.body.data.user.id);
      });
    });
  });
});
