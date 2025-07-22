module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      testPathIgnorePatterns: ['<rootDir>/src/**/*.integration.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*.integration.test.ts',
        '!src/__tests__/**',
      ],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/src/**/*.integration.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/integration.setup.ts'],
      testTimeout: 30000,
    },
  ],
};
