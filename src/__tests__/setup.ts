import { PrismaClient } from '@prisma/client';

// Mock Prisma for testing
jest.mock('@prisma/client', () => ({
  __esModule: true,
  PrismaClient: jest.fn().mockImplementation(() => ({
    tour: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    destination: {
      findMany: jest.fn(),
    },
    country: {
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'test-database-url';

// Global test timeout
jest.setTimeout(10000);
