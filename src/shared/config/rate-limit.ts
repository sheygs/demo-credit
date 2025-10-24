import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * SECURITY: Rate Limiting Configuration
 *
 * Protects against:
 * - Brute force attacks on authentication endpoints
 * - Denial of Service (DoS) attacks
 * - Excessive API usage
 * - Automated scraping/abuse
 *
 * NOTE: Rate limiting is disabled in test environment
 */

// No-op middleware for test environment
const noOpRateLimiter = (_req: Request, _res: Response, next: NextFunction) =>
  next();

// Check if in test environment
const isTestEnv = process.env.NODE_ENV === 'test';

/**
 * Strict rate limiter for authentication endpoints
 * - Login, signup, password reset
 * - Prevents brute force credential attacks
 */
export const authRateLimiter = isTestEnv
  ? noOpRateLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 requests per window
      message: {
        status: 'error',
        message:
          'Too many authentication attempts. Please try again in 15 minutes.',
      },
      standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
      legacyHeaders: false, // Disable `X-RateLimit-*` headers
      skipSuccessfulRequests: false, // Count successful requests
      skipFailedRequests: false, // Count failed requests
    });

/**
 * Moderate rate limiter for financial operations
 * - Transfers, withdrawals, deposits
 * - Prevents excessive transaction attempts
 */
export const transferRateLimiter = isTestEnv
  ? noOpRateLimiter
  : rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // 10 requests per minute
      message: {
        status: 'error',
        message:
          'Too many transfer requests. Please wait a moment before trying again.',
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
    });

/**
 * General API rate limiter
 * - All other endpoints
 * - Prevents general API abuse
 */
export const generalRateLimiter = isTestEnv
  ? noOpRateLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: {
        status: 'error',
        message: 'Too many requests. Please slow down.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

/**
 * Wallet creation rate limiter
 * - Prevents users from creating excessive wallets
 */
export const walletCreationRateLimiter = isTestEnv
  ? noOpRateLimiter
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 wallet creations per hour
      message: {
        status: 'error',
        message: 'Too many wallet creation requests. Please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
