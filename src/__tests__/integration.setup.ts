const { config } = require('dotenv');
const path = require('path');

// Load test environment variables
config({ path: path.resolve(__dirname, '../../.env.test') });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-integration-tests';

// Global test timeout for integration tests
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting integration tests...');
  console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
});

afterAll(async () => {
  console.log('✅ Integration tests completed');
});
