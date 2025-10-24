/**
 * UNIT TESTS: AuthService
 *
 * Tests the AuthService class methods in isolation with mocked dependencies.
 * These tests focus on business logic and error handling without touching
 * the database or external services.
 *
 * Coverage:
 * - signUp(): User registration with blacklist verification
 * - generateToken(): JWT token generation (tested indirectly)
 * - verifyToken(): JWT token verification
 */

import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UserService } from '../../src/modules/user/user.service';
import { BlackListService } from '../../src/modules/blacklist/blacklist.service';
import {
  SecurityUtils,
  BadRequestException,
  UnprocessableEntityException,
  ForbiddenException,
  UnauthorizedException,
  Status,
} from '../../src/shared';

// Mock all dependencies
jest.mock('../../src/modules/user/user.service');
jest.mock('../../src/modules/blacklist/blacklist.service');
jest.mock('../../src/shared/utils/crypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  // Test data fixtures
  const mockUserData = {
    user_name: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    phone_number: '08012345678',
  };

  const mockCreatedUser = {
    id: 1,
    user_name: 'johndoe',
    email: 'john@example.com',
    password: 'hashed_password_here',
    phone_number: '08012345678',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRequest = {
    body: mockUserData,
  } as Request;

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.test';

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp()', () => {
    describe('Successful Signup Flow', () => {
      it('should successfully create a user and return user data with token', async () => {
        // Arrange
        (UserService.findUser as jest.Mock).mockResolvedValue(null);
        (
          BlackListService.verifyCustomerBlackListStatus as jest.Mock
        ).mockResolvedValue({
          status: Status.SUCCESS,
          data: {},
        });
        (SecurityUtils.hash as jest.Mock).mockResolvedValue(
          'hashed_password_here',
        );
        (UserService.create as jest.Mock).mockResolvedValue(mockCreatedUser);
        (jwt.sign as jest.Mock).mockReturnValue(mockToken);

        // Act
        const result = await AuthService.signUp(mockRequest);

        // Assert - verify all dependencies were called correctly
        expect(UserService.findUser).toHaveBeenCalledWith(mockUserData.email);
        expect(UserService.findUser).toHaveBeenCalledTimes(1);

        expect(
          BlackListService.verifyCustomerBlackListStatus,
        ).toHaveBeenCalledWith({
          email: mockUserData.email,
          phone_number: mockUserData.phone_number,
        });
        expect(
          BlackListService.verifyCustomerBlackListStatus,
        ).toHaveBeenCalledTimes(1);

        expect(SecurityUtils.hash).toHaveBeenCalledWith(mockUserData.password);
        expect(SecurityUtils.hash).toHaveBeenCalledTimes(1);

        expect(UserService.create).toHaveBeenCalledWith({
          ...mockUserData,
          password: 'hashed_password_here',
        });
        expect(UserService.create).toHaveBeenCalledTimes(1);

        expect(jwt.sign).toHaveBeenCalledWith(
          {
            id: mockCreatedUser.id,
            user_name: mockCreatedUser.user_name,
            email: mockCreatedUser.email,
          },
          expect.any(String), // jwtSecret
          { expiresIn: expect.any(String) },
        );
        expect(jwt.sign).toHaveBeenCalledTimes(1);

        // Assert - verify return value structure
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('token');
        expect(result.token).toBe(mockToken);
        expect(result.user).toEqual({
          id: mockCreatedUser.id,
          user_name: mockCreatedUser.user_name,
          email: mockCreatedUser.email,
          phone_number: mockCreatedUser.phone_number,
          created_at: mockCreatedUser.created_at,
          updated_at: mockCreatedUser.updated_at,
        });

        // Assert - verify password is not returned
        expect(result.user).not.toHaveProperty('password');
      });

      it('should call dependencies in correct order', async () => {
        // Arrange
        const callOrder: string[] = [];

        (UserService.findUser as jest.Mock).mockImplementation(async () => {
          callOrder.push('findUser');
          return null;
        });

        (
          BlackListService.verifyCustomerBlackListStatus as jest.Mock
        ).mockImplementation(async () => {
          callOrder.push('blacklistCheck');
          return { status: Status.SUCCESS, data: {} };
        });

        (SecurityUtils.hash as jest.Mock).mockImplementation(async () => {
          callOrder.push('hash');
          return 'hashed_password';
        });

        (UserService.create as jest.Mock).mockImplementation(async () => {
          callOrder.push('create');
          return mockCreatedUser;
        });

        (jwt.sign as jest.Mock).mockReturnValue(mockToken);

        // Act
        await AuthService.signUp(mockRequest);

        // Assert - verify correct execution order
        expect(callOrder).toEqual([
          'findUser',
          'blacklistCheck',
          'hash',
          'create',
        ]);
      });
    });

    describe('Validation Errors', () => {
      it('should throw UnprocessableEntityException when user already exists', async () => {
        // Arrange
        (UserService.findUser as jest.Mock).mockResolvedValue(mockCreatedUser);

        // Act & Assert
        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          UnprocessableEntityException,
        );

        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          'account already exists',
        );

        // Verify subsequent operations were NOT called
        expect(
          BlackListService.verifyCustomerBlackListStatus,
        ).not.toHaveBeenCalled();
        expect(SecurityUtils.hash).not.toHaveBeenCalled();
        expect(UserService.create).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when password hashing fails', async () => {
        // Arrange
        (UserService.findUser as jest.Mock).mockResolvedValue(null);
        (
          BlackListService.verifyCustomerBlackListStatus as jest.Mock
        ).mockResolvedValue({
          status: Status.SUCCESS,
          data: {},
        });
        (SecurityUtils.hash as jest.Mock).mockResolvedValue(null); // Hash failed

        // Act & Assert
        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          BadRequestException,
        );

        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          'failed to hash password',
        );

        // Verify user creation was NOT attempted
        expect(UserService.create).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
      });

      it('should throw UnprocessableEntityException when user creation fails', async () => {
        // Arrange
        (UserService.findUser as jest.Mock).mockResolvedValue(null);
        (
          BlackListService.verifyCustomerBlackListStatus as jest.Mock
        ).mockResolvedValue({
          status: Status.SUCCESS,
          data: {},
        });
        (SecurityUtils.hash as jest.Mock).mockResolvedValue('hashed_password');
        (UserService.create as jest.Mock).mockResolvedValue(null); // Creation failed

        // Act & Assert
        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          UnprocessableEntityException,
        );

        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          'unable to create user',
        );

        // Verify token was NOT generated
        expect(jwt.sign).not.toHaveBeenCalled();
      });
    });

    describe('Blacklist Verification', () => {
      it('should throw ForbiddenException when user is blacklisted', async () => {
        // Arrange
        (UserService.findUser as jest.Mock).mockResolvedValue(null);
        (
          BlackListService.verifyCustomerBlackListStatus as jest.Mock
        ).mockResolvedValue({
          status: Status.SUCCESS,
          data: { blacklisted: true }, // User is blacklisted
        });

        // Act & Assert
        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          ForbiddenException,
        );

        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          'account has been blacklisted',
        );

        // Verify subsequent operations were NOT called
        expect(SecurityUtils.hash).not.toHaveBeenCalled();
        expect(UserService.create).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
      });

      it('should throw UnauthorizedException when blacklist service returns error', async () => {
        // Arrange
        const errorMessage = 'Blacklist service unavailable';
        (UserService.findUser as jest.Mock).mockResolvedValue(null);
        (
          BlackListService.verifyCustomerBlackListStatus as jest.Mock
        ).mockResolvedValue({
          status: Status.ERROR,
          message: errorMessage,
        });

        // Act & Assert
        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          UnauthorizedException,
        );

        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          errorMessage,
        );

        // Verify subsequent operations were NOT called
        expect(SecurityUtils.hash).not.toHaveBeenCalled();
        expect(UserService.create).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
      });

      it('should proceed when blacklist returns success with empty data', async () => {
        // Arrange
        (UserService.findUser as jest.Mock).mockResolvedValue(null);
        (
          BlackListService.verifyCustomerBlackListStatus as jest.Mock
        ).mockResolvedValue({
          status: Status.SUCCESS,
          data: {}, // Empty data means not blacklisted
        });
        (SecurityUtils.hash as jest.Mock).mockResolvedValue('hashed_password');
        (UserService.create as jest.Mock).mockResolvedValue(mockCreatedUser);
        (jwt.sign as jest.Mock).mockReturnValue(mockToken);

        // Act
        const result = await AuthService.signUp(mockRequest);

        // Assert
        expect(result).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.token).toBe(mockToken);
      });
    });

    describe('Edge Cases', () => {
      it('should handle undefined blacklist data gracefully', async () => {
        // Arrange
        (UserService.findUser as jest.Mock).mockResolvedValue(null);
        (
          BlackListService.verifyCustomerBlackListStatus as jest.Mock
        ).mockResolvedValue({
          status: Status.SUCCESS,
          // data is undefined
        });
        (SecurityUtils.hash as jest.Mock).mockResolvedValue('hashed_password');
        (UserService.create as jest.Mock).mockResolvedValue(mockCreatedUser);
        (jwt.sign as jest.Mock).mockReturnValue(mockToken);

        // Act
        const result = await AuthService.signUp(mockRequest);

        // Assert
        expect(result).toBeDefined();
        expect(result.user).toBeDefined();
      });

      it('should remove password from user object before returning', async () => {
        // Arrange
        const userWithPassword = {
          ...mockCreatedUser,
          password: 'hashed_password',
        };

        (UserService.findUser as jest.Mock).mockResolvedValue(null);
        (
          BlackListService.verifyCustomerBlackListStatus as jest.Mock
        ).mockResolvedValue({
          status: Status.SUCCESS,
          data: {},
        });
        (SecurityUtils.hash as jest.Mock).mockResolvedValue('hashed_password');
        (UserService.create as jest.Mock).mockResolvedValue(userWithPassword);
        (jwt.sign as jest.Mock).mockReturnValue(mockToken);

        // Act
        const result = await AuthService.signUp(mockRequest);

        // Assert - password should be removed from returned user
        expect(result.user).not.toHaveProperty('password');
        expect(result.user.email).toBe(mockCreatedUser.email);
      });

      it('should propagate unexpected errors', async () => {
        // Arrange
        const unexpectedError = new Error('Database connection failed');
        (UserService.findUser as jest.Mock).mockRejectedValue(unexpectedError);

        // Act & Assert
        await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
          'Database connection failed',
        );
      });
    });
  });

  describe('verifyToken()', () => {
    it('should successfully verify a valid token', () => {
      // Arrange
      const validToken = 'valid.jwt.token';
      const decodedPayload = {
        id: 1,
        user_name: 'johndoe',
        email: 'john@example.com',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      // Act
      const result = AuthService.verifyToken(validToken);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        validToken,
        expect.any(String), // jwtSecret
      );
      expect(result).toEqual(decodedPayload);
    });

    it('should throw error for invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token';
      const jwtError = new Error('jwt malformed');

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      expect(() => AuthService.verifyToken(invalidToken)).toThrow(
        'jwt malformed',
      );
      expect(jwt.verify).toHaveBeenCalledWith(invalidToken, expect.any(String));
    });

    it('should throw error for expired token', () => {
      // Arrange
      const expiredToken = 'expired.jwt.token';
      const expiredError = new Error('jwt expired');

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw expiredError;
      });

      // Act & Assert
      expect(() => AuthService.verifyToken(expiredToken)).toThrow(
        'jwt expired',
      );
    });

    it('should throw error for token with invalid signature', () => {
      // Arrange
      const tamperedToken = 'tampered.jwt.token';
      const signatureError = new Error('invalid signature');

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw signatureError;
      });

      // Act & Assert
      expect(() => AuthService.verifyToken(tamperedToken)).toThrow(
        'invalid signature',
      );
    });
  });

  describe('Token Generation (Indirect Testing)', () => {
    it('should generate token with correct payload structure', async () => {
      // Arrange
      (UserService.findUser as jest.Mock).mockResolvedValue(null);
      (
        BlackListService.verifyCustomerBlackListStatus as jest.Mock
      ).mockResolvedValue({
        status: Status.SUCCESS,
        data: {},
      });
      (SecurityUtils.hash as jest.Mock).mockResolvedValue('hashed_password');
      (UserService.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      await AuthService.signUp(mockRequest);

      // Assert - verify token is generated with correct payload
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockCreatedUser.id,
          user_name: mockCreatedUser.user_name,
          email: mockCreatedUser.email,
        }),
        expect.any(String),
        expect.objectContaining({
          expiresIn: expect.any(String),
        }),
      );

      // Verify payload does NOT contain sensitive data
      const [[payload]] = (jwt.sign as jest.Mock).mock.calls;
      expect(payload).not.toHaveProperty('password');
      expect(payload).not.toHaveProperty('phone_number');
    });

    it('should include expiration time in token', async () => {
      // Arrange
      (UserService.findUser as jest.Mock).mockResolvedValue(null);
      (
        BlackListService.verifyCustomerBlackListStatus as jest.Mock
      ).mockResolvedValue({
        status: Status.SUCCESS,
        data: {},
      });
      (SecurityUtils.hash as jest.Mock).mockResolvedValue('hashed_password');
      (UserService.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      await AuthService.signUp(mockRequest);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        expect.objectContaining({
          expiresIn: expect.any(String),
        }),
      );
    });
  });
});
