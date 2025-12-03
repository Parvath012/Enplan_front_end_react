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
    '^.+\\.[tj]sx?$': 'ts-jest', // handle ts/tsx/js/jsx
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(screenfull)/)',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
