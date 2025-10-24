# Test Suite Documentation

This directory contains all tests for the Demo Credit application, organized by test type and purpose.

## Directory Structure

```
__tests__/
├── unit/                   # Unit tests (mocked dependencies)
│   ├── auth.test.ts       # AuthService unit tests
│   ├── wallet.test.ts     # WalletService unit tests
│   └── axios.test.ts      # Axios utility unit tests
├── integration/            # Integration tests (full HTTP stack)
│   └── auth.integration.test.ts  # Auth endpoints integration tests
├── security/               # Security-focused tests
│   ├── race-condition.test.ts    # Race condition vulnerability tests
│   └── authorization.test.ts     # Authorization & IDOR tests
├── helpers/                # Test utilities
│   └── test-helper.ts     # Reusable test helper functions
└── app.test.ts            # Application health tests
```

## Test Types

### 1. Unit Tests (`__tests__/unit/`)

**Purpose:** Test individual functions/methods in isolation with mocked dependencies.

**Characteristics:**
- Fast execution
- No database or external services
- Use Jest mocks
- Focus on business logic

**Example:**
```typescript
// Tests WalletService.createWallet() with mocked UserModel and WalletModel
it('should create a wallet for a valid user', async () => {
  (UserModel.findBy as jest.Mock).mockResolvedValueOnce({ id: user_id });
  (WalletModel.create as jest.Mock).mockResolvedValueOnce(payload);

  const wallet = await WalletService.createWallet(payload);

  expect(wallet).toEqual(payload);
});
```

**Run unit tests:**
```bash
npm test -- __tests__/unit/
```

---

### 2. Integration Tests (`__tests__/integration/`)

**Purpose:** Test complete HTTP request/response cycles with real database.

**Characteristics:**
- Tests full stack (routes → controllers → services → database)
- Uses real database (test environment)
- Uses `supertest` for HTTP requests
- Tests validation, business logic, and error handling

**Example:**
```typescript
// Tests POST /auth/signup endpoint end-to-end
it('should create a new user with valid data', async () => {
  const response = await request(app)
    .post('/auth/signup')
    .send(userData)
    .expect(201);

  expect(response.body.data.user.email).toBe(userData.email);
});
```

**Run integration tests:**
```bash
npm test -- __tests__/integration/
```

---

### 3. Security Tests (`__tests__/security/`)

**Purpose:** Verify security vulnerabilities are fixed and cannot be exploited.

**Tests include:**

#### Race Condition Tests
- Concurrent transfer attempts
- Concurrent withdrawal attempts
- Mixed concurrent operations
- Verifies SELECT...FOR UPDATE prevents overdrafts

#### Authorization Tests (IDOR)
- Unauthorized wallet access attempts
- Cross-user transfer attacks
- Token tampering tests
- Wallet enumeration tests

**Example:**
```typescript
// Tests that concurrent transfers cannot overdraft account
it('should prevent overdraft when multiple concurrent transfers are attempted', async () => {
  const promises = Array(10).fill(null).map(() =>
    request(app).post('/transfer').send({ amount: 100000 })
  );

  const results = await Promise.all(promises);
  const successful = results.filter(r => r.status === 200);

  expect(successful.length).toBe(1); // Only ONE succeeds
});
```

**Run security tests:**
```bash
npm test -- __tests__/security/
```

---

### 4. Test Helpers (`__tests__/helpers/`)

**Purpose:** Reusable utilities to reduce test boilerplate.

**Utilities provided:**

#### TestHelper Class
```typescript
// Initialize test app
await TestHelper.init();

// Create test user with auth token
const { userId, token } = await TestHelper.createTestUser();

// Create test wallet
const { walletId } = await TestHelper.createTestWallet(token, userId);

// Cleanup test data
await TestHelper.cleanupUser(userId);

// Get wallet balance
const balance = await TestHelper.getWalletBalance(walletId);
```

#### TestDataGenerator Class
```typescript
// Generate unique test data
const email = TestDataGenerator.generateEmail();
const phone = TestDataGenerator.generatePhoneNumber();
const username = TestDataGenerator.generateUserName();
const password = TestDataGenerator.generatePassword();
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm test -- __tests__/unit/

# Integration tests only
npm test -- __tests__/integration/

# Security tests only
npm test -- __tests__/security/

# Specific test file
npm test -- __tests__/security/race-condition.test.ts
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

---

## Writing New Tests

### Integration Test Template

```typescript
import request from 'supertest';
import { Express } from 'express';
import { TestHelper } from '../helpers/test-helper';

describe('Your Feature - Integration Tests', () => {
  let app: Express;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    app = await TestHelper.init();
  });

  beforeEach(async () => {
    const user = await TestHelper.createTestUser();
    token = user.token;
    userId = user.userId;
  });

  afterEach(async () => {
    await TestHelper.cleanupUser(userId);
  });

  afterAll(async () => {
    await TestHelper.cleanup();
  });

  it('should do something', async () => {
    const response = await request(app)
      .post('/your-endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: 'test' })
      .expect(200);

    expect(response.body).toBeDefined();
  });
});
```

### Unit Test Template

```typescript
import { YourService } from '../src/modules';

jest.mock('../src/modules/your-model');

describe('YourService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    (YourModel.someMethod as jest.Mock).mockResolvedValueOnce(mockData);

    // Act
    const result = await YourService.doSomething();

    // Assert
    expect(result).toEqual(expectedResult);
    expect(YourModel.someMethod).toHaveBeenCalledWith(expectedArgs);
  });
});
```

---

## Test Best Practices

### 1. Test Naming
Use descriptive test names that explain the behavior:

✅ **Good:**
```typescript
it('should reject transfer when source wallet has insufficient funds', async () => {
```

❌ **Bad:**
```typescript
it('test transfer', async () => {
```

### 2. Arrange-Act-Assert Pattern
Structure tests clearly:

```typescript
it('should do something', async () => {
  // Arrange - Set up test data
  const user = await TestHelper.createTestUser();

  // Act - Execute the action
  const response = await request(app).post('/endpoint').send(data);

  // Assert - Verify the outcome
  expect(response.status).toBe(200);
});
```

### 3. Cleanup Test Data
Always clean up after tests:

```typescript
afterEach(async () => {
  await TestHelper.cleanupUser(userId);
});
```

### 4. Use Test Helpers
Don't repeat yourself - use helpers:

✅ **Good:**
```typescript
const user = await TestHelper.createTestUser();
```

❌ **Bad:**
```typescript
const response = await request(app).post('/auth/signup').send({
  user_name: 'test',
  email: 'test@example.com',
  password: 'SecurePass123!',
  phone_number: '08012345678'
});
```

### 5. Test Edge Cases
Don't just test the happy path:

- ✅ Valid input (happy path)
- ✅ Invalid input (validation errors)
- ✅ Missing input
- ✅ Boundary conditions (min/max values)
- ✅ Concurrent operations
- ✅ Error conditions

### 6. Avoid Test Interdependence
Each test should be independent:

❌ **Bad:**
```typescript
// Test 2 depends on Test 1
it('test 1: create user', async () => { userId = ... });
it('test 2: update user', async () => { /* uses userId from test 1 */ });
```

✅ **Good:**
```typescript
it('test 1: create user', async () => {
  const userId = await createUser();
  // test and cleanup
});

it('test 2: update user', async () => {
  const userId = await createUser(); // Create own user
  // test and cleanup
});
```

---

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Main branch merges

CI will fail if:
- Any test fails
- Code coverage drops below threshold
- Linting errors exist

---

## Test Coverage Goals

| Type | Target Coverage |
|------|-----------------|
| Statements | > 80% |
| Branches | > 75% |
| Functions | > 80% |
| Lines | > 80% |

View coverage report:
```bash
npm run test:cov
open coverage/lcov-report/index.html
```

---

## Debugging Tests

### Run Single Test
```bash
npm test -- -t "should create a new user"
```

### Debug with VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Verbose Output
```bash
npm test -- --verbose
```

---

## Common Issues & Solutions

### Issue: Tests fail with database connection error
**Solution:** Ensure test database is configured in `.env.test`

### Issue: Tests timeout
**Solution:** Increase timeout in test file:
```typescript
it('slow test', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Issue: Tests pass locally but fail in CI
**Solution:** Check environment variables and database state

### Issue: Flaky tests (sometimes pass, sometimes fail)
**Solution:** Usually indicates race conditions or shared state. Use `beforeEach` to reset state.

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

## Questions?

For questions about tests, contact the development team or create an issue in the repository.
