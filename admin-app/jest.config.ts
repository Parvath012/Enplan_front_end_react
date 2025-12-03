export default {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: [
    '<rootDir>/src/**/*.test.ts?(x)',
    '<rootDir>/tests/**/*.test.ts?(x)',
    '<rootDir>/tests/**/**/*.test.ts?(x)',
  ],
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // 👇 Add this line to mock federation
    '^commonApp/(.*)$': '<rootDir>/__mocks__/commonApp/$1.tsx',
    '^homeApp/(.*)$': '<rootDir>/__mocks__/homeApp/$1.tsx',
    '^budgetingApp/(.*)$': '<rootDir>/__mocks__/budgetingApp/$1.tsx',
    '^entitySetupApp/(.*)$': '<rootDir>/__mocks__/entitySetupApp/$1.tsx',
    '^dataManagementApp/(.*)$': '<rootDir>/__mocks__/dataManagementApp/$1.tsx',
  },
};
