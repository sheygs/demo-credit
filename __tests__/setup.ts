/**
 * Jest Setup File
 * Runs before all tests to configure the test environment
 */

// Load test environment variables
import dotenv from 'dotenv';
import path from 'path';

// Load .env.test file
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Set test environment variables (override if needed)
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Suppress console errors for known warnings
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress rate limiter trust proxy warning in test environment
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ERR_ERL_PERMISSIVE_TRUST_PROXY')
  ) {
    return;
  }
  originalConsoleError(...args);
};
